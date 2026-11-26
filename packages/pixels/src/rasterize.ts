import { TRANSPARENT } from "./palette.ts";
import type { Palette, Sprite } from "./types.ts";

export type Raster = {
  width: number;
  height: number;
  rgba: Uint8Array;
};

function parseHex(hex: string): [number, number, number] {
  let value = parseInt(hex.slice(1), 16);
  return [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
}

export function rasterize(sprite: Sprite, palette: Palette, scale: number): Raster {
  let width = sprite.w * scale;
  let height = sprite.h * scale;
  let rgba = new Uint8Array(width * height * 4);

  for (let row = 0; row < sprite.h; row++) {
    for (let col = 0; col < sprite.w; col++) {
      let char = sprite.rows[row][col];
      if (char === TRANSPARENT) {
        continue;
      }
      let hex = palette[char];
      if (hex === undefined) {
        throw new Error(`${sprite.name}: no palette color for "${char}" at ${col},${row}`);
      }
      let [r, g, b] = parseHex(hex);
      for (let dy = 0; dy < scale; dy++) {
        let offset = ((row * scale + dy) * width + col * scale) * 4;
        for (let dx = 0; dx < scale; dx++) {
          rgba[offset++] = r;
          rgba[offset++] = g;
          rgba[offset++] = b;
          rgba[offset++] = 255;
        }
      }
    }
  }

  return { width, height, rgba };
}
