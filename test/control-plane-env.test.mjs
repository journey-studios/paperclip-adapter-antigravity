// Runs against the built bundle (npm run build first). The fake agy writes the env it was started with, so the test
// sees exactly what an agent could print with `env` and send to its model provider.
import assert from "node:assert/strict"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { test } from "node:test"
import { execute } from "../dist/server/index.js"

const SERVER_SECRETS = {
  PAPERCLIP_AGENT_JWT_SECRET: "server-jwt-secret",
  PAPERCLIP_TOOL_ACTION_SIGNING_SECRET: "server-tool-action-secret",
  BETTER_AUTH_SECRET: "server-auth-secret",
  DATABASE_URL: "postgres://control-plane",
}

test("an agent process never receives the server's control-plane secrets", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "fake-agy-env-"))
  const envFile = path.join(dir, "env.json")
  const command = path.join(dir, "agy")
  const result = JSON.stringify({ event: "result", result: { conversation_id: "conv-1", num_turns: 1, status: "SUCCESS" } })
  fs.writeFileSync(
    command,
    `#!/usr/bin/env node\nrequire("node:fs").writeFileSync(${JSON.stringify(envFile)}, JSON.stringify(process.env))\nprocess.stdout.write(${JSON.stringify(`${result}\n`)})\n`,
    { mode: 0o755 },
  )
  const previous = Object.fromEntries(Object.keys(SERVER_SECRETS).map((key) => [key, process.env[key]]))
  Object.assign(process.env, SERVER_SECRETS)
  try {
    const run = await execute({
      runId: "run-control-plane-env",
      agent: { id: "agent-1", companyId: "company-1", name: "Test Agent", adapterType: "agy_local", adapterConfig: {} },
      runtime: { sessionId: null, sessionParams: null, sessionDisplayId: null, taskKey: null },
      config: { command },
      context: { paperclipWorkspace: { cwd: dir } },
      authToken: "run-scoped-agent-token",
      onLog: async () => {},
    })
    assert.equal(run.exitCode, 0)
    const childEnv = JSON.parse(fs.readFileSync(envFile, "utf8"))
    for (const key of Object.keys(SERVER_SECRETS)) {
      assert.equal(childEnv[key], undefined, `${key} reached the agent process`)
    }
    assert.equal(childEnv.PAPERCLIP_API_KEY, "run-scoped-agent-token")
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
    fs.rmSync(dir, { recursive: true, force: true })
  }
})
