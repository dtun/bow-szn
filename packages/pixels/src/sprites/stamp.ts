import { defineSprites } from "../compose.ts";
import type { Sprite } from "../types.ts";

export type StampSpriteId = "stamp-frame";

const STAMP_WIDTH = 30;
const STAMP_HEIGHT = 16;
const INK = "M";
const WORN_ONE_IN = 23;

function hashed(x: number, y: number): number {
  return (Math.imul(x, 73856093) ^ Math.imul(y, 19349663)) >>> 0;
}

function onFrame(x: number, y: number, inset: number): boolean {
  let left = inset;
  let right = STAMP_WIDTH - 1 - inset;
  let top = inset;
  let bottom = STAMP_HEIGHT - 1 - inset;
  let inside = x >= left && x <= right && y >= top && y <= bottom;
  let onEdge = x === left || x === right || y === top || y === bottom;
  let isCorner = (x === left || x === right) && (y === top || y === bottom);
  return inside && onEdge && !isCorner;
}

function frameRows(): string[] {
  return Array.from({ length: STAMP_HEIGHT }, (_, y) =>
    Array.from({ length: STAMP_WIDTH }, (_, x) => {
      let inked = onFrame(x, y, 0) || onFrame(x, y, 2);
      return inked && hashed(x, y) % WORN_ONE_IN !== 0 ? INK : ".";
    }).join("")
  );
}

export const STAMP_SPRITES: Record<StampSpriteId, Sprite> = defineSprites({
  "stamp-frame": frameRows(),
});
