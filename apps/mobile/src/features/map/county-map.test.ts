import { SPOTS, type SpotId } from "@bow-szn/core";

import { colorAt } from "@/art/test-support/color-at";

import {
  COUNTY_COLS,
  COUNTY_ROWS,
  countyCell,
  countyMap,
  spotCell,
  TOWN_LABEL_CELLS_PER_CHAR,
  TOWN_LABEL_TOP_CELLS,
  TOWNS,
} from "./county-map";

describe("countyCell", () => {
  test("is the biggest whole number of pixels per cell that fits the width", () => {
    expect(countyCell(358, 1000)).toBe(4);
    expect(countyCell(408, 1000)).toBe(5);
  });

  test("is limited by the height when the screen is short", () => {
    expect(countyCell(408, 400)).toBe(4);
  });

  test("never drops below three pixels, even on a tiny screen", () => {
    expect(countyCell(100, 100)).toBe(3);
  });
});

const PAPER = "#ecdca8";
const PAPER_GRAIN = "#e6d3a3";
const CONTOUR = "#c9b27a";
const CREEK = "#2b6cd9";
const ROAD = "#9c7a45";
const GRAPHITE = ["#5b5772", "#8f8ba3"];
const BARE_PAPER = [PAPER, PAPER_GRAIN, CONTOUR];
const SPOT_IDS = Object.keys(SPOTS) as SpotId[];

function columnsOf(layers: ReturnType<typeof countyMap>, row: number, color: string): number[] {
  return [...Array(COUNTY_COLS).keys()].filter((column) => colorAt(layers, column, row) === color);
}

test("the four towns of Pine Knob County are Elder, Mason Fork, Bryce, and Oakley", () => {
  expect(TOWNS.map((town) => town.name)).toEqual(["ELDER", "MASON FORK", "BRYCE", "OAKLEY"]);
});

test("the county is one sheet of tan paper", () => {
  let layers = countyMap();
  let sampled = [...Array(COUNTY_ROWS).keys()]
    .filter((row) => row % 6 === 3)
    .flatMap((row) => [3, 17, 31, 47, 59, 71].map((column) => colorAt(layers, column, row)));
  let onPaper = sampled.filter((color) => BARE_PAPER.concat(CREEK, ROAD).includes(color ?? ""));

  expect(sampled.filter((color) => color === null)).toEqual([]);
  expect(onPaper.length).toBeGreaterThanOrEqual(sampled.length * 0.7);
});

test("the paper has a pencil edge on all four sides", () => {
  let layers = countyMap();

  expect(colorAt(layers, 0, 40)).toBe(CONTOUR);
  expect(colorAt(layers, COUNTY_COLS - 1, 40)).toBe(CONTOUR);
  expect(colorAt(layers, 40, COUNTY_ROWS - 1)).toBe(CONTOUR);
  expect(colorAt(layers, 12, 0)).toBe(CONTOUR);
});

test.each(SPOT_IDS)("%s sits on bare paper or a road, clear of the creek", (spot) => {
  let cell = spotCell(spot);

  expect(BARE_PAPER.concat(ROAD)).toContain(colorAt(countyMap(), cell.x, cell.y));
});

test("each spot lands where the design's map position puts it", () => {
  expect(spotCell("cedar-hollow")).toEqual({ x: 21, y: 29 });
  expect(spotCell("high-ridge")).toEqual({ x: 62, y: 19 });
});

test("the creek is drawn in blue pencil on every row, top to bottom", () => {
  let layers = countyMap();

  for (let row = 0; row < COUNTY_ROWS; row++) {
    expect(columnsOf(layers, row, CREEK).length).toBeGreaterThanOrEqual(1);
  }
});

test("the creek runs beside Miller Bottoms, the hayfield by the creek", () => {
  let layers = countyMap();
  let miller = spotCell("miller-bottoms");
  let distances = columnsOf(layers, miller.y, CREEK).map((column) => Math.abs(column - miller.x));

  expect(Math.min(...distances)).toBeLessThanOrEqual(10);
});

test.each(TOWNS)("$name stands on land, not in the creek", (town) => {
  let column = Math.round(town.at.x * COUNTY_COLS);
  let row = Math.round(town.at.y * COUNTY_ROWS);

  expect(colorAt(countyMap(), column, row)).not.toBe(CREEK);
});

test.each(TOWNS)("$name's house is sketched in graphite just above its name", (town) => {
  let column = Math.round(town.at.x * COUNTY_COLS);
  let row = Math.round(town.at.y * COUNTY_ROWS);

  expect(GRAPHITE).toContain(colorAt(countyMap(), column - 3, row));
});

test.each(SPOT_IDS)("a dotted dirt road runs within two cells of %s", (spot) => {
  let layers = countyMap();
  let center = spotCell(spot);
  let nearby = [-2, -1, 0, 1, 2].flatMap((dx) =>
    [-2, -1, 0, 1, 2].map((dy) => colorAt(layers, center.x + dx, center.y + dy))
  );

  expect(nearby).toContain(ROAD);
});

test("faint contour lines ring the high ridge on both sides of it", () => {
  let layers = countyMap();
  let ridge = spotCell("high-ridge");
  let lines = columnsOf(layers, ridge.y, CONTOUR);

  expect(lines.filter((column) => column < ridge.x).length).toBeGreaterThanOrEqual(2);
  expect(lines.filter((column) => column > ridge.x).length).toBeGreaterThanOrEqual(2);
});

test.each(SPOT_IDS)("no tree or peak is sketched where the pin for %s stands", (spot) => {
  let layers = countyMap();
  let center = spotCell(spot);
  let pinArea = [-4, -2, 0, 2, 4].flatMap((dx) =>
    [-10, -7, -4, -1].map((dy) => colorAt(layers, center.x + dx, center.y + dy))
  );

  expect(pinArea.filter((color) => GRAPHITE.includes(color ?? ""))).toEqual([]);
});

test.each(TOWNS)("no sketch crosses where $name's name is printed", (town) => {
  let layers = countyMap();
  let column = Math.round(town.at.x * COUNTY_COLS);
  let row = Math.round(town.at.y * COUNTY_ROWS);
  let half = Math.floor((town.name.length * TOWN_LABEL_CELLS_PER_CHAR) / 2);
  let under = [...Array(half * 2).keys()].flatMap((dx) =>
    [TOWN_LABEL_TOP_CELLS, TOWN_LABEL_TOP_CELLS + 3].map((dy) =>
      colorAt(layers, column - half + dx, row + dy)
    )
  );

  expect(under.filter((color) => GRAPHITE.includes(color ?? ""))).toEqual([]);
});

test("the bottom-right corner is left clear for the season stamp", () => {
  let layers = countyMap();
  let corner = [48, 56, 64, 72, 78].flatMap((column) =>
    [72, 78, 84, 90, 94].map((row) => colorAt(layers, column, row))
  );

  expect(corner.filter((color) => GRAPHITE.includes(color ?? ""))).toEqual([]);
});
