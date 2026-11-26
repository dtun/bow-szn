import { SPRITES } from "@bow-szn/pixels";

import type { SceneLayer, SceneRect, SceneSprite } from "@/art/scene";
import { rect } from "@/art/scene-shapes";

const SKY_BANDS: readonly { until: number; char: string }[] = [
  { until: 0.22, char: "n" },
  { until: 0.42, char: "Z" },
  { until: 0.62, char: "l" },
  { until: 0.8, char: "P" },
  { until: 1, char: "O" },
];
const FIELD_BANDS: readonly { rows: number; char: string }[] = [
  { rows: 5, char: "g" },
  { rows: 9, char: "G" },
  { rows: Infinity, char: "D" },
];
const TREELINE_OVERLAP = 1;

function skyRects(cols: number, horizon: number): SceneRect[] {
  let rects: SceneRect[] = [];
  let top = 0;
  SKY_BANDS.forEach((band, index) => {
    let bottom = index === SKY_BANDS.length - 1 ? horizon : Math.round(horizon * band.until);
    rects.push(rect(0, top, cols, bottom - top, band.char));
    let next = SKY_BANDS[index + 1];
    if (next && bottom > top) {
      for (let x = 0; x < cols; x += 2) {
        rects.push(rect(x, bottom - 1, 1, 1, next.char));
      }
    }
    top = bottom;
  });
  return rects;
}

function sunRects(cols: number, horizon: number): SceneRect[] {
  let centerX = Math.round(cols * 0.68);
  let centerY = horizon - 4;
  let radius = Math.max(5, Math.round(cols * 0.15));
  let rects: SceneRect[] = [];
  for (let offset = -radius; offset <= radius; offset++) {
    let row = centerY + offset;
    if (row < horizon) {
      let half = Math.floor(Math.sqrt(radius * radius - offset * offset));
      rects.push(rect(centerX - half, row, half * 2 + 1, 1, "Y"));
    }
  }
  return rects;
}

function hillRects(cols: number, horizon: number): SceneRect[] {
  let rects: SceneRect[] = [];
  let runStart = 0;
  function rise(x: number): number {
    return Math.round(4 + 2 * Math.sin(x / 6) + 1.5 * Math.sin(x / 2.3));
  }
  for (let x = 1; x <= cols; x++) {
    if (x === cols || rise(x) !== rise(runStart)) {
      let height = rise(runStart);
      rects.push(rect(runStart, horizon - height, x - runStart, height + 1, "h"));
      runStart = x;
    }
  }
  return rects;
}

function fieldRects(cols: number, rows: number, horizon: number): SceneRect[] {
  let rects: SceneRect[] = [];
  let top = horizon;
  FIELD_BANDS.forEach((band, index) => {
    let bottom = Math.min(rows, top + band.rows);
    if (bottom > top) {
      rects.push(rect(0, top, cols, bottom - top, band.char));
      let next = FIELD_BANDS[index + 1];
      if (next && bottom < rows) {
        for (let x = 0; x < cols; x += 2) {
          rects.push(rect(x, bottom - 1, 1, 1, next.char));
        }
      }
    }
    top = bottom;
  });
  return rects;
}

function treelineSprites(cols: number, horizon: number): SceneSprite[] {
  let treeline = SPRITES["brand-treeline"];
  let sprites: SceneSprite[] = [];
  for (let x = 0; x < cols; x += treeline.w) {
    sprites.push({ sprite: treeline, x, y: horizon - treeline.h + TREELINE_OVERLAP });
  }
  return sprites;
}

export function dawnBackdrop(cols: number, rows: number, horizonRow: number): SceneLayer {
  return {
    rects: [
      ...skyRects(cols, horizonRow),
      ...sunRects(cols, horizonRow),
      ...hillRects(cols, horizonRow),
      ...fieldRects(cols, rows, horizonRow),
    ],
    sprites: treelineSprites(cols, horizonRow),
  };
}
