import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { QR_SITE_URL } from "../src/qr-site-url.ts";
import { qrSpriteSource } from "./qr-rows.ts";

let scriptDir = dirname(process.argv[1]);
let out = resolve(scriptDir, "../src/sprites/qr.ts");

writeFileSync(out, qrSpriteSource(QR_SITE_URL));
console.log(`wrote ${out}`);
