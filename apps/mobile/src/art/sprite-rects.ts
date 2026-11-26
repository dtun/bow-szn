import { PALETTE, TRANSPARENT, type Sprite } from "@bow-szn/pixels";

export type PixelRect = {
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
};

function runEnd(row: string, start: number, flat: boolean): number {
  let end = start + 1;
  while (end < row.length && (flat ? row[end] !== TRANSPARENT : row[end] === row[start])) {
    end += 1;
  }
  return end;
}

export function spriteRects(sprite: Sprite, tint?: string): PixelRect[] {
  let rects: PixelRect[] = [];
  sprite.rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      if (row[x] === TRANSPARENT) {
        x += 1;
        continue;
      }
      let end = runEnd(row, x, tint !== undefined);
      rects.push({
        key: `${x},${y}`,
        x,
        y,
        width: end - x,
        height: 1,
        color: tint ?? PALETTE[row[x]],
      });
      x = end;
    }
  });
  return rects;
}
