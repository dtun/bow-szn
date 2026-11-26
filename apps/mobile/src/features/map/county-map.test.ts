import { SPOTS, type SpotId } from "@bow-szn/core";

import { colorAt } from "@/art/test-support/color-at";

import { COUNTY_COLS, COUNTY_ROWS, countyMap, spotCell, TOWNS } from "./county-map";

const WATER = "#4aa8e0";
const SAND_BANK = "#e6d3a3";
const MEADOW_GREEN = "#3e8e2f";
const LIGHT_GRASS = "#5fae3a";
const MARSH_GREEN = "#2d6b24";
const DIRT_ROAD = "#c9a36b";
const DRY_GROUND = [MEADOW_GREEN, LIGHT_GRASS, MARSH_GREEN, DIRT_ROAD];
const SPOT_IDS = Object.keys(SPOTS) as SpotId[];

test("the four towns of Pine Knob County are Elder, Mason Fork, Bryce, and Oakley", () => {
  expect(TOWNS.map((town) => town.name)).toEqual(["ELDER", "MASON FORK", "BRYCE", "OAKLEY"]);
});

test.each(SPOT_IDS)("%s sits on dry ground, clear of the river, houses, and hills", (spot) => {
  let cell = spotCell(spot);

  expect(DRY_GROUND).toContain(colorAt(countyMap(), cell.x, cell.y));
});

test("each spot lands where the design's map position puts it", () => {
  expect(spotCell("cedar-hollow")).toEqual({ x: 10, y: 14 });
  expect(spotCell("high-ridge")).toEqual({ x: 31, y: 10 });
});

test("the river runs the whole height of the county", () => {
  let layers = countyMap();

  for (let row = 0; row < COUNTY_ROWS; row++) {
    let waterCells = [...Array(COUNTY_COLS).keys()].filter(
      (column) => colorAt(layers, column, row) === WATER
    );
    expect(waterCells.length).toBeGreaterThanOrEqual(1);
  }
});

test("the river has a sandy bank on both sides", () => {
  let layers = countyMap();
  let row = Math.floor(COUNTY_ROWS / 2);
  let banks = [...Array(COUNTY_COLS).keys()].filter(
    (column) => colorAt(layers, column, row) === SAND_BANK
  );

  expect(banks.length).toBe(2);
});

test.each(TOWNS)("$name stands on land, not in the river", (town) => {
  let column = Math.round(town.at.x * COUNTY_COLS);
  let row = Math.round(town.at.y * COUNTY_ROWS);
  let color = colorAt(countyMap(), column, row);

  expect(color).not.toBe(WATER);
  expect(color).not.toBe(SAND_BANK);
});

test.each(SPOT_IDS)("a dirt road runs within two cells of %s", (spot) => {
  let layers = countyMap();
  let center = spotCell(spot);
  let nearby = [-2, -1, 0, 1, 2].flatMap((dx) =>
    [-2, -1, 0, 1, 2].map((dy) => colorAt(layers, center.x + dx, center.y + dy))
  );

  expect(nearby).toContain(DIRT_ROAD);
});
