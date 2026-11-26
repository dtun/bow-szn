import { TRANSPARENT } from "./palette.ts";
import type { Sprite } from "./types.ts";

export function sprite(name: string, rows: readonly string[]): Sprite {
  return { name, w: rows[0].length, h: rows.length, rows };
}

export function defineSprites<Id extends string>(
  art: Record<Id, readonly string[]>
): Record<Id, Sprite> {
  let sprites = {} as Record<Id, Sprite>;
  for (let name of Object.keys(art) as Id[]) {
    sprites[name] = sprite(name, art[name]);
  }
  return sprites;
}

export function overlay(name: string, base: Sprite, top: Sprite, x: number, y: number): Sprite {
  let left = Math.min(0, x);
  let upper = Math.min(0, y);
  let w = Math.max(base.w, x + top.w) - left;
  let h = Math.max(base.h, y + top.h) - upper;
  let grid = Array.from({ length: h }, () => Array.from({ length: w }, () => TRANSPARENT));
  for (let [part, px, py] of [
    [base, -left, -upper],
    [top, x - left, y - upper],
  ] as const) {
    for (let row = 0; row < part.h; row++) {
      for (let col = 0; col < part.w; col++) {
        let char = part.rows[row][col];
        if (char !== TRANSPARENT) {
          grid[py + row][px + col] = char;
        }
      }
    }
  }
  return sprite(
    name,
    grid.map((cells) => cells.join(""))
  );
}
