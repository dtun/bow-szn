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

export function blank(name: string, w: number, h: number, fill: string = TRANSPARENT): Sprite {
  return sprite(
    name,
    Array.from({ length: h }, () => fill.repeat(w))
  );
}

export function recolor(name: string, source: Sprite, char: string): Sprite {
  return sprite(
    name,
    source.rows.map((row) =>
      [...row].map((cell) => (cell === TRANSPARENT ? TRANSPARENT : char)).join("")
    )
  );
}

export function disc(
  name: string,
  size: number,
  cx: number,
  cy: number,
  r: number,
  char: string
): Sprite {
  return sprite(
    name,
    Array.from({ length: size }, (_, y) =>
      Array.from({ length: size }, (_, x) =>
        Math.hypot(x - cx, y - cy) <= r ? char : TRANSPARENT
      ).join("")
    )
  );
}

export function erase(name: string, source: Sprite, char: string): Sprite {
  return sprite(
    name,
    source.rows.map((row) => row.replaceAll(char, TRANSPARENT))
  );
}

export function hstack(name: string, parts: readonly Sprite[], gap: number): Sprite {
  let h = Math.max(...parts.map((part) => part.h));
  let rows = Array.from({ length: h }, (_, y) =>
    parts
      .map((part) => (y < part.h ? part.rows[y] : TRANSPARENT.repeat(part.w)))
      .join(TRANSPARENT.repeat(gap))
  );
  return sprite(name, rows);
}

export function shadowed(name: string, source: Sprite, shadow: string): Sprite {
  return overlay(name, recolor(name, source, shadow), source, -1, -1);
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
