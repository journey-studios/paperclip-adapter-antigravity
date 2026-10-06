#!/bin/sh
# Patch Paperclip UI bundle to allow displaying Google / Antigravity subscription quota bars
FILE="/app/ui/dist/assets/index-Dy8GZEwY.js"

if [ -f "$FILE" ]; then
  node -e '
    const fs = require("fs");
    const path = "/app/ui/dist/assets/index-Dy8GZEwY.js";
    if (fs.existsSync(path)) {
      let content = fs.readFileSync(path, "utf-8");
      const target = "B=(e===\"anthropic\"||e===\"openai\")&&(m||l.length>0||c!=null)";
      const replacement = "B=(e===\"anthropic\"||e===\"openai\"||e===\"google\")&&(m||l.length>0||c!=null)";
      if (content.includes(target)) {
        fs.writeFileSync(path, content.replace(target, replacement), "utf-8");
        console.log("[patch] UI bundle successfully patched for Google subscription quota.");
      } else {
        console.log("[patch] UI bundle already patched or target pattern not found.");
      }
    }
  '
else
  echo "[patch] File $FILE not found (if running on host, run inside paperclip-app container)."
fi
