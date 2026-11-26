import { PALETTE, SPRITES, rasterize } from "../src/index.ts";
import type { Raster } from "../src/index.ts";
import { LABEL_FONT, LABEL_GLYPH_H, LABEL_GLYPH_W } from "./label-font.ts";

const SPRITE_SCALE = 6;
const LABEL_SCALE = 2;
const SHEET_WIDTH = 1800;
const PAD = 12;
const CELL_COLOR = [0x5f, 0xae, 0x3a];
const SHEET_COLOR = [0x13, 0x21, 0x4a];
const LABEL_COLOR = [0xf4, 0xef, 0xe1];
const LABEL_GAP = 1;

type Placed = { id: string; raster: Raster; x: number; y: number; cellW: number; cellH: number };

function labelWidth(text: string): number {
  return text.length * (LABEL_GLYPH_W + LABEL_GAP) * LABEL_SCALE;
}

function layout(): { placed: Placed[]; height: number } {
  let placed: Placed[] = [];
  let x = PAD;
  let y = PAD;
  let rowHeight = 0;
  for (let [id, sprite] of Object.entries(SPRITES)) {
    let raster = rasterize(sprite, PALETTE, SPRITE_SCALE);
    let cellW = Math.max(raster.width, labelWidth(id)) + PAD;
    let cellH = raster.height + LABEL_GLYPH_H * LABEL_SCALE + PAD * 2;
    if (x + cellW > SHEET_WIDTH) {
      x = PAD;
      y += rowHeight + PAD;
      rowHeight = 0;
    }
    placed.push({ id, raster, x, y, cellW, cellH });
    x += cellW + PAD;
    rowHeight = Math.max(rowHeight, cellH);
  }
  return { placed, height: y + rowHeight + PAD };
}

export function renderContactSheet(): Raster {
  let { placed, height } = layout();
  let rgba = new Uint8Array(SHEET_WIDTH * height * 4);

  function paint(x: number, y: number, [r, g, b]: number[]): void {
    let at = (y * SHEET_WIDTH + x) * 4;
    rgba[at] = r;
    rgba[at + 1] = g;
    rgba[at + 2] = b;
    rgba[at + 3] = 255;
  }

  function fill(x: number, y: number, w: number, h: number, color: number[]): void {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        paint(x + dx, y + dy, color);
      }
    }
  }

  fill(0, 0, SHEET_WIDTH, height, SHEET_COLOR);
  for (let { id, raster, x, y, cellW, cellH } of placed) {
    fill(x, y, cellW, cellH, CELL_COLOR);
    for (let py = 0; py < raster.height; py++) {
      for (let px = 0; px < raster.width; px++) {
        let at = (py * raster.width + px) * 4;
        if (raster.rgba[at + 3] !== 0) {
          paint(x + PAD / 2 + px, y + PAD / 2 + py, [
            raster.rgba[at],
            raster.rgba[at + 1],
            raster.rgba[at + 2],
          ]);
        }
      }
    }
    let labelX = x + PAD / 2;
    let labelY = y + PAD / 2 + raster.height + PAD / 2;
    fill(x, labelY - PAD / 4, cellW, LABEL_GLYPH_H * LABEL_SCALE + PAD / 2, SHEET_COLOR);
    [...id.toUpperCase()].forEach((char, index) => {
      let glyph = LABEL_FONT[char];
      if (!glyph) {
        return;
      }
      glyph.forEach((row, gy) => {
        [...row].forEach((cell, gx) => {
          if (cell === "X") {
            fill(
              labelX + (index * (LABEL_GLYPH_W + LABEL_GAP) + gx) * LABEL_SCALE,
              labelY + gy * LABEL_SCALE,
              LABEL_SCALE,
              LABEL_SCALE,
              LABEL_COLOR
            );
          }
        });
      });
    });
  }
  return { width: SHEET_WIDTH, height, rgba };
}
