import { SPRITES, type Sprite } from "@bow-szn/pixels";

import { spriteRuns } from "./sprite-runs";

const RED = "#e23b3b";
const GREEN = "#3e8e2f";

function sprite(rows: string[]): Sprite {
  return { name: "test", w: rows[0].length, h: rows.length, rows };
}

test("joins neighbors of one color on a row into a single run", () => {
  expect(spriteRuns(sprite(["RRRG"]))).toEqual([
    { x: 0, y: 0, width: 3, color: RED },
    { x: 3, y: 0, width: 1, color: GREEN },
  ]);
});

test("leaves transparent pixels out and keeps the gap between runs", () => {
  expect(spriteRuns(sprite(["R..R", "...."]))).toEqual([
    { x: 0, y: 0, width: 1, color: RED },
    { x: 3, y: 0, width: 1, color: RED },
  ]);
});

test("starts a new run on each row, even when the color matches the row above", () => {
  expect(spriteRuns(sprite(["GG", "GG"]))).toEqual([
    { x: 0, y: 0, width: 2, color: GREEN },
    { x: 0, y: 1, width: 2, color: GREEN },
  ]);
});

test("reads colors from the palette it is given", () => {
  expect(spriteRuns(sprite(["X"]), { X: "#123456" })).toEqual([
    { x: 0, y: 0, width: 1, color: "#123456" },
  ]);
});

test("an empty sprite has nothing to draw", () => {
  expect(spriteRuns(sprite(["...", "..."]))).toEqual([]);
});

test("the wordmark's runs add up to every opaque pixel in its grid", () => {
  let wordmark = SPRITES["logo-wordmark"];
  let opaquePixels = wordmark.rows.join("").replaceAll(".", "").length;
  let runPixels = spriteRuns(wordmark).reduce((total, run) => total + run.width, 0);

  expect(runPixels).toBe(opaquePixels);
});
