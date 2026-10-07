#!/usr/bin/env bash
set -euo pipefail
TAG="${1:-paperclip:agy-cursor-cost-v1}"

docker run --rm --entrypoint sh "$TAG" -lc '
set -e
test -f /app/server/dist/services/heartbeat.js
test -f /app/ui/dist/index.html
test -f /app/packages/adapters/agy-local/src/server/index.ts
test -f /app/packages/adapters/cursor-local/src/server/parse.ts
grep -q "adapter-agy-local" /app/server/dist/adapters/registry.js
grep -q "cacheReadTokens" /app/packages/adapters/cursor-local/src/server/parse.ts
grep -q "composer-" /app/packages/adapters/cursor-local/src/server/execute.ts
grep -q "provider === \"google\"" /app/ui/src/components/ProviderQuotaCard.tsx
cd /app/server
node --import ./node_modules/tsx/dist/loader.mjs -e "import(\"@paperclipai/adapter-agy-local/server\").then(() => console.log(\"agy-import-ok\"))"
'
