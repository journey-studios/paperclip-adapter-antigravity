import * as esbuild from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

console.log("[build] Preparing dist directories...");
fs.rmSync("dist", { recursive: true, force: true });
fs.mkdirSync("dist/server", { recursive: true });
fs.mkdirSync("dist/ui", { recursive: true });
fs.mkdirSync("dist/cli", { recursive: true });

console.log("[build] Copying ui-parser.cjs...");
fs.copyFileSync("ui-parser.cjs", "dist/ui-parser.cjs");

console.log("[build] Bundling TypeScript with esbuild...");
await esbuild.build({
  entryPoints: {
    index: "src/index.ts",
    "server/index": "src/server/index.ts",
    "ui/index": "src/ui/index.ts",
    "cli/index": "src/cli/index.ts",
  },
  bundle: true,
  outdir: "dist",
  format: "esm",
  platform: "node",
  target: "node20",
  sourcemap: true,
  external: [
    "node:*",
    "fs",
    "fs/promises",
    "path",
    "child_process",
    "os",
    "url",
    "util",
    "events",
    "stream",
    "crypto",
    "http",
    "https",
    "net",
    "tls",
    "zlib",
    "picocolors",
  ],
  plugins: [
    {
      name: "resolve-adapter-utils",
      setup(build) {
        build.onResolve({ filter: /^@paperclipai\/adapter-utils(\/.*)?$/ }, (args) => {
          const sub = args.path.replace(/^@paperclipai\/adapter-utils\/?/, "");
          if (!sub) {
            return { path: path.resolve("vendor/adapter-utils/src/index.ts") };
          }
          const candidate = path.resolve("vendor/adapter-utils/src", sub + ".ts");
          if (fs.existsSync(candidate)) return { path: candidate };
          const candidateDir = path.resolve("vendor/adapter-utils/src", sub, "index.ts");
          if (fs.existsSync(candidateDir)) return { path: candidateDir };
          return null;
        });
      },
    },
  ],
});

console.log("[build] Generating TypeScript declarations...");
try {
  execSync("npx tsc-rs --emitDeclarationOnly", { stdio: "inherit" });
} catch (e) {
  console.warn("[build] Warning: tsc-rs declaration emit skipped or failed (runtime bundle intact)");
}

console.log("[build] Build completed successfully.");
