#!/usr/bin/env node

import { execFileSync } from "child_process";

let SUPPORTED_EXTENSIONS = /\.(ts|tsx|js|jsx|json|md)$/;

let input = "";
for await (let chunk of process.stdin) {
  input += chunk;
}

let payload = JSON.parse(input);
let filePath = payload.tool_input?.file_path || "";

if (!filePath || !SUPPORTED_EXTENSIONS.test(filePath)) {
  process.exit(0);
}

try {
  execFileSync("npx", ["prettier", "--write", filePath], { stdio: "ignore" });
} catch {
  process.exit(2);
}
