import { defineSprites } from "../compose.ts";
import type { Sprite } from "../types.ts";

export type TrailSignSpriteId = "sign-point-left" | "sign-point-right" | "sign-nail" | "sign-knot";

const POINT_HEIGHT = 13;
const POINT_WIDTH = 7;
const OUTLINE = "U";
const FACE = "B";
const HIGHLIGHT = "b";

function pointRows(): string[] {
  let middle = (POINT_HEIGHT - 1) / 2;
  return Array.from({ length: POINT_HEIGHT }, (_, y) => {
    let reach = POINT_WIDTH - Math.abs(y - middle);
    let cells = Array.from({ length: reach }, (_, x) => {
      if (x === reach - 1 || y === 0 || y === POINT_HEIGHT - 1) {
        return OUTLINE;
      }
      return y === 1 ? HIGHLIGHT : FACE;
    });
    return cells.join("").padEnd(POINT_WIDTH, ".");
  });
}

function mirrored(rows: readonly string[]): string[] {
  return rows.map((row) => [...row].reverse().join(""));
}

export const TRAIL_SIGN_SPRITES: Record<TrailSignSpriteId, Sprite> = defineSprites({
  "sign-point-right": pointRows(),
  "sign-point-left": mirrored(pointRows()),
  "sign-nail": ["HHh", "Hhh", "hhh"],
  "sign-knot": [".UUU.", "UBbBU", ".UUU."],
});
