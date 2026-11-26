import { createPrep, type PrepState } from "@bow-szn/core";

import type { SceneLayer } from "@/art/scene";
import { colorAt } from "@/art/test-support/color-at";

import { BAR_ROWS, BENCH_ROWS, benchScene, prepBarScene, waxPlacement } from "./prep-scene";

const TRACK = "#0b0f1a";
const ZONE_GREEN = "#5fae3a";
const MARKER_YELLOW = "#f7d44a";
const WAX_CREAM = "#ecdca8";
const STRING_CREAM = "#f4efe1";
const BAR_COLS = 40;
const MIDDLE_ROW = Math.floor(BAR_ROWS / 2);

function prepAt(markerPos: number, zone: readonly [number, number]): PrepState {
  return { ...createPrep("easy", 1), markerPos, zone };
}

function waxCells(hits: number, cols: number) {
  let layers = benchScene(cols, hits, 3);
  let cells: { x: number; y: number }[] = [];
  for (let y = 0; y < BENCH_ROWS; y++) {
    for (let x = 0; x < cols; x++) {
      if (colorAt(layers, x, y) === WAX_CREAM) {
        cells.push({ x, y });
      }
    }
  }
  return { layers, cells };
}

function waxTop(hits: number): number {
  return Math.min(...waxCells(hits, 65).cells.map((cell) => cell.y));
}

function greenCells(layers: SceneLayer[]): number {
  return [...Array(BAR_COLS).keys()].filter(
    (column) => colorAt(layers, column, MIDDLE_ROW) === ZONE_GREEN
  ).length;
}

describe("the timing bar", () => {
  test("shows the green zone where the zone sits on the bar", () => {
    let layers = prepBarScene(prepAt(0.1, [0.5, 0.75]), BAR_COLS);

    expect(colorAt(layers, 25, MIDDLE_ROW)).toBe(ZONE_GREEN);
    expect(colorAt(layers, 15, MIDDLE_ROW)).toBe(TRACK);
    expect(colorAt(layers, 35, MIDDLE_ROW)).toBe(TRACK);
  });

  test("shows the yellow marker where the marker sits on the bar", () => {
    let layers = prepBarScene(prepAt(0.25, [0.5, 0.75]), BAR_COLS);

    expect(colorAt(layers, 10, MIDDLE_ROW)).toBe(MARKER_YELLOW);
    expect(colorAt(layers, 15, MIDDLE_ROW)).toBe(TRACK);
  });

  test("draws the marker over the zone when it is inside it", () => {
    let layers = prepBarScene(prepAt(0.6, [0.5, 0.75]), BAR_COLS);

    expect(colorAt(layers, 24, MIDDLE_ROW)).toBe(MARKER_YELLOW);
    expect(colorAt(layers, 28, MIDDLE_ROW)).toBe(ZONE_GREEN);
  });

  test("keeps the marker on the bar at both ends of the sweep", () => {
    let atStart = prepBarScene(prepAt(0, [0.5, 0.75]), BAR_COLS);
    let atEnd = prepBarScene(prepAt(1, [0.5, 0.75]), BAR_COLS);

    expect(colorAt(atStart, 0, MIDDLE_ROW)).toBe(MARKER_YELLOW);
    expect(colorAt(atEnd, BAR_COLS - 1, MIDDLE_ROW)).toBe(MARKER_YELLOW);
    expect(colorAt(atEnd, BAR_COLS - 3, MIDDLE_ROW)).toBe(TRACK);
  });

  test("a narrower zone paints fewer green cells", () => {
    let wide = prepBarScene(prepAt(0, [0.4, 0.7]), BAR_COLS);
    let narrow = prepBarScene(prepAt(0, [0.4, 0.55]), BAR_COLS);
    expect(greenCells(narrow)).toBeLessThan(greenCells(wide));
  });
});

describe("the bench", () => {
  test("the wax block slides up the string with each hit and stays at the top when done", () => {
    let rowsAtEachHit = [0, 1, 2, 3].map((hits) => waxPlacement(hits, 3).row);

    expect(rowsAtEachHit[0]).toBeGreaterThan(rowsAtEachHit[1]);
    expect(rowsAtEachHit[1]).toBeGreaterThan(rowsAtEachHit[2]);
    expect(rowsAtEachHit[3]).toBe(rowsAtEachHit[2]);
  });

  test.each([0, 1, 2, 3])("with %i hits the wax block rests against the bow string", (hits) => {
    let { layers, cells } = waxCells(hits, 65);
    let lowestRow = Math.max(...cells.map((cell) => cell.y));
    let rightmost = cells
      .filter((cell) => cell.y === lowestRow)
      .reduce((best, cell) => (cell.x > best.x ? cell : best));

    expect(cells.length).toBeGreaterThan(0);
    expect(colorAt(layers, rightmost.x + 1, rightmost.y)).toBe(STRING_CREAM);
  });

  test("the wax block moves up the screen as hits land", () => {
    expect(waxTop(1)).toBeLessThan(waxTop(0));
    expect(waxTop(2)).toBeLessThan(waxTop(1));
  });
});
