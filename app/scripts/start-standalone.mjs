import { cpSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appDir = path.resolve(__dirname, "..");

const standaloneDir = path.join(appDir, ".next-runtime", "standalone");
const standaloneNextDir = path.join(standaloneDir, ".next-runtime");
const staticSourceDir = path.join(appDir, ".next-runtime", "static");
const staticTargetDir = path.join(standaloneNextDir, "static");
const publicSourceDir = path.join(appDir, "public");
const publicTargetDir = path.join(standaloneDir, "public");
const serverPath = path.join(standaloneDir, "server.js");

if (!existsSync(serverPath)) {
  console.error("Standalone server was not found. Run `npm run build` first.");
  process.exit(1);
}

mkdirSync(standaloneNextDir, { recursive: true });

if (existsSync(staticSourceDir)) {
  cpSync(staticSourceDir, staticTargetDir, { recursive: true, force: true });
}

if (existsSync(publicSourceDir)) {
  cpSync(publicSourceDir, publicTargetDir, { recursive: true, force: true });
}

const child = spawn(process.execPath, [serverPath], {
  cwd: standaloneDir,
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});