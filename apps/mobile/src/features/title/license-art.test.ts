import { colorAt } from "@/art/test-support/color-at";

import {
  MAX_LICENSE_COLS,
  MIN_LICENSE_COLS,
  NOTEBOOK,
  licenseCols,
  licenseLayout,
  menuHeight,
  tagLayer,
  type Box,
} from "./license-art";

const CREAM_PAPER = "#f4efe1";
const LEATHER_EDGE = "#5a3a1e";
const LEATHER_FACE = "#8b5a2f";
const NIGHT = "#0b0f1a";
const RULE_RED = "#e23b3b";
const TAG_EDGE_RED = "#8f2438";
const PERFORATION_TAN = "#c9b27a";
const STAMP_WIDTH = 30;
const STAMP_HEIGHT = 16;
const PHONE_COLS = 90;

function inside(box: Box, cols: number, rows: number): boolean {
  return box.x >= 0 && box.y >= 0 && box.x + box.width <= cols && box.y + box.height <= rows;
}

function overlap(a: Box, b: Box): boolean {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}

describe("licenseCols", () => {
  test.each([
    [393, 90],
    [430, 99],
    [375, 85],
    [820, 104],
  ])("a %ipt wide screen gets a license %i cells across", (width, cols) => {
    expect(licenseCols(width)).toBe(cols);
  });

  test.each([340, 375, 390, 393, 402, 430])(
    "on a %ipt wide screen the license leaves the same margin on its left and right, about the menu's 16pt",
    (width) => {
      let margin = (width - licenseCols(width) * 4) / 2;

      expect(margin).toBeGreaterThanOrEqual(16);
      expect(margin).toBeLessThan(18);
    }
  );

  test("a screen too narrow for the smallest license still gets the smallest license", () => {
    expect(licenseCols(296)).toBe(MIN_LICENSE_COLS);
  });

  test("the smallest license fits both stamps with a cell of paper around them", () => {
    let { level, season } = licenseLayout(MIN_LICENSE_COLS);

    expect(level.x).toBeGreaterThanOrEqual(1);
    expect(season.x + season.width).toBeLessThanOrEqual(MIN_LICENSE_COLS - 1);
  });

  test("the stamps sit centered in the left half and the right half of the license", () => {
    let { level, season } = licenseLayout(PHONE_COLS);
    let levelCenter = level.x + level.width / 2;
    let seasonCenter = season.x + season.width / 2;

    expect(Math.abs(levelCenter - PHONE_COLS / 4)).toBeLessThanOrEqual(1);
    expect(Math.abs(seasonCenter - (PHONE_COLS * 3) / 4)).toBeLessThanOrEqual(1);
  });
});

describe("menuHeight", () => {
  test("adds the license, the journal tag, the gap between them, and the margins above and below", () => {
    expect(menuHeight(0)).toBe(16 + 53 * 4 + 8 + 12 * 4 + 16);
  });

  test("grows by the safe area under the home indicator", () => {
    expect(menuHeight(34)).toBe(menuHeight(0) + 34);
  });
});

describe("the paper", () => {
  let layout = licenseLayout(PHONE_COLS);

  function paintedAt(x: number, y: number): string | null {
    return colorAt([layout.paper], x, y);
  }

  test("is cream with a dark outline and rounded corners", () => {
    expect(paintedAt(36, 20)).toBe(CREAM_PAPER);
    expect(paintedAt(36, 0)).toBe(LEATHER_EDGE);
    expect(paintedAt(0, 20)).toBe(LEATHER_EDGE);
    expect(paintedAt(0, 0)).toBeNull();
    expect(paintedAt(PHONE_COLS - 1, layout.rows - 1)).toBeNull();
  });

  test("has a hole punched through its top left corner, showing the night behind it", () => {
    expect(paintedAt(5, 5)).toBe(NIGHT);
    expect(paintedAt(3, 5)).toBe(NIGHT);
    expect(paintedAt(8, 5)).toBe(CREAM_PAPER);
  });

  test("has two red rules under the heading, with paper between them", () => {
    expect(paintedAt(30, 9)).toBe(RULE_RED);
    expect(paintedAt(30, 10)).toBe(CREAM_PAPER);
    expect(paintedAt(30, 11)).toBe(RULE_RED);
  });

  test("has a dotted tear line with a notch bitten out of each edge", () => {
    let row = layout.perforationRow;

    expect(paintedAt(3, row)).toBe(PERFORATION_TAN);
    expect(paintedAt(4, row)).toBe(CREAM_PAPER);
    expect(paintedAt(5, row)).toBe(PERFORATION_TAN);
    expect(paintedAt(0, row)).toBe(NIGHT);
    expect(paintedAt(PHONE_COLS - 1, row)).toBe(NIGHT);
  });
});

describe.each([MIN_LICENSE_COLS, PHONE_COLS, MAX_LICENSE_COLS])(
  "the layout at %i cells",
  (cols) => {
    let layout = licenseLayout(cols);

    test("keeps everything printed on it inside the paper", () => {
      for (let box of [layout.title, layout.level, layout.season, layout.tag]) {
        expect(inside(box, layout.cols, layout.rows)).toBe(true);
      }
    });

    test("sets the two stamps side by side at their own size, apart from each other", () => {
      expect(layout.level.width).toBe(STAMP_WIDTH);
      expect(layout.level.height).toBe(STAMP_HEIGHT);
      expect(layout.season.width).toBe(STAMP_WIDTH);
      expect(layout.level.y).toBe(layout.season.y);
      expect(layout.season.x).toBeGreaterThan(layout.level.x + layout.level.width);
    });

    test("stacks the heading, the rules, the stamps, the tear line, and the tag from top to bottom", () => {
      expect(layout.title.y + layout.title.height).toBeLessThan(9);
      expect(layout.level.y).toBeGreaterThan(11);
      expect(layout.level.y + layout.level.height).toBeLessThan(layout.perforationRow);
      expect(layout.tag.y).toBeGreaterThan(layout.perforationRow);
      expect(layout.tag.y + layout.tag.height).toBeLessThan(layout.rows - 1);
    });

    test("starts the heading clear of the punched hole", () => {
      expect(layout.title.x).toBeGreaterThan(8);
      expect(overlap(layout.title, layout.level)).toBe(false);
    });
  }
);

describe("the GO HUNTING tag", () => {
  let width = PHONE_COLS - 6;
  let height = 14;
  let tag = tagLayer(width, height, { face: "R", edge: "M" }, true);

  test("is red with a darker edge along the bottom", () => {
    expect(colorAt([tag], 33, 3)).toBe(RULE_RED);
    expect(colorAt([tag], 33, height - 1)).toBe(TAG_EDGE_RED);
    expect(colorAt([tag], 33, height - 2)).toBe(TAG_EDGE_RED);
    expect(colorAt([tag], 33, height - 3)).toBe(RULE_RED);
  });

  test("is cut to a point at its left end and square at its right", () => {
    expect(colorAt([tag], 0, 0)).toBeNull();
    expect(colorAt([tag], 0, 5)).toBe(RULE_RED);
    expect(colorAt([tag], width - 1, 0)).toBe(RULE_RED);
  });

  test("has a string hole near the point", () => {
    expect(colorAt([tag], 5, 6)).toBe(CREAM_PAPER);
    expect(colorAt([tag], 10, 6)).toBe(RULE_RED);
  });
});

describe("the JOURNAL tag", () => {
  let width = PHONE_COLS - 6;
  let height = 12;
  let tag = tagLayer(width, height, { face: "B", edge: "U" }, false);

  test("is leather brown with a darker edge, and has no string hole", () => {
    expect(colorAt([tag], 33, 3)).toBe(LEATHER_FACE);
    expect(colorAt([tag], 33, height - 1)).toBe(LEATHER_EDGE);
    expect(colorAt([tag], 5, 5)).toBe(LEATHER_FACE);
  });

  test("is shorter than the GO HUNTING tag", () => {
    expect(height).toBeLessThan(licenseLayout(PHONE_COLS).tag.height);
  });
});

describe("the notebook", () => {
  test("is drawn on a grid with every row as wide as the sprite says", () => {
    expect(NOTEBOOK.rows).toHaveLength(NOTEBOOK.h);
    for (let row of NOTEBOOK.rows) {
      expect(row).toHaveLength(NOTEBOOK.w);
    }
  });

  test("is leather with a red elastic band down one side and a cream label", () => {
    let paint = new Set(NOTEBOOK.rows.join(""));

    expect(paint.has("B")).toBe(true);
    expect(paint.has("R")).toBe(true);
    expect(paint.has("C")).toBe(true);
  });
});
