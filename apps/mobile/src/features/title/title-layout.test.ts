import { horizonRowFor, sceneGrid } from "./title-layout";

test("a phone's sky is about 90 cells across, each a whole number of points wide", () => {
  expect(sceneGrid({ width: 390, height: 450 })).toEqual({ cell: 4, cols: 98, rows: 113 });
});

test("a tablet gets bigger cells, so the picture stays about 90 cells across", () => {
  expect(sceneGrid({ width: 820, height: 1180 })).toEqual({ cell: 9, cols: 92, rows: 132 });
});

test("a very narrow screen never gets cells smaller than 3 points", () => {
  expect(sceneGrid({ width: 200, height: 300 })).toEqual({ cell: 3, cols: 67, rows: 100 });
});

describe("horizonRowFor", () => {
  let TALL = { rows: 213, cell: 4, menuHeight: 334, skyTopRow: 44 };

  test("leaves 26 rows of grass above the menu, so the doe stands near the license", () => {
    expect(horizonRowFor(TALL)).toBe(213 - 84 - 26);
  });

  test("a taller screen adds sky, not grass: the horizon moves down by exactly the extra rows", () => {
    expect(horizonRowFor({ ...TALL, rows: TALL.rows + 10 })).toBe(horizonRowFor(TALL) + 10);
  });

  test("a bigger menu pushes the horizon up by the rows it takes", () => {
    expect(horizonRowFor({ ...TALL, menuHeight: 334 + 40 })).toBe(horizonRowFor(TALL) - 10);
  });

  test("a short screen still gets 30 rows of sky under the tagline, and the license covers the grass instead", () => {
    let short = { rows: 167, cell: 4, menuHeight: 300, skyTopRow: 38 };

    expect(horizonRowFor(short)).toBe(38 + 30);
  });
});
