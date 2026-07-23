#!/usr/bin/env node

import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { intro, text, isCancel, cancel, spinner, outro } from "@clack/prompts";
import fse from "fs-extra";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templateDir = path.resolve(__dirname, "..", "template");

const REVERSE_DNS_RE = /^[a-zA-Z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9]*)+$/;

function validateIdentifier(val) {
  if (!val || val.trim().length === 0) return "Bundle identifier is required";
  if (!REVERSE_DNS_RE.test(val.trim())) return "Must be a valid reverse-DNS identifier (e.g. com.example.app)";
}

intro("tnt — scaffold a Tauri 2 + Next.js app");

const appName = await text({
  message: "What is your app name?",
  placeholder: "my-tauri-app",
  validate: (val) => {
    if (!val || val.trim().length === 0) return "App name is required";
    if (!/^[a-z0-9][a-z0-9._-]*$/i.test(val.trim())) return "App name may only contain letters, numbers, dots, hyphens, and underscores";
  },
});

if (isCancel(appName)) {
  cancel("Cancelled");
  process.exit(0);
}

const identifier = await text({
  message: "What is your bundle identifier?",
  placeholder: "com.example.app",
  validate: validateIdentifier,
});

if (isCancel(identifier)) {
  cancel("Cancelled");
  process.exit(0);
}

const targetDir = path.resolve(process.cwd(), appName.trim());

if (fs.existsSync(targetDir)) {
  cancel(`Directory "${appName.trim()}" already exists`);
  process.exit(1);
}

const s = spinner();
s.start("Copying template files");

await fse.copy(templateDir, targetDir, {
  filter: (src) => !src.includes("node_modules") && !src.includes(".git") && !src.includes("target"),
});

s.stop("Template copied");

s.start("Writing project configuration");

const replacements = [
  [path.join(targetDir, "package.json")],
  [path.join(targetDir, "src-tauri", "Cargo.toml")],
  [path.join(targetDir, "src-tauri", "tauri.conf.json")],
];

for (const [filePath] of replacements) {
  let content = await fse.readFile(filePath, "utf8");
  content = content.replace(/\{\{APP_NAME\}\}/g, appName.trim());
  content = content.replace(/\{\{IDENTIFIER\}\}/g, identifier.trim());
  await fse.writeFile(filePath, content, "utf8");
}

s.stop("Configuration written");

s.start("Installing dependencies with pnpm");

try {
  execSync("pnpm install", { cwd: targetDir, stdio: "ignore" });
  s.stop("Dependencies installed");
} catch {
  s.stop("pnpm install failed — you may need to run it manually");
}

outro(
  `Done! Run:\n\n  cd ${appName.trim()}\n  pnpm tauri dev`,
);
