import { SPOTS, type SpotId, type Vec2 } from "@bow-szn/core";
import { PALETTE, SPRITES, type Sprite } from "@bow-szn/pixels";

import type { SceneLayer, SceneRect, SceneSprite } from "@/art/scene";

export const COUNTY_COLS = 80;
export const COUNTY_ROWS = 96;

const MIN_CELL = 3;

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

export const TOWN_LABEL_CELLS_PER_CHAR = 3;
export const TOWN_LABEL_TOP_CELLS = 2;
const TOWN_LABEL_HEIGHT_CELLS = 4;

type Cell = { x: number; y: number };

const PAPER = "A";
const PAPER_GRAIN = "L";
const CONTOUR = "a";
const CREEK = "n";
const CREEK_SHADE = "Z";
const ROAD = "t";

const PAPER_GRAIN_ONE_IN = 37;
const ROAD_DOT_SPACING = 3;

const CREEK_COURSE: readonly Vec2[] = [
  { x: 0.46, y: 0 },
  { x: 0.5, y: 0.14 },
  { x: 0.44, y: 0.28 },
  { x: 0.52, y: 0.42 },
  { x: 0.54, y: 0.54 },
  { x: 0.5, y: 0.62 },
  { x: 0.44, y: 0.7 },
  { x: 0.4, y: 0.78 },
  { x: 0.36, y: 0.88 },
  { x: 0.42, y: 0.96 },
  { x: 0.46, y: 1 },
];

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

const HILLS: readonly { at: Vec2; reach: Vec2 }[] = [
  { at: SPOTS["high-ridge"].mapPos, reach: { x: 0.2, y: 0.17 } },
  { at: { x: 0.06, y: 0.36 }, reach: { x: 0.14, y: 0.1 } },
];
const CONTOUR_LEVELS = 6;

const CLUMP = SPRITES["pencil-clump"];
const TREE = SPRITES["pencil-tree"];
const PEAK = SPRITES["pencil-peak"];
const REEDS = SPRITES["pencil-reeds"];
const HOUSE = SPRITES["pencil-house"];

const FOREST_AROUND_CEDAR_HOLLOW: readonly Cell[] = [
  { x: -17, y: -4 },
  { x: 6, y: -9 },
  { x: -15, y: 8 },
  { x: 9, y: 6 },
];

const PEAKS_AROUND_HIGH_RIDGE: readonly Cell[] = [
  { x: -17, y: 6 },
  { x: -6, y: -8 },
  { x: 4, y: 9 },
];

const REEDS_AROUND_CATTAIL_MARSH: readonly Cell[] = [
  { x: -14, y: -5 },
  { x: 6, y: 2 },
  { x: 3, y: 10 },
];

const SCATTERED_TREES: readonly { at: Cell; sprite: Sprite }[] = [
  { at: { x: 2, y: 54 }, sprite: CLUMP },
  { at: { x: 66, y: 60 }, sprite: CLUMP },
  { at: { x: 62, y: 80 }, sprite: TREE },
  { at: { x: 38, y: 6 }, sprite: TREE },
  { at: { x: 70, y: 34 }, sprite: TREE },
  { at: { x: 4, y: 68 }, sprite: TREE },
  { at: { x: 40, y: 88 }, sprite: TREE },
];

function rect(x: number, y: number, width: number, height: number, char: string): SceneRect {
  return { x, y, width, height, color: PALETTE[char] };
}

function hashed(x: number, y: number): number {
  return (Math.imul(x, 73856093) ^ Math.imul(y, 19349663)) >>> 0;
}

function cellOf(at: Vec2): Cell {
  return {
    x: Math.round(at.x * COUNTY_COLS),
    y: Math.round(at.y * COUNTY_ROWS),
  };
}

export function spotCell(spot: SpotId): Cell {
  return cellOf(SPOTS[spot].mapPos);
}

function creekCenter(row: number): number {
  let along = (row + 0.5) / COUNTY_ROWS;
  let upper = CREEK_COURSE.findIndex((point) => point.y >= along);
  let end = CREEK_COURSE[Math.max(upper, 1)];
  let start = CREEK_COURSE[Math.max(upper, 1) - 1];
  let share = (along - start.y) / (end.y - start.y);
  return Math.round((start.x + (end.x - start.x) * share) * COUNTY_COLS);
}

function isCreek(x: number, y: number): boolean {
  return Math.abs(x - creekCenter(y)) <= 1;
}

function elevation(x: number, y: number): number {
  return HILLS.reduce((highest, hill) => {
    let dx = (x / COUNTY_COLS - hill.at.x) / hill.reach.x;
    let dy = (y / COUNTY_ROWS - hill.at.y) / hill.reach.y;
    return Math.max(highest, Math.exp(-(dx * dx + dy * dy)));
  }, 0);
}

function contourLevel(x: number, y: number): number {
  return Math.floor(elevation(x, y) * CONTOUR_LEVELS);
}

function paperRects(): SceneRect[] {
  let rects = [rect(0, 0, COUNTY_COLS, COUNTY_ROWS, PAPER)];
  for (let y = 0; y < COUNTY_ROWS; y++) {
    for (let x = 0; x < COUNTY_COLS; x++) {
      if (hashed(x, y) % PAPER_GRAIN_ONE_IN === 0) {
        rects.push(rect(x, y, 2, 1, PAPER_GRAIN));
      }
    }
  }
  rects.push(rect(0, 0, COUNTY_COLS, 1, CONTOUR));
  rects.push(rect(0, COUNTY_ROWS - 1, COUNTY_COLS, 1, CONTOUR));
  rects.push(rect(0, 0, 1, COUNTY_ROWS, CONTOUR));
  rects.push(rect(COUNTY_COLS - 1, 0, 1, COUNTY_ROWS, CONTOUR));
  return rects;
}

function contourRects(): SceneRect[] {
  let rects: SceneRect[] = [];
  for (let y = 1; y < COUNTY_ROWS - 1; y++) {
    let runStart = -1;
    for (let x = 1; x <= COUNTY_COLS - 1; x++) {
      let onLine =
        x < COUNTY_COLS - 1 &&
        (contourLevel(x, y) !== contourLevel(x + 1, y) ||
          contourLevel(x, y) !== contourLevel(x, y + 1));
      if (onLine && runStart < 0) {
        runStart = x;
      }
      if (!onLine && runStart >= 0) {
        rects.push(rect(runStart, y, x - runStart, 1, CONTOUR));
        runStart = -1;
      }
    }
  }
  return rects;
}

function creekRects(): SceneRect[] {
  let rects: SceneRect[] = [];
  for (let y = 0; y < COUNTY_ROWS; y++) {
    let center = creekCenter(y);
    let previous = y === 0 ? center : creekCenter(y - 1);
    let from = Math.min(center, previous);
    let to = Math.max(center, previous);
    rects.push(rect(from, y, to - from + 1, 1, CREEK));
    if (hashed(y, 7) % 3 === 0) {
      rects.push(rect(to + 1, y, 1, 1, CREEK_SHADE));
    }
  }
  return rects;
}

function roadCells(): Cell[] {
  let seen = new Set<string>();
  let cells: Cell[] = [];
  for (let road of ROADS) {
    for (let index = 1; index < road.length; index++) {
      let from = cellOf(road[index - 1]);
      let to = cellOf(road[index]);
      let steps = Math.max(Math.abs(to.x - from.x), Math.abs(to.y - from.y));
      for (let step = 0; step <= steps; step += ROAD_DOT_SPACING) {
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

function roadRects(): SceneRect[] {
  return roadCells()
    .filter((cell) => !isCreek(cell.x, cell.y))
    .map((cell) => rect(cell.x, cell.y, 1, 1, ROAD));
}

function townSprites(): SceneSprite[] {
  return TOWNS.map((town) => {
    let center = cellOf(town.at);
    return {
      sprite: HOUSE,
      x: center.x - Math.floor(HOUSE.w / 2),
      y: center.y - HOUSE.h + 1,
    };
  });
}

type Box = { x: number; y: number; w: number; h: number };

function boxesOverlap(a: Box, b: Box): boolean {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

function pinBox(spot: SpotId): Box {
  let cell = spotCell(spot);
  let pin = SPRITES.pushpin;
  return { x: cell.x - 5, y: cell.y - pin.h - 1, w: 10, h: pin.h + 5 };
}

function labelBox(town: Town): Box {
  let center = cellOf(town.at);
  let w = town.name.length * TOWN_LABEL_CELLS_PER_CHAR + 2;
  return {
    x: center.x - Math.floor(w / 2),
    y: center.y + TOWN_LABEL_TOP_CELLS - 1,
    w,
    h: TOWN_LABEL_HEIGHT_CELLS + 2,
  };
}

function reservedBoxes(): Box[] {
  let spots = (Object.keys(SPOTS) as SpotId[]).map(pinBox);
  let labels = TOWNS.map(labelBox);
  let houses = townSprites().map((placed) => ({
    x: placed.x,
    y: placed.y,
    w: placed.sprite.w,
    h: placed.sprite.h,
  }));
  let roads = roadCells().map((cell) => ({
    x: cell.x - 1,
    y: cell.y - 1,
    w: 3,
    h: 3,
  }));
  return [...spots, ...labels, ...houses, ...roads];
}

function placedAround(center: Cell, offsets: readonly Cell[], sprite: Sprite): SceneSprite[] {
  return offsets.map((offset) => ({
    sprite,
    x: center.x + offset.x,
    y: center.y + offset.y,
  }));
}

function sketchSprites(): SceneSprite[] {
  let candidates = [
    ...placedAround(spotCell("cedar-hollow"), FOREST_AROUND_CEDAR_HOLLOW, CLUMP),
    ...placedAround(spotCell("high-ridge"), PEAKS_AROUND_HIGH_RIDGE, PEAK),
    ...placedAround(spotCell("cattail-marsh"), REEDS_AROUND_CATTAIL_MARSH, REEDS),
    ...SCATTERED_TREES.map(({ at, sprite }) => ({ sprite, x: at.x, y: at.y })),
  ];
  let taken = reservedBoxes();
  return candidates.filter((placed) => {
    let box = {
      x: placed.x,
      y: placed.y,
      w: placed.sprite.w,
      h: placed.sprite.h,
    };
    let touchesCreek = [...Array(box.h).keys()].some((dy) =>
      [...Array(box.w + 2).keys()].some((dx) => isCreek(box.x + dx - 1, box.y + dy))
    );
    let insidePaper =
      box.x >= 1 &&
      box.y >= 1 &&
      box.x + box.w <= COUNTY_COLS - 1 &&
      box.y + box.h <= COUNTY_ROWS - 1;
    let dryEnough = !touchesCreek || placed.sprite === REEDS;
    return insidePaper && dryEnough && !taken.some((other) => boxesOverlap(box, other));
  });
}

export function countyMap(): SceneLayer[] {
  return [
    {
      rects: [...paperRects(), ...contourRects(), ...creekRects()],
      sprites: [],
    },
    { rects: roadRects(), sprites: [...sketchSprites(), ...townSprites()] },
  ];
}
