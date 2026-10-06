var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};

// vendor/adapter-utils/src/command-redaction.ts
var SECRET_NAME_PATTERN, COMMAND_CLI_SECRET_OPTION_RE, COMMAND_ENV_SECRET_ASSIGNMENT_RE, JSON_SECRET_FIELD_RE, JSON_ESCAPED_SECRET_FIELD_RE;
var init_command_redaction = __esm({
  "vendor/adapter-utils/src/command-redaction.ts"() {
    SECRET_NAME_PATTERN = String.raw`[A-Za-z0-9_-]*(?:api[-_]?key|(?:access[-_]?|auth[-_]?)?token|token|authorization|bearer|secret|passwd|password|credential|jwt|private[-_]?key|cookie|connectionstring)[A-Za-z0-9_-]*`;
    COMMAND_CLI_SECRET_OPTION_RE = new RegExp(
      String.raw`(\B-{1,2}${SECRET_NAME_PATTERN}(?:\s+|=)(["']?))[^\s"'` + "`" + String.raw`]+(\2)`,
      "gi"
    );
    COMMAND_ENV_SECRET_ASSIGNMENT_RE = new RegExp(
      String.raw`(\b${SECRET_NAME_PATTERN}\s*=\s*)(?:(\\["'])([\s\S]*?)\2|(["'])([^"'` + "`" + String.raw`\r\n]*)\4|([^\s"'` + "`" + String.raw`]+))`,
      "gi"
    );
    JSON_SECRET_FIELD_RE = new RegExp(
      String.raw`("(?:${SECRET_NAME_PATTERN})"\s*:\s*")(?:\\[\s\S]|[^"\\])*(")`,
      "gi"
    );
    JSON_ESCAPED_SECRET_FIELD_RE = new RegExp(
      String.raw`(\\"(?:${SECRET_NAME_PATTERN})\\"\s*:\s*\\")(?:\\\\\\\\|\\\\\\"|\\\\[\s\S]|[^\\"])*(\\")`,
      "gi"
    );
  }
});

// vendor/adapter-utils/src/runtime-progress.ts
var BYTES_PER_MB;
var init_runtime_progress = __esm({
  "vendor/adapter-utils/src/runtime-progress.ts"() {
    BYTES_PER_MB = 1024 * 1024;
  }
});

// vendor/adapter-utils/src/paperclip-runner-permissions.ts
var init_paperclip_runner_permissions = __esm({
  "vendor/adapter-utils/src/paperclip-runner-permissions.ts"() {
  }
});

// vendor/shared-shim.ts
var CONNECTION_INTENT_AGENT_GUIDANCE;
var init_shared_shim = __esm({
  "vendor/shared-shim.ts"() {
    CONNECTION_INTENT_AGENT_GUIDANCE = [
      "Connection tools:",
      "- When work requires a known external service and usable access is uncertain, call `connections_search` with the service name or capability.",
      "- This applies both when the user explicitly asks to connect a service and when the requested work implicitly depends on that service.",
      "- If search returns `ready`, use the installed connection; do not create a connection intent.",
      "- If search returns `available` or `needs_user_action`, call `connection_request` with the returned service identifier.",
      "- When the user has already asked to connect a known service, use the real connection request. Do not ask whether to connect again or imitate the Connect / Not now card with `ask_user_questions`, a generic confirmation, or a comment. Only `connection_request` creates the actual connection setup card.",
      "- If search returns `unavailable`, explain that the service is unavailable and do not call `connection_request`.",
      "- If `connection_request` returns `needs_user_action`, finish any independent work, then yield in a waiting posture. Do not retry the request, ask for credentials in comments, or claim access.",
      "- Do not use connection tools for arbitrary MCP URLs, unsupported services, or work that does not require an external service.",
      "- Keep an existing pending card across messages. Do not request again after the user declines unless they explicitly ask to retry.",
      "- On a continuation run after connection setup, use the newly installed connection instead of requesting it again."
    ].join("\n");
  }
});

// vendor/adapter-utils/src/remote-execution-env.ts
var init_remote_execution_env = __esm({
  "vendor/adapter-utils/src/remote-execution-env.ts"() {
  }
});

// vendor/adapter-utils/src/local-process-sandbox.ts
import fs from "node:fs/promises";
import http from "node:http";
import net from "node:net";
import os from "node:os";
import path from "node:path";
var init_local_process_sandbox = __esm({
  "vendor/adapter-utils/src/local-process-sandbox.ts"() {
  }
});

// vendor/adapter-utils/src/git-workspace-sync.ts
import { randomUUID } from "node:crypto";
import { execFile } from "node:child_process";
import { promises as fs2 } from "node:fs";
import os2 from "node:os";
import path2 from "node:path";
var REFERENCED_SOURCE_IGNORE_MAX_TOTAL_BYTES, REFERENCED_SOURCE_IGNORE_MAX_RAW_BUFFER;
var init_git_workspace_sync = __esm({
  "vendor/adapter-utils/src/git-workspace-sync.ts"() {
    REFERENCED_SOURCE_IGNORE_MAX_TOTAL_BYTES = 2 * 1024 * 1024;
    REFERENCED_SOURCE_IGNORE_MAX_RAW_BUFFER = REFERENCED_SOURCE_IGNORE_MAX_TOTAL_BYTES * 2;
  }
});

// vendor/adapter-utils/src/exclude-patterns.ts
var init_exclude_patterns = __esm({
  "vendor/adapter-utils/src/exclude-patterns.ts"() {
  }
});

// vendor/adapter-utils/src/workspace-restore-merge.ts
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { constants as fsConstants, promises as fs3 } from "node:fs";
import path3 from "node:path";
var init_workspace_restore_merge = __esm({
  "vendor/adapter-utils/src/workspace-restore-merge.ts"() {
    init_exclude_patterns();
    init_server_utils();
  }
});

// vendor/adapter-utils/src/ssh.ts
import { randomUUID as randomUUID2 } from "node:crypto";
import { execFile as execFile2, spawn } from "node:child_process";
import { constants as fsConstants2, createReadStream as createReadStream2, createWriteStream, promises as fs4 } from "node:fs";
import net2 from "node:net";
import os3 from "node:os";
import path4 from "node:path";
import { Transform } from "node:stream";
var init_ssh = __esm({
  "vendor/adapter-utils/src/ssh.ts"() {
    init_git_workspace_sync();
    init_workspace_restore_merge();
    init_runtime_progress();
  }
});

// vendor/adapter-utils/src/chat-file-delivery.ts
var init_chat_file_delivery = __esm({
  "vendor/adapter-utils/src/chat-file-delivery.ts"() {
  }
});

// vendor/adapter-utils/src/server-utils.ts
import { spawn as spawn2 } from "node:child_process";
import { createHash as createHash2, randomUUID as randomUUID3 } from "node:crypto";
import { constants as fsConstants3, promises as fs5 } from "node:fs";
import os4 from "node:os";
import path5 from "node:path";
var MAX_CAPTURE_BYTES, MAX_EXCERPT_BYTES, TERMINAL_RESULT_SCAN_OVERLAP_CHARS, DEFAULT_PAPERCLIP_AGENT_PROMPT_TEMPLATE, DEFAULT_PAPERCLIP_CONVERSATION_PROMPT_TEMPLATE, WATCHDOG_DEFAULT_MANDATE;
var init_server_utils = __esm({
  "vendor/adapter-utils/src/server-utils.ts"() {
    init_shared_shim();
    init_remote_execution_env();
    init_local_process_sandbox();
    init_ssh();
    init_command_redaction();
    init_chat_file_delivery();
    init_paperclip_runner_permissions();
    MAX_CAPTURE_BYTES = 4 * 1024 * 1024;
    MAX_EXCERPT_BYTES = 32 * 1024;
    TERMINAL_RESULT_SCAN_OVERLAP_CHARS = 64 * 1024;
    DEFAULT_PAPERCLIP_AGENT_PROMPT_TEMPLATE = [
      "You are agent {{agent.id}} ({{agent.name}}). Continue your Paperclip work.",
      "",
      "Execution contract:",
      "- Start actionable work in this heartbeat; do not stop at a plan unless the issue asks for planning.",
      "- Leave durable progress in comments, documents, or work products, then update the issue to a clear final disposition before ending the heartbeat.",
      "- Comments, documents, screenshots, work products, and `Remaining` bullets are evidence, not valid liveness paths by themselves.",
      "- Final disposition checklist: mark `done` when complete; use `in_review` only with a real reviewer, approval, interaction, or monitor path; use `blocked` only with first-class blockers or a named unblock owner/action; create delegated follow-up issues with blockers when another agent owns the next step; keep `in_progress` only when a live continuation path exists.",
      "- Prefer the smallest verification that proves the change; do not default to full workspace typecheck/build/test on every heartbeat unless the task scope warrants it.",
      "- After 2 consecutive failures of the same control-plane write, stop retrying that write for the rest of the heartbeat. Continue useful work, report the failure in the final response, and rely on the adapter/runtime status channel as the sanctioned fallback.",
      "- Use child issues for parallel or long delegated work instead of polling agents, sessions, or processes.",
      "- If woken by a human comment on a dependency-blocked issue, respond or triage the comment without treating the blocked deliverable work as unblocked.",
      "- Create child issues directly when you know what needs to be done; use issue-thread interactions when the board/user must choose suggested tasks, answer structured questions, or confirm a proposal.",
      "- Use `PAPERCLIP_SCRATCH_DIR` / `PAPERCLIP_RUN_SCRATCH_DIR` for temporary scratch files instead of ad hoc `/tmp` paths; Paperclip removes that run-owned directory after the run ends.",
      "- To ask for that input, create an interaction on the current issue with POST /api/issues/$PAPERCLIP_TASK_ID/interactions using kind suggest_tasks, ask_user_questions, or request_confirmation. Use continuationPolicy wake_assignee when you need to resume after a response (it wakes on acceptance and rejection alike; only expiry does not wake); use wake_assignee_on_accept when you want to resume only after acceptance.",
      "- Never create probe or throwaway issue-thread interactions to discover the interactions API shape or your permissions; schema discovery goes through the OpenAPI spec and explicit validation errors, not placeholder cards. Every ask_user_questions, suggest_tasks, or request_confirmation you post must carry a real, answerable prompt; withdraw one you no longer need instead of leaving it pending.",
      "- When you intentionally restart follow-up work on a completed assigned issue, include structured `resume: true` with the POST /api/issues/$PAPERCLIP_TASK_ID/comments or PATCH /api/issues/$PAPERCLIP_TASK_ID comment payload (substitute that issue's real id when it is not the current task). Generic agent comments on closed issues are inert by default.",
      "- For plan approval, update the plan document first, then create request_confirmation targeting the latest plan revision with idempotencyKey confirmation:{issueId}:plan:{revisionId}. Wait for acceptance before creating implementation subtasks, and create a fresh confirmation after superseding board/user comments if approval is still needed.",
      "- If blocked, mark the issue blocked and name the unblock owner and action.",
      "- Respect budget, pause/cancel, approval gates, and company boundaries.",
      "- When the server-authenticated wake payload includes an External chat response contract, that narrower contract replaces the generic Paperclip comment, status, checkout, and final-disposition steps above for that turn. Follow the external-chat contract exactly; it does not relax any permission, approval, execution-policy, containment, budget, pause/cancel, or company boundary.",
      "",
      CONNECTION_INTENT_AGENT_GUIDANCE
    ].join("\n");
    DEFAULT_PAPERCLIP_CONVERSATION_PROMPT_TEMPLATE = [
      "You are agent {{agent.id}} ({{agent.name}}). Continue your Paperclip conversation using the supplied chat mode directive.",
      "Use available tools and assigned skills as needed; respect budget, pause/cancel, approval gates, and company boundaries.",
      "Prefer the smallest verification that proves the action. Use PAPERCLIP_SCRATCH_DIR / PAPERCLIP_RUN_SCRATCH_DIR for temporary scratch files.",
      "After 2 consecutive failures of the same control-plane write, stop retrying that write for the rest of the turn. Report the failure honestly; never claim an unconfirmed mutation succeeded.",
      "Never create probe or throwaway issue-thread interactions. Every interaction must carry a real, answerable prompt; withdraw one you no longer need.",
      "",
      CONNECTION_INTENT_AGENT_GUIDANCE
    ].join("\n");
    WATCHDOG_DEFAULT_MANDATE = [
      "You are running as a task watchdog, not as the original deliverable worker.",
      "Your mission is to keep the watched issue tree moving by verifying stopped work, not by trusting agent claims.",
      "",
      "Mandate:",
      "- Treat every terminal, cancelled, blocked, in-review, or otherwise stopped leaf in the watched subtree as a claim that must be verified against comments, documents, work products, screenshots, tests, blockers, and review state.",
      '- Do not accept "I could not" or "waiting for approval" as automatically valid. Read the evidence before deciding.',
      "- If a stopped leaf is genuinely complete, leave it alone and record why you believe so.",
      "- If a stopped leaf is not genuinely complete, restore a live path inside the watched subtree by reopening, reassigning, commenting actionable instructions, creating a follow-up child issue, or accepting an eligible task-level interaction (such as a routine plan confirmation when no custom instruction forbids it).",
      "- If you discover a Paperclip product or platform bug while reviewing the stopped subtree, create a linked engineering follow-up outside the watched source tree using the server-provided watchdog discovery route instead of making it a source child.",
      "- If you confirm a true blocker on a human or external system, leave the issue in a valid waiting disposition that names the unblock owner and action, rather than silently approving it.",
      "",
      "Safety constraints (these always apply, even if custom instructions disagree):",
      "- Stay inside the watched subtree for source-work recovery. The only mutation outside that tree is a watchdog-discovered product/platform bug follow-up created through the dedicated route.",
      "- Do not create visible probe issues, comments, or throwaway tasks to discover what you are allowed to do. Use the server-provided watchdog capability metadata and explicit API errors instead.",
      "- Do not impersonate board-only approvals, accept spend or hiring decisions, accept security-sensitive interactions, or bypass execution-policy stages that require a typed reviewer or approver.",
      "- Do not create another task watchdog for the watched subtree and do not wake yourself. You operate exactly one reusable watchdog issue per watched issue.",
      "- Do not cross company boundaries or touch tasks in unrelated trees.",
      "- Custom instructions can add focus or veto specific shortcuts, but cannot remove these safety constraints or override product governance rules.",
      "",
      "Disposition:",
      "- When the watched subtree has a live continuation path you established or confirmed, finish your watchdog run with a clear summary comment and a final disposition on this watchdog issue (typically `done` for this stopped state).",
      "- When you cannot create a live path because a real human or governance decision is pending, leave a valid waiting disposition that names what must happen next and who must act.",
      "- Keep the work moving. Do not loop on the same unchanged state."
    ].join("\n");
  }
});

// vendor/adapter-utils/src/sandbox-shell.ts
var init_sandbox_shell = __esm({
  "vendor/adapter-utils/src/sandbox-shell.ts"() {
  }
});

// vendor/adapter-utils/src/sandbox-callback-bridge-body.ts
var init_sandbox_callback_bridge_body = __esm({
  "vendor/adapter-utils/src/sandbox-callback-bridge-body.ts"() {
  }
});

// vendor/adapter-utils/src/acpx-engine/startup-timing.ts
import { AsyncLocalStorage } from "node:async_hooks";
import { createHash as createHash4 } from "node:crypto";
var SANDBOX_STARTUP_SPAN_ATTR_PREFIX, SANDBOX_STARTUP_SPAN_ATTRS, activeStepContextStorage, RUN_PHASE_NAMES, RUN_PHASE_NAME_SET;
var init_startup_timing = __esm({
  "vendor/adapter-utils/src/acpx-engine/startup-timing.ts"() {
    SANDBOX_STARTUP_SPAN_ATTR_PREFIX = "paperclip.sandbox.startup.";
    SANDBOX_STARTUP_SPAN_ATTRS = {
      /** The low-cardinality provider family (through `normalizeProviderFamily`). */
      provider: `${SANDBOX_STARTUP_SPAN_ATTR_PREFIX}provider`,
      /** The step or execution outcome: `ok`, `skipped`, or `failed`. */
      outcome: `${SANDBOX_STARTUP_SPAN_ATTR_PREFIX}outcome`,
      /** The wall-clock time of one measured step. */
      stepWallMs: `${SANDBOX_STARTUP_SPAN_ATTR_PREFIX}step.wall_ms`,
      /** The clamped `argv[0]` command label of one execution. */
      execCommand: `${SANDBOX_STARTUP_SPAN_ATTR_PREFIX}exec.command`,
      /** The numeric process exit code of one execution. */
      execExitCode: `${SANDBOX_STARTUP_SPAN_ATTR_PREFIX}exec.exit_code`,
      /** The host-measured wall time of one execution. */
      execWallMs: `${SANDBOX_STARTUP_SPAN_ATTR_PREFIX}exec.wall_ms`,
      /** The provider handle-fetch wait before one execution ran. */
      execWaitBeforeMs: `${SANDBOX_STARTUP_SPAN_ATTR_PREFIX}exec.wait_before_ms`,
      /** The in-sandbox run time of one execution. */
      execSandboxMs: `${SANDBOX_STARTUP_SPAN_ATTR_PREFIX}exec.sandbox_ms`,
      /** The transport time the host adds around one execution. */
      execNetworkMs: `${SANDBOX_STARTUP_SPAN_ATTR_PREFIX}exec.network_ms`,
      /** Whether one execution sits on the startup critical path. */
      execCriticalPath: `${SANDBOX_STARTUP_SPAN_ATTR_PREFIX}exec.critical_path`,
      /** Whether the provider served the sandbox handle from its warm cache. */
      execCacheHit: `${SANDBOX_STARTUP_SPAN_ATTR_PREFIX}exec.cache_hit`,
      /** The root-span wall time of the whole bring-up. */
      rootWallMs: `${SANDBOX_STARTUP_SPAN_ATTR_PREFIX}root.wall_ms`,
      /** The sum of the step wall times of the whole bring-up. */
      rootWorkMs: `${SANDBOX_STARTUP_SPAN_ATTR_PREFIX}root.work_ms`,
      /** The difference between the work sum and the wall time (overlap). */
      rootDiffMs: `${SANDBOX_STARTUP_SPAN_ATTR_PREFIX}root.diff_ms`,
      /** Whether this bring-up is a cold start (no warm handle). */
      coldStart: `${SANDBOX_STARTUP_SPAN_ATTR_PREFIX}cold_start`,
      /** The clamped region label (through `clampSpanLabel`). */
      region: `${SANDBOX_STARTUP_SPAN_ATTR_PREFIX}region`,
      /** The hashed image-id label (through `clampSpanLabel`). */
      imageId: `${SANDBOX_STARTUP_SPAN_ATTR_PREFIX}image_id`,
      /** The hashed sandbox-id label (through `clampSpanLabel`). */
      sandboxId: `${SANDBOX_STARTUP_SPAN_ATTR_PREFIX}sandbox_id`,
      /** The hashed lease-id label (through `clampSpanLabel`). */
      leaseId: `${SANDBOX_STARTUP_SPAN_ATTR_PREFIX}lease_id`,
      /** The create-runtime sub-time of the `acp.handshake` step. */
      handshakeCreateRuntimeWallMs: `${SANDBOX_STARTUP_SPAN_ATTR_PREFIX}handshake.create_runtime.wall_ms`,
      /** The ensure-session sub-time of the `acp.handshake` step. */
      handshakeEnsureSessionWallMs: `${SANDBOX_STARTUP_SPAN_ATTR_PREFIX}handshake.ensure_session.wall_ms`,
      /** A shared low-cardinality tag that marks two steps as one parallel batch. */
      batch: `${SANDBOX_STARTUP_SPAN_ATTR_PREFIX}batch`,
      /** The host-local wall time of the pack step (build the tarball). */
      packWallMs: `${SANDBOX_STARTUP_SPAN_ATTR_PREFIX}pack.wall_ms`,
      /** The wall time of the transfer step (upload the files to the sandbox). */
      transferWallMs: `${SANDBOX_STARTUP_SPAN_ATTR_PREFIX}transfer.wall_ms`,
      /** The number of serial guard round trips before one transfer. */
      transferGuardCount: `${SANDBOX_STARTUP_SPAN_ATTR_PREFIX}transfer.guard.count`,
      /** The transfer direction: `inbound` for an upload to the sandbox, `outbound`
       * for a download from the sandbox. The parent span carries operation identity,
       * so the transfer span never carries an operation label. The value stays in a
       * closed set, so the attribute cardinality is bounded. */
      transferDirection: `${SANDBOX_STARTUP_SPAN_ATTR_PREFIX}transfer.direction`
    };
    activeStepContextStorage = new AsyncLocalStorage();
    RUN_PHASE_NAMES = [
      "place_workspace",
      "start_transport",
      "create_runtime",
      "ensure_session",
      "configure_session",
      "prepare_turn",
      "turn",
      "end_session",
      "settle_reuse",
      "stop_transport",
      "sync_back",
      "release_staging_lease"
    ];
    RUN_PHASE_NAME_SET = new Set(RUN_PHASE_NAMES);
  }
});

// vendor/adapter-utils/src/sandbox-callback-bridge.ts
import { createHash as createHash5, randomBytes, randomUUID as randomUUID6, timingSafeEqual } from "node:crypto";
import { promises as fs8 } from "node:fs";
import http2 from "node:http2";
import os7 from "node:os";
import path9 from "node:path";
var BRIDGE_MULTIPART_FRAMING_HEADROOM_BYTES, DEFAULT_BRIDGE_MAX_BODY_BYTES, REMOTE_WRITE_BASE64_CHUNK_SIZE, DEFAULT_SANDBOX_CALLBACK_BRIDGE_MAX_BODY_BYTES;
var init_sandbox_callback_bridge = __esm({
  "vendor/adapter-utils/src/sandbox-callback-bridge.ts"() {
    init_sandbox_callback_bridge_body();
    init_startup_timing();
    init_sandbox_shell();
    BRIDGE_MULTIPART_FRAMING_HEADROOM_BYTES = 64 * 1024;
    DEFAULT_BRIDGE_MAX_BODY_BYTES = 10 * 1024 * 1024 + BRIDGE_MULTIPART_FRAMING_HEADROOM_BYTES;
    REMOTE_WRITE_BASE64_CHUNK_SIZE = 32 * 1024;
    DEFAULT_SANDBOX_CALLBACK_BRIDGE_MAX_BODY_BYTES = DEFAULT_BRIDGE_MAX_BODY_BYTES;
  }
});

// vendor/adapter-utils/src/http2-bridge-server.ts
import { Duplex } from "node:stream";
import http22 from "node:http2";
var HTTP2_BRIDGE_MAX_CONCURRENT_STREAMS, HTTP2_BRIDGE_MAX_PROCESS_BODY_BYTES, HTTP2_BRIDGE_MAX_ROUTE_BODY_BYTES;
var init_http2_bridge_server = __esm({
  "vendor/adapter-utils/src/http2-bridge-server.ts"() {
    init_sandbox_callback_bridge();
    HTTP2_BRIDGE_MAX_CONCURRENT_STREAMS = 4;
    HTTP2_BRIDGE_MAX_PROCESS_BODY_BYTES = 1024 * 1024 * 1024;
    HTTP2_BRIDGE_MAX_ROUTE_BODY_BYTES = HTTP2_BRIDGE_MAX_CONCURRENT_STREAMS * 4 * DEFAULT_SANDBOX_CALLBACK_BRIDGE_MAX_BODY_BYTES;
  }
});

// src/ui/parse-stdout.ts
function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
function asRecord(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  return value;
}
function asString(value, fallback = "") {
  return typeof value === "string" ? value : fallback;
}
function asNumber(value, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
function parseAgyStdoutLine(line, ts) {
  const parsed = asRecord(safeJsonParse(line));
  if (!parsed) {
    return [{ kind: "stdout", ts, text: line }];
  }
  const eventType = asString(parsed.event);
  if (eventType === "init") {
    const conversationId = asString(parsed.conversation_id);
    return [
      {
        kind: "init",
        ts,
        model: "agy",
        sessionId: conversationId
      }
    ];
  }
  if (eventType === "step_update") {
    const stepUpdate = asRecord(parsed.step_update);
    if (!stepUpdate) return [];
    const stepType = asString(stepUpdate.step_type);
    if (stepType === "agent_response") {
      const entries = [];
      const thinking = asString(stepUpdate.thinking);
      if (thinking) {
        entries.push({ kind: "thinking", ts, text: thinking });
      }
      const textDelta = asString(stepUpdate.text_delta);
      if (textDelta) {
        entries.push({ kind: "assistant", ts, text: textDelta });
      }
      return entries;
    }
    if (stepType === "tool") {
      const toolName = asString(stepUpdate.tool_name, "tool");
      const toolInfo = asRecord(stepUpdate.tool_info) ?? {};
      const toolCallId = asString(stepUpdate.tool_call_id || toolInfo.id || toolInfo.tool_use_id, toolName);
      const params = asRecord(toolInfo.parameters || toolInfo.input || toolInfo.arguments) ?? {};
      const state = asString(stepUpdate.state);
      const callEntry = {
        kind: "tool_call",
        ts,
        name: toolName,
        toolUseId: toolCallId,
        input: params
      };
      if (state === "ACTIVE") {
        return [callEntry];
      }
      if (state === "DONE") {
        const rawOutput = toolInfo.output;
        const output = typeof rawOutput === "object" && rawOutput !== null ? JSON.stringify(rawOutput, null, 2) : asString(rawOutput, "done");
        return [
          callEntry,
          {
            kind: "tool_result",
            ts,
            toolUseId: toolCallId,
            content: output,
            isError: false
          }
        ];
      }
      if (state === "ERROR") {
        const errObj = asRecord(toolInfo.error);
        const errMsg = asString(errObj?.message) || asString(toolInfo.error) || "Tool execution failed";
        return [
          callEntry,
          {
            kind: "tool_result",
            ts,
            toolUseId: toolCallId,
            content: errMsg,
            isError: true
          }
        ];
      }
      return [callEntry];
    }
    if (stepType === "user_input") {
      return [{ kind: "user", ts, text: "Turn started" }];
    }
    if (stepType === "system_message") {
      return [{ kind: "system", ts, text: "System update" }];
    }
  }
  if (eventType === "result") {
    const resultObj = asRecord(parsed.result);
    if (!resultObj) return [];
    const response = asString(resultObj.response);
    const isError = asString(resultObj.status) === "ERROR";
    const usage = asRecord(resultObj.usage);
    return [
      {
        kind: "result",
        ts,
        text: response,
        inputTokens: asNumber(usage?.input_tokens, 0),
        outputTokens: asNumber(usage?.output_tokens, 0),
        cachedTokens: asNumber(usage?.cache_read_tokens, 0),
        costUsd: 0,
        subtype: isError ? "error" : "success",
        isError,
        errors: isError && response ? [response] : []
      }
    ];
  }
  return [{ kind: "stdout", ts, text: line }];
}

// vendor/adapter-utils/src/index.ts
init_command_redaction();

// vendor/adapter-utils/src/env-bindings.ts
var ENV_KEY_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;
function isVersionSelector(value) {
  return typeof value === "number" || value === "latest";
}
function parseEnvBindings(bindings) {
  if (typeof bindings !== "object" || bindings === null || Array.isArray(bindings)) return {};
  const env = {};
  for (const [key, raw] of Object.entries(bindings)) {
    if (!ENV_KEY_RE.test(key)) continue;
    if (typeof raw === "string") {
      env[key] = { type: "plain", value: raw };
      continue;
    }
    if (typeof raw !== "object" || raw === null || Array.isArray(raw)) continue;
    const rec = raw;
    if (rec.type === "plain" && typeof rec.value === "string") {
      env[key] = { type: "plain", value: rec.value };
      continue;
    }
    if (rec.type === "secret_ref" && typeof rec.secretId === "string") {
      env[key] = {
        type: "secret_ref",
        secretId: rec.secretId,
        ...isVersionSelector(rec.version) ? { version: rec.version } : {}
      };
      continue;
    }
    if (rec.type === "user_secret_ref" && typeof rec.key === "string") {
      env[key] = {
        type: "user_secret_ref",
        key: rec.key,
        ...isVersionSelector(rec.version) ? { version: rec.version } : {},
        ...typeof rec.required === "boolean" ? { required: rec.required } : {},
        ...typeof rec.allowMissingOverride === "boolean" ? { allowMissingOverride: rec.allowMissingOverride } : {}
      };
    }
  }
  return env;
}
function parseEnvVars(text) {
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1);
    if (!ENV_KEY_RE.test(key)) continue;
    env[key] = value;
  }
  return env;
}
function buildAdapterEnvConfig(envBindings, envVars) {
  const env = parseEnvBindings(envBindings);
  const legacy = parseEnvVars(envVars ?? "");
  for (const [key, value] of Object.entries(legacy)) {
    if (!Object.prototype.hasOwnProperty.call(env, key)) {
      env[key] = { type: "plain", value };
    }
  }
  return env;
}

// vendor/adapter-utils/src/index.ts
init_runtime_progress();
init_paperclip_runner_permissions();

// src/server/index.ts
init_server_utils();

// src/server/execute.ts
import fs12 from "node:fs/promises";
import os11 from "node:os";
import path14 from "node:path";
import { fileURLToPath as fileURLToPath2 } from "node:url";

// vendor/adapter-utils/src/execution-target.ts
import fs9 from "node:fs/promises";
import { execFile as execFile4 } from "node:child_process";
import { promisify as promisify2 } from "node:util";
import net3 from "node:net";
import os8 from "node:os";
import path11 from "node:path";
import { randomBytes as randomBytes2, randomUUID as randomUUID7 } from "node:crypto";

// vendor/adapter-utils/src/command-managed-runtime.ts
import { promises as fs7 } from "node:fs";
import { randomUUID as randomUUID5 } from "node:crypto";
import os6 from "node:os";
import path7 from "node:path";

// vendor/adapter-utils/src/sandbox-managed-runtime.ts
init_git_workspace_sync();
init_workspace_restore_merge();
init_runtime_progress();
init_exclude_patterns();
import { execFile as execFileCallback } from "node:child_process";
import { createHash as createHash3, randomUUID as randomUUID4 } from "node:crypto";
import {
  constants as fsConstants4,
  createReadStream as createReadStream3,
  promises as fs6
} from "node:fs";
import os5 from "node:os";
import path6 from "node:path";
import { promisify } from "node:util";
var execFile3 = promisify(execFileCallback);
var SANDBOX_WORKSPACE_HEAVY_DIR_NAMES = [
  "node_modules",
  "vendor",
  "dist",
  "build",
  "out",
  "coverage",
  ".next",
  ".turbo",
  ".cache"
];
var SANDBOX_WORKSPACE_HEAVY_DIR_EXCLUDES = SANDBOX_WORKSPACE_HEAVY_DIR_NAMES.flatMap((entry) => [
  entry,
  `${entry}/*`,
  `*/${entry}`,
  `*/${entry}/*`
]);

// vendor/adapter-utils/src/command-managed-runtime.ts
init_sandbox_shell();
var REMOTE_WRITE_SINGLE_STREAM_MAX_BASE64_BYTES = 96 * 1024 * 1024;
var REMOTE_WRITE_FALLBACK_BASE64_CHUNK_SIZE = 4 * 1024 * 1024;
var REMOTE_WRITE_FALLBACK_DECODED_CHUNK_SIZE = REMOTE_WRITE_FALLBACK_BASE64_CHUNK_SIZE / 4 * 3;

// vendor/adapter-utils/src/remote-managed-runtime.ts
init_git_workspace_sync();
init_ssh();
import path8 from "node:path";
init_workspace_restore_merge();
var REMOTE_ADDITIONAL_SOURCE_HEAVY_DIR_EXCLUDES = [
  "node_modules",
  "vendor",
  "dist",
  "build",
  "out",
  "coverage",
  ".next",
  ".turbo",
  ".cache",
  ".git"
].flatMap((entry) => [entry, `${entry}/*`, `*/${entry}`, `*/${entry}/*`]);

// vendor/adapter-utils/src/execution-target.ts
init_sandbox_callback_bridge();
init_http2_bridge_server();

// vendor/adapter-utils/src/sandbox-run-log-stream.ts
init_sandbox_shell();
init_ssh();
import path10 from "node:path";
import { StringDecoder } from "node:string_decoder";
var DEFAULT_TAIL_MAX_CHUNK_BYTES = 64 * 1024;

// vendor/adapter-utils/src/duplex-frame-codec.ts
var DEFAULT_MAX_DUPLEX_FRAME_BYTES = 262144;

// vendor/adapter-utils/src/duplex-observability.ts
var DUPLEX_LOSS_REASONS = [
  "stdin_eof",
  "provider_exit",
  "heartbeat_timeout",
  "rpc_failure",
  "write_error",
  "transport_closed",
  "other"
];
var LOSS_REASONS = new Set(DUPLEX_LOSS_REASONS);
var HTTP2_TELEMETRY_EVENT_NAMES = [
  "session_error",
  "session_goaway",
  "session_stall",
  "write_error",
  "transport_closed",
  "channel_exit"
];
var HTTP2_EVENT_NAMES = new Set(HTTP2_TELEMETRY_EVENT_NAMES);

// vendor/adapter-utils/src/execution-target.ts
init_ssh();
init_server_utils();
init_remote_execution_env();
init_sandbox_shell();
init_startup_timing();
init_remote_execution_env();
var SSH_COMMAND_MAX_BUFFER_BYTES = 1024 * 1024;
var DUPLEX_READINESS_BUFFER_CAP_BYTES = DEFAULT_MAX_DUPLEX_FRAME_BYTES + 4096;
var HTTP2_CLIENT_CONNECTION_PREFACE = Buffer.from(
  "505249202a20485454502f322e300d0a0d0a534d0d0a0d0a",
  "hex"
);
var HTTP2_PREFACE_EMPTY_BUFFER = Buffer.alloc(0);
var READINESS_EMPTY_BUFFER = Buffer.alloc(0);

// src/server/execute.ts
init_server_utils();

// src/server/parse.ts
init_server_utils();

// src/server/skills.ts
init_server_utils();
import fs10 from "node:fs/promises";
import os9 from "node:os";
import path12 from "node:path";
import { fileURLToPath } from "node:url";
var __moduleDir = path12.dirname(fileURLToPath(import.meta.url));
var AGY_WORKSPACE_SKILL_SUBPATH = path12.join(".agents", "skills");

// src/server/models.ts
init_server_utils();

// src/server/quota.ts
import fs11 from "node:fs/promises";
import path13 from "node:path";
import os10 from "node:os";
var FIVE_HOURS_MS = 5 * 60 * 60 * 1e3;
var SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1e3;

// src/server/execute.ts
var __moduleDir2 = path14.dirname(fileURLToPath2(import.meta.url));

// src/server/test.ts
init_server_utils();

// src/server/agents.ts
init_server_utils();

// src/server/credentials.ts
import fs13 from "node:fs";
import os12 from "node:os";
import path15 from "node:path";

// src/index.ts
var DEFAULT_AGY_LOCAL_MODEL = "gemini-3.8-flash-high";

// src/ui/build-config.ts
function parseCommaArgs(value) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}
function buildAgyConfig(v) {
  const raw = v;
  const ac = {};
  if (v.cwd) ac.cwd = v.cwd;
  if (v.instructionsFilePath) ac.instructionsFilePath = v.instructionsFilePath;
  ac.model = v.model || DEFAULT_AGY_LOCAL_MODEL;
  if (v.thinkingEffort) ac.effort = v.thinkingEffort;
  if (raw.mode) ac.mode = raw.mode;
  if (raw.agent) ac.agent = raw.agent;
  if (raw.agentPersona) ac.agent = raw.agentPersona;
  if (raw.jsonSchema) ac.jsonSchema = raw.jsonSchema;
  if (typeof raw.sandbox === "boolean") ac.sandbox = raw.sandbox;
  if (raw.addDirs) ac.addDirs = Array.isArray(raw.addDirs) ? raw.addDirs : parseCommaArgs(String(raw.addDirs));
  if (raw.project) ac.project = String(raw.project).trim();
  if (raw.printTimeout) ac.printTimeout = String(raw.printTimeout).trim();
  if (typeof raw.disableSlashCommands === "boolean") ac.disableSlashCommands = raw.disableSlashCommands;
  ac.dangerouslySkipPermissions = typeof v.dangerouslySkipPermissions === "boolean" ? v.dangerouslySkipPermissions : true;
  ac.timeoutSec = 0;
  ac.graceSec = 15;
  if (v.workspaceStrategyType === "git_worktree") {
    ac.workspaceStrategy = {
      type: "git_worktree",
      ...v.workspaceBaseRef ? { baseRef: v.workspaceBaseRef } : {},
      ...v.workspaceBranchTemplate ? { branchTemplate: v.workspaceBranchTemplate } : {},
      ...v.worktreeParentDir ? { worktreeParentDir: v.worktreeParentDir } : {}
    };
  }
  const env = buildAdapterEnvConfig(v.envBindings, v.envVars);
  if (Object.keys(env).length > 0) ac.env = env;
  if (v.command) ac.command = v.command;
  if (v.extraArgs) ac.extraArgs = parseCommaArgs(v.extraArgs);
  return ac;
}
export {
  buildAgyConfig,
  parseAgyStdoutLine
};
//# sourceMappingURL=index.js.map
