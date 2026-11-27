import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { iconScene } from "../src/brand.ts";
import { PALETTE, rasterize } from "../src/index.ts";
import type { Raster, Sprite } from "../src/index.ts";
import { encodePng } from "../src/png.ts";
import { LABEL_FONT, LABEL_GLYPH_W } from "./label-font.ts";

type Rgb = readonly [number, number, number];
type Wallpaper = { name: string; top: Rgb; bottom: Rgb; glow: Rgb; ink: Rgb };
type Placeholder = {
  name: string;
  top: Rgb;
  bottom: Rgb;
  glyph: (u: number, v: number) => boolean;
};

const ICON_SIZE = 1024;
const CORNER_SHARE = 0.2237;
const SUPERSAMPLE = 4;
const GRID_COLUMNS = 4;
const GRID_ROWS = 2;
const HOME_ICON = 60;
const HOME_PITCH_X = 90;
const HOME_PITCH_Y = 96;
const HOME_MARGIN_X = 21;
const HOME_MARGIN_Y = 22;
const PANEL_W = 378;
const PANEL_H = 216;
const CONCEPT_SLOT = 1;
const GAP = 8;
const HEADING_H = 28;
const STRIP_H = 160;
const STRIP_GAP = 12;
const WHITE: Rgb = [255, 255, 255];
const SHEET_INK: Rgb = [0xf4, 0xef, 0xe1];
const SHEET_COLOR: Rgb = [0x1c, 0x1c, 0x22];
const BIG_SHEET_COLOR: Rgb = [0x80, 0x80, 0x86];

const WALLPAPERS: readonly Wallpaper[] = [
  {
    name: "light",
    top: [0xd9, 0xe6, 0xf5],
    bottom: [0xf6, 0xd9, 0xe2],
    glow: [0xff, 0xf4, 0xd6],
    ink: WHITE,
  },
  {
    name: "dark",
    top: [0x0e, 0x10, 0x1c],
    bottom: [0x1d, 0x1a, 0x33],
    glow: [0x2a, 0x2f, 0x52],
    ink: WHITE,
  },
];

function circle(cx: number, cy: number, r: number) {
  return (u: number, v: number) => Math.hypot(u - cx, v - cy) <= r;
}

function ring(cx: number, cy: number, outer: number, inner: number) {
  return (u: number, v: number) => {
    let d = Math.hypot(u - cx, v - cy);
    return d <= outer && d >= inner;
  };
}

function box(x0: number, y0: number, x1: number, y1: number) {
  return (u: number, v: number) => u >= x0 && u <= x1 && v >= y0 && v <= y1;
}

function any(...shapes: ((u: number, v: number) => boolean)[]) {
  return (u: number, v: number) => shapes.some((shape) => shape(u, v));
}

const PLACEHOLDERS: readonly Placeholder[] = [
  {
    name: "NOTES",
    top: [0xff, 0xe0, 0x66],
    bottom: [0xf5, 0xc4, 0x2c],
    glyph: any(box(0.22, 0.3, 0.78, 0.36), box(0.22, 0.47, 0.78, 0.53), box(0.22, 0.64, 0.6, 0.7)),
  },
  {
    name: "CLOCK",
    top: [0x3a, 0x3a, 0x40],
    bottom: [0x10, 0x10, 0x14],
    glyph: any(ring(0.5, 0.5, 0.36, 0.31), box(0.48, 0.24, 0.52, 0.52), box(0.48, 0.48, 0.7, 0.52)),
  },
  {
    name: "MAIL",
    top: [0x5a, 0xb8, 0xff],
    bottom: [0x1a, 0x6e, 0xf0],
    glyph: box(0.2, 0.3, 0.8, 0.7),
  },
  {
    name: "MAPS",
    top: [0x8e, 0xe0, 0x7a],
    bottom: [0x3c, 0xb0, 0x4c],
    glyph: any(circle(0.5, 0.42, 0.16), box(0.47, 0.42, 0.53, 0.78)),
  },
  {
    name: "CAMERA",
    top: [0xc8, 0xc8, 0xcc],
    bottom: [0x88, 0x88, 0x90],
    glyph: any(ring(0.5, 0.53, 0.2, 0.12), box(0.2, 0.32, 0.3, 0.36)),
  },
  {
    name: "MUSIC",
    top: [0xff, 0x6a, 0x88],
    bottom: [0xf0, 0x2a, 0x4c],
    glyph: any(circle(0.38, 0.66, 0.1), box(0.44, 0.24, 0.5, 0.66), box(0.44, 0.24, 0.66, 0.3)),
  },
  {
    name: "FILES",
    top: [0x6a, 0xb4, 0xff],
    bottom: [0x2e, 0x7c, 0xf0],
    glyph: any(box(0.2, 0.32, 0.45, 0.4), box(0.2, 0.38, 0.8, 0.72)),
  },
];

function canvas(width: number, height: number, [r, g, b]: Rgb): Raster {
  let rgba = new Uint8Array(width * height * 4);
  for (let at = 0; at < rgba.length; at += 4) {
    rgba[at] = r;
    rgba[at + 1] = g;
    rgba[at + 2] = b;
    rgba[at + 3] = 255;
  }
  return { width, height, rgba };
}

function mix(a: Rgb, b: Rgb, t: number): Rgb {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

function blend(target: Raster, x: number, y: number, color: Rgb, alpha: number): void {
  if (x < 0 || y < 0 || x >= target.width || y >= target.height || alpha <= 0) {
    return;
  }
  let at = (y * target.width + x) * 4;
  for (let c = 0; c < 3; c++) {
    target.rgba[at + c] = Math.round(target.rgba[at + c] * (1 - alpha) + color[c] * alpha);
  }
}

function pixel(source: Raster, x: number, y: number): Rgb {
  let at = (y * source.width + x) * 4;
  return [source.rgba[at], source.rgba[at + 1], source.rgba[at + 2]];
}

function areaWeights(from: number, to: number): { start: number; weights: number[] }[] {
  let step = from / to;
  return Array.from({ length: to }, (_, index) => {
    let left = index * step;
    let right = left + step;
    let start = Math.floor(left);
    let weights: number[] = [];
    for (let at = start; at < Math.ceil(right); at++) {
      weights.push((Math.min(right, at + 1) - Math.max(left, at)) / step);
    }
    return { start, weights };
  });
}

function downsample(source: Raster, size: number): Raster {
  let columns = areaWeights(source.width, size);
  let rows = areaWeights(source.height, size);
  let wide = new Float32Array(size * source.height * 3);
  for (let y = 0; y < source.height; y++) {
    columns.forEach(({ start, weights }, x) => {
      weights.forEach((weight, offset) => {
        let from = (y * source.width + start + offset) * 4;
        for (let c = 0; c < 3; c++) {
          wide[(y * size + x) * 3 + c] += source.rgba[from + c] * weight;
        }
      });
    });
  }
  let out = canvas(size, size, [0, 0, 0]);
  rows.forEach(({ start, weights }, y) => {
    for (let x = 0; x < size; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        weights.forEach((weight, offset) => {
          sum += wide[((start + offset) * size + x) * 3 + c] * weight;
        });
        out.rgba[(y * size + x) * 4 + c] = Math.round(sum);
      }
    }
  });
  return out;
}

function insideSquircle(u: number, v: number): boolean {
  let r = CORNER_SHARE;
  let dx = Math.max(r - u, u - (1 - r), 0);
  let dy = Math.max(r - v, v - (1 - r), 0);
  return dx * dx + dy * dy <= r * r;
}

function coverage(size: number, x: number, y: number, shape: (u: number, v: number) => boolean) {
  let hits = 0;
  for (let sy = 0; sy < SUPERSAMPLE; sy++) {
    for (let sx = 0; sx < SUPERSAMPLE; sx++) {
      let u = (x + (sx + 0.5) / SUPERSAMPLE) / size;
      let v = (y + (sy + 0.5) / SUPERSAMPLE) / size;
      if (shape(u, v)) {
        hits++;
      }
    }
  }
  return hits / (SUPERSAMPLE * SUPERSAMPLE);
}

function drawMasked(target: Raster, art: Raster, left: number, top: number): void {
  for (let y = 0; y < art.height; y++) {
    for (let x = 0; x < art.width; x++) {
      let alpha = coverage(art.width, x, y, insideSquircle);
      blend(target, left + x, top + y, pixel(art, x, y), alpha);
    }
  }
}

function drawPlaceholder(
  target: Raster,
  spec: Placeholder,
  size: number,
  left: number,
  top: number
) {
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let alpha = coverage(size, x, y, insideSquircle);
      blend(target, left + x, top + y, mix(spec.top, spec.bottom, y / size), alpha);
      blend(target, left + x, top + y, WHITE, alpha * coverage(size, x, y, spec.glyph));
    }
  }
}

function textWidth(text: string, scale: number): number {
  return (text.length * (LABEL_GLYPH_W + 1) - 1) * scale;
}

function drawText(
  target: Raster,
  text: string,
  left: number,
  top: number,
  scale: number,
  ink: Rgb
) {
  [...text].forEach((char, index) => {
    let glyph = LABEL_FONT[char];
    if (!glyph) {
      return;
    }
    glyph.forEach((row, gy) => {
      [...row].forEach((cell, gx) => {
        if (cell !== "X") {
          return;
        }
        for (let dy = 0; dy < scale; dy++) {
          for (let dx = 0; dx < scale; dx++) {
            let x = left + (index * (LABEL_GLYPH_W + 1) + gx) * scale + dx;
            let y = top + gy * scale + dy;
            blend(target, x + 1, y + 1, [0, 0, 0], 0.35);
            blend(target, x, y, ink, 1);
          }
        }
      });
    });
  });
}

function drawCenteredText(
  target: Raster,
  text: string,
  center: number,
  top: number,
  scale: number,
  ink: Rgb
) {
  drawText(target, text, Math.round(center - textWidth(text, scale) / 2), top, scale, ink);
}

function paintWallpaper(
  target: Raster,
  wall: Wallpaper,
  left: number,
  top: number,
  w: number,
  h: number
) {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let base = mix(wall.top, wall.bottom, y / h);
      let glow = Math.max(0, 1 - Math.hypot(x / w - 0.75, y / h - 0.2) * 1.6);
      blend(target, left + x, top + y, mix(base, wall.glow, glow * 0.8), 1);
    }
  }
}

function homeScreen(target: Raster, wall: Wallpaper, art: Raster, left: number, top: number) {
  paintWallpaper(target, wall, left, top, PANEL_W, PANEL_H);
  for (let slot = 0; slot < GRID_COLUMNS * GRID_ROWS; slot++) {
    let x = left + HOME_MARGIN_X + (slot % GRID_COLUMNS) * HOME_PITCH_X;
    let y = top + HOME_MARGIN_Y + Math.floor(slot / GRID_COLUMNS) * HOME_PITCH_Y;
    let name = "BOW SEASON";
    if (slot === CONCEPT_SLOT) {
      drawMasked(target, art, x, y);
    } else {
      let spec = PLACEHOLDERS[slot < CONCEPT_SLOT ? slot : slot - 1];
      drawPlaceholder(target, spec, HOME_ICON, x, y);
      name = spec.name;
    }
    drawCenteredText(target, name, x + HOME_ICON / 2, y + HOME_ICON + 7, 2, wall.ink);
  }
}

function sizeStrip(
  target: Raster,
  full: Raster,
  sizes: readonly number[],
  left: number,
  top: number,
  w: number,
  h: number
) {
  WALLPAPERS.forEach((wall, index) => {
    let panelLeft = left + (index * w) / 2;
    paintWallpaper(target, wall, panelLeft, top, w / 2, h);
    let x = panelLeft + STRIP_GAP;
    for (let size of sizes) {
      drawMasked(target, downsample(full, size), x, top + Math.round((h - size) / 2));
      x += size + STRIP_GAP;
    }
  });
}

type Entry = { name: string; scene: Sprite };

function renderSheet(entries: readonly Entry[]): Raster {
  let width = entries.length * PANEL_W + (entries.length + 1) * GAP;
  let stripTop = HEADING_H + GAP + WALLPAPERS.length * (PANEL_H + GAP);
  let height = stripTop + STRIP_H + GAP;
  let sheet = canvas(width, height, SHEET_COLOR);
  entries.forEach(({ name, scene }, column) => {
    let full = rasterize(scene, PALETTE, ICON_SIZE / scene.w);
    let home = downsample(full, HOME_ICON);
    let left = GAP + column * (PANEL_W + GAP);
    drawCenteredText(sheet, name, left + PANEL_W / 2, GAP, 3, SHEET_INK);
    WALLPAPERS.forEach((wall, row) => {
      homeScreen(sheet, wall, home, left, HEADING_H + GAP + row * (PANEL_H + GAP));
    });
    sizeStrip(sheet, full, [120, 40], left, stripTop, PANEL_W, STRIP_H);
  });
  return sheet;
}

function renderFullSize(entries: readonly Entry[]): Raster {
  let columns = Math.min(2, entries.length);
  let tile = ICON_SIZE + 2 * GAP * 4;
  let rows = Math.ceil(entries.length / columns);
  let sheet = canvas(columns * tile, rows * tile, BIG_SHEET_COLOR);
  entries.forEach(({ scene }, index) => {
    let full = rasterize(scene, PALETTE, ICON_SIZE / scene.w);
    drawMasked(
      sheet,
      full,
      (index % columns) * tile + GAP * 4,
      Math.floor(index / columns) * tile + GAP * 4
    );
  });
  return sheet;
}

let outPath = process.env.ICON_HOMESCREEN_PATH ?? join(tmpdir(), "bow-season-icon-homescreen.png");
let fullPath = outPath.replace(/\.png$/, "-1024.png");
let entries: Entry[] = [{ name: "APP ICON", scene: iconScene() }];
let sheet = renderSheet(entries);
writeFileSync(outPath, encodePng(sheet.width, sheet.height, sheet.rgba, { alpha: false }));
console.log(`wrote ${outPath}`);
let big = renderFullSize(entries);
writeFileSync(fullPath, encodePng(big.width, big.height, big.rgba, { alpha: false }));
console.log(`wrote ${fullPath}`);
