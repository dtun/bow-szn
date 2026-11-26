import { readFileSync } from "node:fs";
import { join } from "node:path";

import { renderBrandFiles } from "./brand-assets.ts";
import { decodePng } from "./test-support/read-png.ts";

const COMMITTED_DIR = join(__dirname, "../../../apps/mobile/assets/brand");

describe("committed brand PNGs", () => {
  it.each(renderBrandFiles().map((file) => [file.name, file.bytes] as const))(
    "%s matches what the generator renders from the sprites",
    (name, generated) => {
      let committed = decodePng(readFileSync(join(COMMITTED_DIR, name)));
      let fresh = decodePng(generated);

      expect([committed.width, committed.height, committed.colorType]).toEqual([
        fresh.width,
        fresh.height,
        fresh.colorType,
      ]);
      expect(committed.samples.equals(fresh.samples)).toBe(true);
    }
  );
});
