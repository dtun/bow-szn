import { PALETTE, SPRITES, type Sprite } from "@bow-szn/pixels";

import { spriteRects } from "./sprite-rects";

const TINY: Sprite = {
  name: "tiny",
  w: 5,
  h: 3,
  rows: ["BBLL.", ".B..K", "....."],
};

test("joins each run of one color in a row into a single rect in that color", () => {
  expect(spriteRects(TINY)).toEqual([
    { key: "0,0", x: 0, y: 0, width: 2, height: 1, color: PALETTE.B },
    { key: "2,0", x: 2, y: 0, width: 2, height: 1, color: PALETTE.L },
    { key: "1,1", x: 1, y: 1, width: 1, height: 1, color: PALETTE.B },
    { key: "4,1", x: 4, y: 1, width: 1, height: 1, color: PALETTE.K },
  ]);
});

test("a tint joins every filled cell of a row into one rect in the tint", () => {
  expect(spriteRects(TINY, "#13214a")).toEqual([
    { key: "0,0", x: 0, y: 0, width: 4, height: 1, color: "#13214a" },
    { key: "1,1", x: 1, y: 1, width: 1, height: 1, color: "#13214a" },
    { key: "4,1", x: 4, y: 1, width: 1, height: 1, color: "#13214a" },
  ]);
});

test("a blank sprite has no rects", () => {
  expect(spriteRects({ name: "blank", w: 2, h: 1, rows: [".."] })).toEqual([]);
});

test("the rects of a real sprite cover exactly its filled cells", () => {
  let sprite = SPRITES["mount-buck-small"];
  let filled = sprite.rows.join("").replace(/\./g, "").length;

  let covered = spriteRects(sprite).reduce((sum, rect) => sum + rect.width * rect.height, 0);

  expect(covered).toBe(filled);
});
