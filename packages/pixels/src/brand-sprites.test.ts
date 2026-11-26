import { SPRITES } from "./index.ts";
import type { SpriteId } from "./index.ts";

function colorsOf(id: SpriteId): string[] {
  return [...new Set(SPRITES[id].rows.join("").replaceAll(".", ""))].sort();
}

describe("brand sprites", () => {
  it("runs the bow's arrow unbroken along the middle row from nock to tip", () => {
    let { rows, h } = SPRITES["brand-bow"];
    let middle = rows[(h - 1) / 2];
    let painted = [...middle].flatMap((cell, x) => (cell === "." ? [] : [x]));

    expect(painted).toEqual(Array.from({ length: painted.length }, (_, step) => painted[0] + step));
  });

  it("draws the bow taller than it is wide so it reads as a bow at icon size", () => {
    expect(SPRITES["brand-bow"].h).toBeGreaterThan(SPRITES["brand-bow"].w);
  });

  it("fits the compact bow inside the adaptive icon's safe zone of 66 of 108 on a 32 cell grid", () => {
    let safeCells = Math.floor((32 * 66) / 108);
    let { w, h } = SPRITES["brand-bow-compact"];

    expect(w).toBeLessThanOrEqual(safeCells);
    expect(h).toBeLessThanOrEqual(safeCells);
  });

  it("paints the deer as a single-color silhouette", () => {
    expect(colorsOf("brand-deer")).toEqual(["K"]);
  });

  it("paints the treeline as a single-color silhouette as wide as the brand grid", () => {
    expect(colorsOf("brand-treeline")).toEqual(["N"]);
    expect(SPRITES["brand-treeline"].w).toBe(32);
  });

  it("paints the icon buck and its mini twin as navy silhouettes", () => {
    expect(colorsOf("brand-icon-buck")).toEqual(["N"]);
    expect(colorsOf("brand-icon-buck-mini")).toEqual(["N"]);
  });

  it("draws every tine tip and hoof of the icon buck at least two cells wide so they survive 60 px", () => {
    let { rows } = SPRITES["brand-icon-buck"];

    for (let row of [rows[0], rows[rows.length - 1]]) {
      let runs = row.split(".").filter((run) => run.length > 0);

      expect(runs.filter((run) => run.length < 2)).toEqual([]);
    }
  });
});
