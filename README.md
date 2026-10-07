# Paperclip Adapter for Antigravity (agy)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Paperclip Compatibility](https://img.shields.io/badge/Paperclip-v0.3.1%2B-green.svg)](https://github.com/paperclipai/paperclip)

Standalone external adapter plugin for [Paperclip AI](https://github.com/paperclipai/paperclip) that integrates the Google Antigravity (`agy`) CLI runtime.

Designed as an **isolated external plugin** that can be installed into Paperclip's persistent storage without embedding organization-specific infrastructure in this repository. Deployment recipes, production image overlays, backups, credentials, and environment-specific runbooks should live in private infrastructure repositories.

---

## Features

- **Isolated External Plugin**: Conforms to Paperclip's official external adapter plugin specification (`createServerAdapter()`). Loaded dynamically via `/paperclip/adapter-plugins.json`.
- **Zero Headless Lockups**: Automatically auto-approves non-interactive tool operations (`--dangerously-skip-permissions: true`) to prevent headless permission errors (`agy_permission_denied`).
- **Dynamic Cost & Token Metering**: Calculates exact dollar costs for runs into Paperclip's financial ledger (`billingType: "api"`), pricing models at standard API equivalents:
  - Gemini Flash: \$0.15 / 1M input (\$0.0375 cached), \$0.60 / 1M output
  - Gemini Pro: \$1.25 / 1M input (\$0.3125 cached), \$5.00 / 1M output
  - Claude Sonnet: \$3.00 / 1M input, \$15.00 / 1M output
  - Claude Opus: \$15.00 / 1M input, \$75.00 / 1M output
  - GPT-OSS 120B: \$0.20 / 1M input, \$0.60 / 1M output
- **Provider Subscription Quota**: Reads the authoritative Antigravity `/usage` command, including model-family 5-hour/weekly buckets and provider reset times. Falls back to a clearly labeled local estimate only when `/usage` is unavailable.
- **Session Continuity**: Multi-turn conversation state persistence across heartbeats via `--conversation <id>` with automatic recovery.
- **Live UI Parser**: Bundles a self-contained CommonJS log parser (`ui-parser.cjs`) served dynamically by Paperclip to render live streaming thought processes and tool calls in the UI.

---

## Project Structure

```
paperclip-adapter-antigravity/
├── src/
│   ├── index.ts              # Main plugin entry (exports createServerAdapter)
│   ├── server/
│   │   ├── execute.ts        # CLI runner with headless skip and token recording
│   │   ├── parse.ts          # Stream NDJSON parser and model pricing formula
│   │   ├── quota.ts          # ACP quota windows and rolling usage ledger
│   │   ├── config-schema.ts  # Declarative UI runtime settings schema
│   │   ├── test.ts           # Adapter health & environment test probes
│   │   ├── skills.ts         # Agent skills synchronization
│   │   └── credentials.ts    # OAuth token validation
│   └── ui/
│       ├── build-config.ts   # UI form configuration mapper
│       └── parse-stdout.ts   # Run transcript processor
├── ui-parser.cjs             # Standalone UI parser for Web Workers
├── build.mjs                 # Self-contained bundle builder (esbuild)
└── package.json
```

---

## Installation & Deployment

### 1. Build the Distribution

```bash
git clone <your-repo-url>/paperclip-adapter-antigravity.git
cd paperclip-adapter-antigravity
npm install
npm run build
```

This bundles all runtime code into `dist/` with zero external dependencies.

### 2. Deploy to Paperclip (e.g., VPS / Docker)

Copy the package into the Paperclip persistent storage directory (e.g. `/paperclip/extensions/`):

```bash
# Example copying to a remote VPS running Paperclip
ssh <user>@<host> 'mkdir -p /paperclip/extensions/paperclip-adapter-antigravity'
scp -r ./dist ./ui-parser.cjs ./package.json <user>@<host>:/paperclip/extensions/paperclip-adapter-antigravity/
```

### 3. Register in Paperclip

Add the adapter to `/paperclip/adapter-plugins.json`:

```json
[
  {
    "packageName": "paperclip-adapter-antigravity",
    "localPath": "/paperclip/extensions/paperclip-adapter-antigravity",
    "version": "1.0.0",
    "type": "agy_local",
    "installedAt": "2026-01-01T00:00:00.000Z"
  }
]
```

### 4. Restart Paperclip

```bash
docker compose restart paperclip-app
```


## Prerequisites

Before using this adapter, ensure your host or Docker container meets the following requirements:

1. **Antigravity CLI (`agy`) Installed**:
   - `agy` must be installed and executable in `$PATH` (e.g. `/usr/local/bin/agy` or `~/.local/bin/agy`).
   - If running inside Docker, bind-mount the `agy` binary:
     ```yaml
     volumes:
       - /path/to/agy:/usr/local/bin/agy:ro
       - /path/to/gemini-home:/paperclip/.gemini:rw
     ```
2. **Google Antigravity Authentication**:
   - Log in once on your host with:
     ```bash
     agy auth login
     # or copy your existing ~/.gemini directory containing oauth credentials
     ```
   - Ensure the credentials directory (`~/.gemini`) is accessible to the user running Paperclip.

---

## Agent Configuration (UI)

Once installed, configure any agent in Paperclip to use Antigravity:

1. In Paperclip, go to **Company -> Agents -> [Select Agent] -> Runtime**.
2. Select **Antigravity (agy)** (`agy_local`) as the runtime adapter.
3. Configure the runtime parameters:
   - **Model**: Default `gemini-3.8-flash-high`. Also supports `gemini-3.8-pro-high`, `claude-sonnet-4-6`, `claude-opus-4-6`, and `gpt-oss-120b`.
   - **Skip Tool Permissions**: Enabled by default (`true`). Automatically passes `--dangerously-skip-permissions` so headless tasks don't get stuck waiting for user confirmation on file reads/writes.
   - **Reasoning Effort**: `high` (default), `medium`, or `low`.
   - **Execution Mode**: `accept-edits` (default) or `plan`.
   - **Turn Timeout**: Default `24h` (supports `15m`, `1h`, etc.).
   - **Project**: Optional Google Cloud / Antigravity project ID.
   - **Extra CLI Arguments**: Any extra flags to pass to the CLI.

---

## Environment Variables

Provider quota comes from Antigravity `/usage`. The local fallback and probe behavior can be customized via environment variables in your Paperclip `.env` or Docker Compose file:

| Variable | Default | Description |
|---|---|---|
| `AGY_5H_TOKEN_LIMIT` | `2000000` | Fallback-only token limit when provider `/usage` is unavailable. |
| `AGY_WEEKLY_TOKEN_LIMIT` | `15000000` | Fallback-only weekly limit when provider `/usage` is unavailable. |
| `PAPERCLIP_AGY_QUOTA_FILE` | `~/.gemini/antigravity-cli/quota-history.json` | Path to the local fallback usage ledger. |
| `PAPERCLIP_AGY_QUOTA_CACHE_MS` | `60000` | Cache duration for provider `/usage` results. |
| `PAPERCLIP_AGY_QUOTA_TIMEOUT_MS` | `10000` | Timeout for the provider quota probe. |
| `PAPERCLIP_AGY_COMMAND` | `agy` | Optional command/path override used by the quota probe. |

---

## Verification

1. **Adapter Registry**: Navigate to **Company -> Agents -> [Agent] -> Runtime**.
2. Select **Antigravity (agy)**.
3. Click **Test Environment** — all checks should report `pass`.
4. Trigger an agent task. When the run finishes, check the **Costs** dashboard:
   - The token costs appear under **Month Spend**.
   - The Google subscription quota displays under **Subscription quota** with live **5h** and **Weekly** percentage progress bars.


---

## License

MIT © Journey Studios
