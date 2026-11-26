import { SPOTS, type SpotId, type Vec2 } from "@bow-szn/core";
import { PALETTE, type Sprite } from "@bow-szn/pixels";

import type { SceneLayer, SceneRect, SceneSprite } from "@/art/scene";

export const COUNTY_COLS = 40;
export const COUNTY_ROWS = 48;

const MIN_CELL = 4;

export function countyCell(availableWidth: number, availableHeight: number): number {
  let fits = Math.floor(Math.min(availableWidth / COUNTY_COLS, availableHeight / COUNTY_ROWS));
  return Math.max(MIN_CELL, fits);
}

export type Town = { name: string; at: Vec2 };

export const TOWNS: readonly Town[] = [
  { name: "ELDER", at: { x: 0.18, y: 0.1 } },
  { name: "MASON FORK", at: { x: 0.32, y: 0.52 } },
  { name: "BRYCE", at: { x: 0.82, y: 0.44 } },
  { name: "OAKLEY", at: { x: 0.2, y: 0.86 } },
];

type Cell = { x: number; y: number };

const RIVER: readonly Vec2[] = [
  { x: 0.48, y: 0 },
  { x: 0.5, y: 0.12 },
  { x: 0.42, y: 0.25 },
  { x: 0.46, y: 0.38 },
  { x: 0.58, y: 0.46 },
  { x: 0.54, y: 0.6 },
  { x: 0.42, y: 0.72 },
  { x: 0.44, y: 0.86 },
  { x: 0.5, y: 1 },
];
const BANK_HALF_WIDTH = 2;
const WATER_HALF_WIDTH = 1;

const ROADS: readonly (readonly Vec2[])[] = [
  [
    TOWNS[0].at,
    SPOTS["cedar-hollow"].mapPos,
    TOWNS[1].at,
    SPOTS["miller-bottoms"].mapPos,
    TOWNS[2].at,
  ],
  [TOWNS[1].at, SPOTS["cattail-marsh"].mapPos, TOWNS[3].at],
  [TOWNS[2].at, SPOTS["high-ridge"].mapPos],
];

const TREE: Sprite = {
  name: "county-tree",
  w: 5,
  h: 5,
  rows: [".DDD.", "DgDDD", "DDDDF", ".FFF.", "..U.."],
};

const PINE: Sprite = {
  name: "county-pine",
  w: 5,
  h: 7,
  rows: ["..F..", ".FDF.", "..F..", ".FDF.", "FDDDF", "..U..", "..U.."],
};

const HOUSE: Sprite = {
  name: "county-house",
  w: 5,
  h: 4,
  rows: ["..R..", ".RRR.", "CCCCC", "CnUUC"],
};

const HOUSES_AT: readonly Cell[] = [
  { x: -6, y: -3 },
  { x: 0, y: -4 },
  { x: -2, y: 1 },
];

const FOREST_AT: readonly Cell[] = [
  { x: -9, y: -6 },
  { x: 5, y: -7 },
  { x: -10, y: 2 },
  { x: 7, y: 3 },
  { x: -3, y: -9 },
  { x: 2, y: 6 },
];

const MARSH_PUDDLES: readonly Cell[] = [
  { x: -6, y: -2 },
  { x: 3, y: -3 },
  { x: -3, y: 4 },
  { x: 5, y: 3 },
];

const MOUNDS: readonly { at: Cell; half: number }[] = [
  { at: { x: -8, y: 5 }, half: 4 },
  { at: { x: 7, y: 6 }, half: 5 },
  { at: { x: -2, y: -6 }, half: 3 },
];

const SCATTER: readonly { at: Cell; sprite: Sprite }[] = [
  { at: { x: 1, y: 20 }, sprite: PINE },
  { at: { x: 34, y: 28 }, sprite: PINE },
  { at: { x: 29, y: 40 }, sprite: PINE },
  { at: { x: 2, y: 38 }, sprite: PINE },
  { at: { x: 20, y: 2 }, sprite: PINE },
  { at: { x: 30, y: 10 }, sprite: PINE },
  { at: { x: 34, y: 18 }, sprite: TREE },
  { at: { x: 9, y: 30 }, sprite: TREE },
  { at: { x: 35, y: 41 }, sprite: TREE },
  { at: { x: 12, y: 44 }, sprite: TREE },
  { at: { x: 22, y: 30 }, sprite: TREE },
  { at: { x: 1, y: 6 }, sprite: TREE },
];

function rect(x: number, y: number, width: number, height: number, char: string): SceneRect {
  return { x, y, width, height, color: PALETTE[char] };
}

function hashed(x: number, y: number): number {
  return (Math.imul(x, 73856093) ^ Math.imul(y, 19349663)) >>> 0;
}

function cellOf(at: Vec2): Cell {
  return { x: Math.round(at.x * COUNTY_COLS), y: Math.round(at.y * COUNTY_ROWS) };
}

export function spotCell(spot: SpotId): Cell {
  return cellOf(SPOTS[spot].mapPos);
}

function riverCenter(row: number): number {
  let along = (row + 0.5) / COUNTY_ROWS;
  let upper = RIVER.findIndex((point) => point.y >= along);
  let end = RIVER[Math.max(upper, 1)];
  let start = RIVER[Math.max(upper, 1) - 1];
  let share = (along - start.y) / (end.y - start.y);
  return Math.round((start.x + (end.x - start.x) * share) * COUNTY_COLS);
}

function isRiver(x: number, y: number): boolean {
  return Math.abs(x - riverCenter(y)) <= BANK_HALF_WIDTH;
}

function roadCells(): Cell[] {
  let seen = new Set<string>();
  let cells: Cell[] = [];
  for (let road of ROADS) {
    for (let index = 1; index < road.length; index++) {
      let from = cellOf(road[index - 1]);
      let to = cellOf(road[index]);
      let steps = Math.max(Math.abs(to.x - from.x), Math.abs(to.y - from.y));
      for (let step = 0; step <= steps; step += 2) {
        let cell = {
          x: Math.round(from.x + ((to.x - from.x) * step) / steps),
          y: Math.round(from.y + ((to.y - from.y) * step) / steps),
        };
        let key = `${cell.x},${cell.y}`;
        if (!seen.has(key)) {
          seen.add(key);
          cells.push(cell);
        }
      }
    }
  }
  return cells;
}

function groundRects(): SceneRect[] {
  let rects = [rect(0, 0, COUNTY_COLS, COUNTY_ROWS, "G")];
  for (let y = 0; y < COUNTY_ROWS; y++) {
    for (let x = 0; x < COUNTY_COLS; x++) {
      if (hashed(x, y) % 7 === 0) {
        rects.push(rect(x, y, 1, 1, "g"));
      }
    }
  }
  return rects;
}

function terrainPatches(): SceneRect[] {
  let rects: SceneRect[] = [];

  let meadow = spotCell("miller-bottoms");
  rects.push(rect(meadow.x - 7, meadow.y - 5, 14, 10, "g"));
  for (let index = 0; index < 14; index++) {
    let x = meadow.x - 7 + (hashed(index, 3) % 14);
    let y = meadow.y - 5 + (hashed(index, 5) % 10);
    if (x !== meadow.x || y !== meadow.y) {
      rects.push(rect(x, y, 1, 1, "Y"));
    }
  }

  let marsh = spotCell("cattail-marsh");
  rects.push(rect(marsh.x - 8, marsh.y - 5, 16, 10, "D"));
  for (let puddle of MARSH_PUDDLES) {
    rects.push(rect(marsh.x + puddle.x, marsh.y + puddle.y, 3, 1, "Z"));
    rects.push(rect(marsh.x + puddle.x + 1, marsh.y + puddle.y - 2, 1, 2, "T"));
  }

  let ridge = spotCell("high-ridge");
  for (let mound of MOUNDS) {
    let top = ridge.y + mound.at.y - mound.half;
    for (let level = 0; level < mound.half; level++) {
      let width = level * 2 + 1;
      rects.push(
        rect(ridge.x + mound.at.x - level, top + level, width, 1, level === 0 ? "W" : "H")
      );
    }
  }

  return rects;
}

function riverRects(): SceneRect[] {
  let rects: SceneRect[] = [];
  for (let y = 0; y < COUNTY_ROWS; y++) {
    let center = riverCenter(y);
    rects.push(rect(center - BANK_HALF_WIDTH, y, BANK_HALF_WIDTH * 2 + 1, 1, "L"));
    rects.push(rect(center - WATER_HALF_WIDTH, y, WATER_HALF_WIDTH * 2 + 1, 1, "Z"));
  }
  return rects;
}

function roadRects(): SceneRect[] {
  return roadCells().map((cell) => rect(cell.x, cell.y, 1, 1, isRiver(cell.x, cell.y) ? "b" : "T"));
}

function boxHitsAny(
  box: { x: number; y: number; w: number; h: number },
  cells: readonly Cell[]
): boolean {
  return cells.some(
    (cell) =>
      cell.x >= box.x - 1 &&
      cell.x <= box.x + box.w &&
      cell.y >= box.y - 1 &&
      cell.y <= box.y + box.h
  );
}

function townSprites(): SceneSprite[] {
  return TOWNS.flatMap((town) => {
    let center = cellOf(town.at);
    return HOUSES_AT.map((offset) => ({
      sprite: HOUSE,
      x: center.x + offset.x,
      y: center.y + offset.y,
    }));
  });
}

function touchesRiver(placed: SceneSprite): boolean {
  for (let dy = 0; dy < placed.sprite.h; dy++) {
    for (let dx = -1; dx <= placed.sprite.w; dx++) {
      if (isRiver(placed.x + dx, placed.y + dy)) {
        return true;
      }
    }
  }
  return false;
}

function spotDecor(): SceneSprite[] {
  let hollow = spotCell("cedar-hollow");
  return FOREST_AT.map((offset) => ({
    sprite: TREE,
    x: hollow.x + offset.x,
    y: hollow.y + offset.y,
  })).filter((placed) => !touchesRiver(placed));
}

function scatteredSprites(taken: readonly Cell[]): SceneSprite[] {
  return SCATTER.map(({ at, sprite }) => ({ sprite, x: at.x, y: at.y })).filter(
    (placed) =>
      !touchesRiver(placed) &&
      !boxHitsAny({ x: placed.x, y: placed.y, w: placed.sprite.w, h: placed.sprite.h }, taken)
  );
}

export function countyMap(): SceneLayer[] {
  let roads = roadCells();
  let towns = townSprites();
  let townCells = towns.flatMap((placed) =>
    [...Array(placed.sprite.h).keys()].flatMap((dy) =>
      [...Array(placed.sprite.w).keys()].map((dx) => ({ x: placed.x + dx, y: placed.y + dy }))
    )
  );
  let spots = (Object.keys(SPOTS) as SpotId[]).map(spotCell);

  return [
    { rects: [...groundRects(), ...terrainPatches(), ...riverRects()], sprites: [] },
    {
      rects: roadRects(),
      sprites: [...spotDecor(), ...scatteredSprites([...roads, ...townCells, ...spots]), ...towns],
    },
  ];
}
