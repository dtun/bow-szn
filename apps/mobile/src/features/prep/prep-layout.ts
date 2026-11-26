import { SIGHT_COLS, SIGHT_ROWS } from "./sight-scene";

export type Screen = { width: number; height: number; insetTop: number; insetBottom: number };

export type PrepLayout = {
  cell: number;
  cols: number;
  rows: number;
  horizonRow: number;
  groundRow: number;
  baleLeft: number;
  baleTop: number;
  headingTop: number;
  plateTop: number;
};

export const HEADING_HEIGHT = 40;
export const PLATE_HEIGHT = 76;
export const PLATE_MAX_WIDTH = 280;
export const PLATE_MIN_MARGIN = 16;

const MIN_CELL = 3;
const SIGNS_BOTTOM = 60;
const HEADING_GAP = 16;
const PLATE_GAP = 20;
const BOTTOM_GAP = 12;
const HORIZON_ABOVE_BALE_ROWS = 8;
const SUN_SKY_ROWS = 22;
const SKY_SHARE_OF_SPARE_ROOM = 0.6;

export function sightCell(width: number, pixelRatio: number): number {
  let wholePixels = Math.floor((width * pixelRatio) / SIGHT_COLS);
  return Math.max(MIN_CELL, wholePixels / pixelRatio);
}

export function prepLayout(screen: Screen, pixelRatio: number): PrepLayout {
  let { width, height, insetTop, insetBottom } = screen;
  let cell = sightCell(width, pixelRatio);
  let baleHeight = SIGHT_ROWS * cell;
  let headingTop = insetTop + SIGNS_BOTTOM + HEADING_GAP;
  let headingBottom = headingTop + HEADING_HEIGHT;
  let groupHeight = baleHeight + PLATE_GAP + PLATE_HEIGHT;
  let roomBelowHeading = height - insetBottom - BOTTOM_GAP - headingBottom;
  let spareRoom = roomBelowHeading - groupHeight;
  let roomyTopRow = Math.round((headingBottom + spareRoom * SKY_SHARE_OF_SPARE_ROOM) / cell);
  let lowestSkyRow = Math.ceil(headingBottom / cell) + SUN_SKY_ROWS + HORIZON_ABOVE_BALE_ROWS;
  let baleTopRow = Math.max(roomyTopRow, lowestSkyRow);
  let baleTop = baleTopRow * cell;
  let baleLeft = Math.round(((width - SIGHT_COLS * cell) / 2) * pixelRatio) / pixelRatio;

  return {
    cell,
    cols: Math.ceil(width / cell),
    rows: Math.ceil(height / cell),
    horizonRow: baleTopRow - HORIZON_ABOVE_BALE_ROWS,
    groundRow: baleTopRow + SIGHT_ROWS,
    baleLeft,
    baleTop,
    headingTop,
    plateTop: baleTop + baleHeight + PLATE_GAP,
  };
}
