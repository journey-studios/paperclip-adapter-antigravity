// Runs against the built bundle (npm run build first): the src tests need the
// Paperclip monorepo to resolve adapter-utils, the bundle does not.
import assert from "node:assert/strict"
import { test } from "node:test"
import { createServerAdapter } from "../dist/index.js"

test("agy_local declares the operator Retry capability", () => {
  const adapter = createServerAdapter()
  assert.equal(adapter.type, "agy_local")
  assert.equal(adapter.supportsExplicitRetry, true)
})

test("the existing local-agent contract is unchanged", () => {
  const adapter = createServerAdapter()
  assert.equal(adapter.supportsLocalAgentJwt, true)
  assert.equal(adapter.supportsInstructionsBundle, true)
  assert.equal(adapter.instructionsPathKey, "instructionsFilePath")
})
