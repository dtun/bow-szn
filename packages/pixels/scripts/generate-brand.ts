import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

import { renderBrandFiles } from "../src/brand-assets.ts";

let scriptDir = dirname(process.argv[1]);
let outDir = resolve(scriptDir, "../../../apps/mobile/assets/brand");

mkdirSync(outDir, { recursive: true });
for (let { name, bytes } of renderBrandFiles()) {
  writeFileSync(join(outDir, name), bytes);
  console.log(`wrote ${join(outDir, name)}`);
}
