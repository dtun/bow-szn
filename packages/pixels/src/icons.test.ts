import { SPRITES, WIND_FLAG_FRAMES } from "./index.ts";

function clothPixels(id: (typeof WIND_FLAG_FRAMES)[number]): number {
  return SPRITES[id].rows.join("").replace(/[^RM]/g, "").length;
}

function clothRows(id: (typeof WIND_FLAG_FRAMES)[number]): number[] {
  return SPRITES[id].rows.flatMap((row, y) => (/[RM]/.test(row) ? [y] : []));
}

describe("WIND_FLAG_FRAMES", () => {
  it("flies more cloth as the wind strengthens", () => {
    let cloth = WIND_FLAG_FRAMES.map(clothPixels);

    expect(cloth).toEqual([...cloth].sort((a, b) => a - b));
    expect(new Set(cloth).size).toBe(cloth.length);
  });

  it("keeps all three flags the same size so the HUD does not shift", () => {
    expect(new Set(WIND_FLAG_FRAMES.map((id) => `${SPRITES[id].w}x${SPRITES[id].h}`)).size).toBe(1);
  });

  it("snaps the strongest flag straight out to the edge of the sprite without hanging lower than the middle flag", () => {
    let [, medium, strong] = WIND_FLAG_FRAMES;
    let farthestCloth = Math.max(
      ...SPRITES[strong].rows.map((row) => Math.max(row.lastIndexOf("R"), row.lastIndexOf("M")))
    );

    expect(farthestCloth).toBe(SPRITES[strong].w - 1);
    expect(Math.max(...clothRows(strong))).toBeLessThan(Math.max(...clothRows(medium)));
  });
});

describe("icon-plaque", () => {
  it("carries a brass plate", () => {
    expect(SPRITES["icon-plaque"].rows.join("")).toMatch(/[Yy]/);
  });
});
