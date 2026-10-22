// Runs against the built bundle (npm run build first), with a fake agy that prints a
// recorded stream-json run: the src tests need the Paperclip monorepo to resolve
// adapter-utils, the bundle does not.
import assert from "node:assert/strict"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { test } from "node:test"
import { execute } from "../dist/server/index.js"

const ANSWER = "Pending decisions:\n\n1. **JOU-551** - production deploy\n2. **JOU-90** - Telegram canary"

const streamJson = (result) =>
  [
    { event: "init", conversation_id: "conv-1", init: { cwd: "/tmp", tools: [], permission_mode: "always-proceed" } },
    {
      event: "step_update",
      step_update: { conversation_id: "conv-1", step_index: 1, state: "ACTIVE", step_type: "agent_response", text_delta: ANSWER },
    },
    { event: "result", result: { conversation_id: "conv-1", num_turns: 1, ...result } },
  ]
    .map((line) => JSON.stringify(line))
    .join("\n")

const runAgent = async (stdout, exitCode = 0) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "fake-agy-"))
  const fixture = path.join(dir, "out.ndjson")
  fs.writeFileSync(fixture, `${stdout}\n`)
  const command = path.join(dir, "agy")
  fs.writeFileSync(
    command,
    `#!/usr/bin/env node\nprocess.stdin.resume()\nprocess.stdin.on("end", () => {})\nprocess.stdout.write(require("node:fs").readFileSync(${JSON.stringify(fixture)}, "utf8"))\nsetTimeout(() => process.exit(${exitCode}), 50)\n`,
    { mode: 0o755 },
  )
  try {
    return await execute({
      runId: "run-final-response",
      agent: { id: "agent-1", companyId: "company-1", name: "Test Agent", adapterType: "agy_local", adapterConfig: {} },
      runtime: { sessionId: null, sessionParams: null, sessionDisplayId: null, taskKey: null },
      config: { command },
      context: { paperclipWorkspace: { cwd: dir } },
      onLog: async () => {},
    })
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
}

test("a successful run marks the whole answer as the final response, not just its first line", async () => {
  const result = await runAgent(streamJson({ status: "SUCCESS", response: `${ANSWER}\n` }))
  assert.equal(result.exitCode, 0)
  assert.equal(result.summary, "Pending decisions:")
  assert.equal(result.resultJson.finalResponseDisposition, "final")
  assert.equal(result.resultJson.finalResponseText, ANSWER)
})

test("a failed run is never marked as a final response", async () => {
  const result = await runAgent(streamJson({ status: "ERROR", error: "boom", response: ANSWER }), 1)
  assert.equal(result.exitCode, 1)
  assert.equal("finalResponseDisposition" in result.resultJson, false)
  assert.equal("finalResponseText" in result.resultJson, false)
})

test("streamed assistant text without a terminal response is not marked as final", async () => {
  const result = await runAgent(streamJson({ status: "SUCCESS" }))
  assert.equal(result.exitCode, 0)
  assert.equal(result.summary, "Pending decisions:")
  assert.equal("finalResponseDisposition" in result.resultJson, false)
  assert.equal("finalResponseText" in result.resultJson, false)
})
