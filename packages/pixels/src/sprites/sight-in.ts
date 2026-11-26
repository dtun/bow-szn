import { defineSprites } from "../compose.ts";
import type { Sprite } from "../types.ts";

export type SightInSpriteId = "bale-target" | "bale-arrow" | "sight-pin";

const BALE_WIDTH = 80;
const BALE_HEIGHT = 44;
const MAX_RAGGED_INSET = 2;
const TWINE_COLUMNS = [18, 19, 60, 61];
const STRAW = "T";
const STRAW_LIGHT = "L";
const STRAW_DARK = "t";
const TWINE = "U";
const TWINE_LIGHT = "B";

function hashed(x: number, y: number): number {
  return (Math.imul(x, 73856093) ^ Math.imul(y, 19349663)) >>> 0;
}

function ragged(x: number, y: number, salt: number): number {
  return hashed(x + salt, y * 3 + salt) % (MAX_RAGGED_INSET + 1);
}

function isStrawEnd(x: number, y: number): boolean {
  return (
    y < ragged(x, 0, 1) ||
    y >= BALE_HEIGHT - ragged(x, 0, 2) ||
    x < ragged(0, y, 3) ||
    x >= BALE_WIDTH - ragged(0, y, 4)
  );
}

function strawPixel(x: number, y: number): string {
  if (TWINE_COLUMNS.includes(x)) {
    return x % 2 === 0 ? TWINE : TWINE_LIGHT;
  }
  if (y >= BALE_HEIGHT - 3) {
    return y === BALE_HEIGHT - 1 ? TWINE : STRAW_DARK;
  }
  if (y <= 1) {
    return STRAW_LIGHT;
  }
  let dash = hashed(x >> 1, y) % 9;
  if (dash === 0) {
    return STRAW_LIGHT;
  }
  if (dash === 1) {
    return STRAW_DARK;
  }
  return STRAW;
}

function baleRows(): string[] {
  return Array.from({ length: BALE_HEIGHT }, (_, y) =>
    Array.from({ length: BALE_WIDTH }, (_, x) => (isStrawEnd(x, y) ? "." : strawPixel(x, y))).join(
      ""
    )
  );
}

export const SIGHT_IN_SPRITES: Record<SightInSpriteId, Sprite> = defineSprites({
  "bale-target": baleRows(),
  "bale-arrow": [
    "..C..",
    ".RCR.",
    ".RCR.",
    "R.C.R",
    "..C..",
    "..C..",
    "..C..",
    "..C..",
    "..C..",
    ".EEE.",
  ],
  "sight-pin": [".KKK.", "KWWWK", "KWRWK", "KWWWK", ".KKK."],
});
