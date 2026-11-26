import type { PrepState } from "@bow-szn/core";
import { PALETTE, SPRITES } from "@bow-szn/pixels";

import type { SceneLayer, SceneRect } from "@/art/scene";

export const BAR_ROWS = 5;
export const BENCH_ROWS = 32;

const MARKER_COLS = 2;
const PLANK_ROWS = 8;
const BOW = SPRITES["brand-bow"];
const WAX_STOPS = [18, 12, 6];
const WAX_WIDTH = 4;
const WAX_HEIGHT = 3;

function rect(x: number, y: number, width: number, height: number, char: string): SceneRect {
  return { x, y, width, height, color: PALETTE[char] };
}

export function prepBarScene(prep: PrepState, cols: number): SceneLayer[] {
  let zoneStart = Math.round(prep.zone[0] * cols);
  let zoneEnd = Math.round(prep.zone[1] * cols);
  let markerCol = Math.min(
    cols - MARKER_COLS,
    Math.max(0, Math.round(prep.markerPos * cols - MARKER_COLS / 2))
  );

  return [
    {
      rects: [
        rect(0, 0, cols, BAR_ROWS, "N"),
        rect(1, 1, cols - 2, BAR_ROWS - 2, "S"),
        rect(zoneStart, 1, zoneEnd - zoneStart, BAR_ROWS - 2, "g"),
        rect(zoneStart, 1, 1, BAR_ROWS - 2, "G"),
        rect(zoneEnd - 1, 1, 1, BAR_ROWS - 2, "G"),
        rect(markerCol, 0, MARKER_COLS, BAR_ROWS, "Y"),
        rect(markerCol, 0, MARKER_COLS, 1, "W"),
      ],
      sprites: [],
    },
  ];
}

function plankRects(cols: number, rows: number): SceneRect[] {
  let rects: SceneRect[] = [];
  for (let top = 0; top < rows; top += PLANK_ROWS) {
    rects.push(rect(0, top, cols, PLANK_ROWS, "B"));
    rects.push(rect(0, top + PLANK_ROWS - 1, cols, 1, "U"));
    rects.push(rect(0, top + 1, cols, 1, "b"));
    for (let grain = 0; grain < 5; grain++) {
      let x = (grain * 37 + top * 11) % Math.max(1, cols - 8);
      rects.push(rect(x, top + 3 + (grain % 3), 6, 1, "U"));
    }
  }
  return rects;
}

export function waxPlacement(hits: number, needed: number): { column: number; row: number } {
  let stop = Math.min(hits, needed - 1) / Math.max(1, needed - 1);
  let row = WAX_STOPS[Math.min(WAX_STOPS.length - 1, Math.round(stop * (WAX_STOPS.length - 1)))];
  return { column: BOW.rows[row].indexOf("C"), row };
}

export function benchScene(cols: number, hits: number, needed: number): SceneLayer[] {
  let bowX = Math.round((cols - BOW.w) / 2);
  let bowY = Math.round((BENCH_ROWS - BOW.h) / 2);
  let wax = waxPlacement(hits, needed);
  let waxX = bowX + wax.column - WAX_WIDTH;
  let waxY = bowY + wax.row - 1;

  return [
    { rects: plankRects(cols, BENCH_ROWS), sprites: [{ sprite: BOW, x: bowX, y: bowY }] },
    {
      rects: [
        rect(waxX, waxY, WAX_WIDTH, WAX_HEIGHT, "A"),
        rect(waxX, waxY + WAX_HEIGHT - 1, WAX_WIDTH, 1, "a"),
        rect(waxX + 1, waxY, 1, 1, "W"),
      ],
      sprites: [],
    },
  ];
}
