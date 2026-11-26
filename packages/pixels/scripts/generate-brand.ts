import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

import { renderBrandFiles } from "../src/brand-assets.ts";
import { encodePng } from "../src/png.ts";
import { renderContactSheet } from "./contact-sheet.ts";

let scriptDir = dirname(process.argv[1]);
let outDir = resolve(scriptDir, "../../../apps/mobile/assets/brand");
let contactSheetPath =
  process.env.CONTACT_SHEET_PATH ?? join(tmpdir(), "bow-season-contact-sheet.png");

mkdirSync(outDir, { recursive: true });
for (let { name, bytes } of renderBrandFiles()) {
  writeFileSync(join(outDir, name), bytes);
  console.log(`wrote ${join(outDir, name)}`);
}

let sheet = renderContactSheet();
writeFileSync(contactSheetPath, encodePng(sheet.width, sheet.height, sheet.rgba, { alpha: false }));
console.log(`wrote ${contactSheetPath}`);
