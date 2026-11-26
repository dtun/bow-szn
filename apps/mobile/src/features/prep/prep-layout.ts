import { SIGHT_COLS } from "./sight-scene";

const MIN_CELL = 3;

export function sightCell(width: number, pixelRatio: number): number {
  let wholePixels = Math.floor((width * pixelRatio) / SIGHT_COLS);
  return Math.max(MIN_CELL, wholePixels / pixelRatio);
}
