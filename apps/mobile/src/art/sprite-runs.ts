import { PALETTE, TRANSPARENT, type Palette, type Sprite } from "@bow-szn/pixels";

export type Run = { x: number; y: number; width: number; color: string };

export function spriteRuns(sprite: Sprite, palette: Palette = PALETTE): Run[] {
  let runs: Run[] = [];

  for (let y = 0; y < sprite.h; y++) {
    let row = sprite.rows[y];
    let x = 0;
    while (x < sprite.w) {
      let char = row[x];
      if (char === TRANSPARENT) {
        x++;
        continue;
      }
      let start = x;
      while (x < sprite.w && row[x] === char) {
        x++;
      }
      runs.push({ x: start, y, width: x - start, color: palette[char] });
    }
  }

  return runs;
}
