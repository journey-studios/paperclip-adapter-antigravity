# Paperclip Adapter for Antigravity (agy)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Paperclip Compatibility](https://img.shields.io/badge/Paperclip-v0.3.1%2B-green.svg)](https://github.com/paperclipai/paperclip)

Standalone external adapter plugin for [Paperclip AI](https://github.com/paperclipai/paperclip) that integrates the Google Antigravity (`agy`) CLI runtime.

Designed as an **isolated, upgrade-safe external plugin**: installs cleanly into Paperclip's persistent volume without modifying Paperclip's core codebase or Docker images, fully surviving upstream container updates (`docker compose pull`).

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
- **ACP Subscription Quota Tracker**: Implements `getQuotaWindows()` with 5-hour and 7-day sliding windows, rendering live quota bars (`5h` and `Weekly`) in Paperclip's native **Costs -> Subscription Quota** card.
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
ssh root@<vps-ip> 'mkdir -p /paperclip/extensions/paperclip-adapter-antigravity'
scp -r ./dist ./ui-parser.cjs ./package.json root@<vps-ip>:/paperclip/extensions/paperclip-adapter-antigravity/
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
    "installedAt": "2026-10-06T12:00:00.000Z"
  }
]
```

### 4. Enable Quota Bars in UI (Optional / Quick Patch)

Paperclip v0.3.x limits the frontend Subscription Quota card to `anthropic` and `openai` by default. To display the Google quota bars:

```bash
sh scripts/patch-ui.sh
```

### 5. Restart Paperclip

```bash
docker compose restart paperclip-app
```


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
