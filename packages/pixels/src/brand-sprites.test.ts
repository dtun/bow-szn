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

  it("paints the treeline as a single-color silhouette as wide as the brand grid", () => {
    expect(colorsOf("brand-treeline")).toEqual(["N"]);
    expect(SPRITES["brand-treeline"].w).toBe(32);
  });

  it("paints the mini buck as one dark silhouette for the favicon", () => {
    expect(colorsOf("brand-icon-buck-mini")).toEqual(["K"]);
  });

  describe("the icon buck", () => {
    let { rows } = SPRITES["brand-icon-buck"];
    let prongRows = rows.slice(0, 6);

    function runs(row: string): string[] {
      return row.split(".").filter((run) => run.length > 0);
    }

    function gaps(row: string): number[] {
      return row
        .replace(/^\.+|\.+$/g, "")
        .split(/[^.]+/)
        .filter((gap) => gap.length > 0)
        .map((gap) => gap.length);
    }

    it("shades the buck with a dark outline, a brown ramp, a sunlit rim, a pale throat, and bone", () => {
      expect(colorsOf("brand-icon-buck")).toEqual(["E", "K", "L", "O", "U", "a"]);
    });

    it("raises six prongs from its rack", () => {
      expect(Math.max(...prongRows.map((row) => runs(row).length))).toBe(6);
    });

    it("leaves at least two cells of sun between neighboring prongs so they stay apart at 60 px", () => {
      expect(prongRows.flatMap(gaps).filter((gap) => gap < 2)).toEqual([]);
    });

    it("stands on four hooves", () => {
      expect(runs(rows[rows.length - 1])).toHaveLength(4);
    });
  });
});
