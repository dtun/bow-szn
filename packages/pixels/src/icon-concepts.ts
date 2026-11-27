import { sprite } from "./compose.ts";
import { TRANSPARENT } from "./palette.ts";
import { ICON_CONCEPT_SPRITES } from "./sprites/icon-concepts.ts";
import type { Sprite } from "./types.ts";

export const CONCEPT_GRID = 64;

const GLOW_STEP: Readonly<Record<string, string>> = {
  N: "i",
  i: "v",
  v: "r",
  r: "q",
  q: "c",
  c: "O",
  O: "o",
  n: "Z",
  Z: "l",
  l: "P",
  P: "o",
};

type Grid = string[][];
type Band = { char: string; from: number };
type Sun = { cx: number; cy: number; r: number; glow: readonly number[] };
type Pine = { x: number; h: number };
type Ridge = { char: string; base: number; pines: readonly Pine[] };

export type IconConcept = { id: string; name: string; scene: () => Sprite };

function grid(size: number, fill: string): Grid {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => fill));
}

function toSprite(name: string, cells: Grid): Sprite {
  return sprite(
    name,
    cells.map((row) => row.join(""))
  );
}

function stamp(cells: Grid, art: Sprite, left: number, top: number): void {
  art.rows.forEach((row, y) => {
    [...row].forEach((char, x) => {
      let gy = top + y;
      let gx = left + x;
      if (char !== TRANSPARENT && cells[gy]?.[gx] !== undefined) {
        cells[gy][gx] = char;
      }
    });
  });
}

function bandAt(bands: readonly Band[], y: number): number {
  let index = 0;
  bands.forEach((band, at) => {
    if (y >= band.from) {
      index = at;
    }
  });
  return index;
}

function paintSky(cells: Grid, bands: readonly Band[]): void {
  cells.forEach((row, y) => {
    row.forEach((_, x) => {
      let index = bandAt(bands, y);
      let next = bands[index + 1];
      let char = bands[index].char;
      if (next) {
        let ahead = next.from - y;
        if (ahead === 1 && (x + y) % 2 === 0) {
          char = next.char;
        } else if (ahead === 2 && (x + y) % 4 === 0) {
          char = next.char;
        }
      }
      if (index > 0 && y === bands[index].from && (x + y + 1) % 4 === 0) {
        char = bands[index - 1].char;
      }
      cells[y][x] = char;
    });
  });
}

function shifted(char: string, steps: number): string {
  let out = char;
  for (let step = 0; step < steps; step++) {
    out = GLOW_STEP[out] ?? out;
  }
  return out;
}

function paintSun(cells: Grid, { cx, cy, r, glow }: Sun): void {
  cells.forEach((row, y) => {
    row.forEach((char, x) => {
      let d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
      if (d <= r) {
        cells[y][x] = d <= r - 3 ? "u" : "Y";
        return;
      }
      let ring = glow.findIndex((reach) => d <= r + reach);
      if (ring !== -1) {
        cells[y][x] = shifted(char, glow.length - ring);
      }
    });
  });
}

function pineHalfWidth(depth: number): number {
  let half = Math.floor(depth * 0.45);
  return depth % 3 === 0 && half >= 2 ? half - 1 : half;
}

function paintRidge(cells: Grid, { char, base, pines }: Ridge): void {
  for (let y = base; y < cells.length; y++) {
    cells[y].fill(char);
  }
  for (let { x, h } of pines) {
    for (let depth = 0; depth < h; depth++) {
      let y = base - h + depth;
      let half = pineHalfWidth(depth);
      for (let dx = -half; dx <= half; dx++) {
        if (cells[y]?.[x + dx] !== undefined) {
          cells[y][x + dx] = char;
        }
      }
    }
  }
}

function paintField(cells: Grid, from: number, char: string): void {
  for (let y = from; y < cells.length; y++) {
    cells[y].fill(char);
  }
}

function pineRow(from: number, to: number, spacing: number, heights: readonly number[]): Pine[] {
  let pines: Pine[] = [];
  for (let x = from, at = 0; x <= to; x += spacing, at++) {
    pines.push({ x, h: heights[at % heights.length] });
  }
  return pines;
}

function paintKnoll(cells: Grid, crest: number, char: string): void {
  cells.forEach((row, y) => {
    row.forEach((_, x) => {
      let drop = Math.floor(((x - 32) / 9) ** 2);
      if (y >= crest + drop) {
        cells[y][x] = char;
      }
    });
  });
}

function paintCanopy(cells: Grid, base: number, char: string, phase: number): void {
  cells.forEach((row, y) => {
    row.forEach((_, x) => {
      let crown = 2.2 + 1.6 * Math.sin(x / 2.3 + phase) + 1.1 * Math.sin(x / 5.1 + phase * 2);
      if (y >= base - Math.round(crown)) {
        cells[y][x] = char;
      }
    });
  });
}

function buckAtDawn(): Sprite {
  let cells = grid(CONCEPT_GRID, "N");
  paintSky(cells, [
    { char: "N", from: 0 },
    { char: "i", from: 7 },
    { char: "v", from: 14 },
    { char: "r", from: 20 },
    { char: "q", from: 26 },
    { char: "c", from: 32 },
    { char: "O", from: 38 },
    { char: "o", from: 44 },
  ]);
  paintSun(cells, { cx: 32, cy: 34, r: 20, glow: [2, 4] });
  paintCanopy(cells, 51, "v", 0.6);
  paintKnoll(cells, 53, "K");
  let buck = ICON_CONCEPT_SPRITES["icon-b-buck"];
  stamp(cells, buck, 32 - Math.round(buck.w / 2), 53 - buck.h);
  return toSprite("icon-concept-b", cells);
}

function oldRefined(): Sprite {
  let cells = grid(CONCEPT_GRID, "O");
  paintSky(cells, [
    { char: "q", from: 0 },
    { char: "c", from: 9 },
    { char: "O", from: 19 },
    { char: "o", from: 30 },
  ]);
  paintSun(cells, { cx: 47, cy: 42, r: 11, glow: [2, 4] });
  paintRidge(cells, { char: "N", base: 54, pines: pineRow(2, 30, 6, [7, 10, 6, 9, 11]) });
  paintField(cells, 54, "N");
  paintField(cells, 58, "K");
  let buck = ICON_CONCEPT_SPRITES["icon-a-buck"];
  stamp(cells, buck, 34, 55 - buck.h);
  let bow = ICON_CONCEPT_SPRITES["icon-a-bow"];
  stamp(cells, bow, 4, 30 - Math.round(bow.h / 2));
  return toSprite("icon-concept-a", cells);
}

function drawnBow(): Sprite {
  let cells = grid(CONCEPT_GRID, "n");
  paintSky(cells, [
    { char: "n", from: 0 },
    { char: "Z", from: 12 },
    { char: "l", from: 22 },
    { char: "P", from: 32 },
    { char: "O", from: 41 },
  ]);
  paintSun(cells, { cx: 33, cy: 33, r: 15, glow: [2, 4] });
  paintRidge(cells, { char: "N", base: 54, pines: pineRow(1, 66, 6, [6, 9, 5, 8, 10, 7]) });
  paintField(cells, 58, "K");
  let bow = ICON_CONCEPT_SPRITES["icon-c-bow"];
  stamp(cells, bow, 31 - Math.round(bow.w / 2), 34 - Math.round(bow.h / 2));
  return toSprite("icon-concept-c", cells);
}

function buckPortrait(): Sprite {
  let cells = grid(CONCEPT_GRID, "N");
  paintSky(cells, [
    { char: "N", from: 0 },
    { char: "i", from: 8 },
    { char: "v", from: 16 },
    { char: "r", from: 24 },
    { char: "q", from: 32 },
    { char: "c", from: 40 },
    { char: "O", from: 47 },
  ]);
  paintSun(cells, { cx: 32, cy: 30, r: 17, glow: [2, 4] });
  paintRidge(cells, { char: "N", base: 56, pines: pineRow(0, 66, 6, [7, 11, 8, 12, 9, 10]) });
  let face = ICON_CONCEPT_SPRITES["icon-d-face"];
  stamp(cells, face, 32 - Math.round(face.w / 2), CONCEPT_GRID - face.h);
  return toSprite("icon-concept-d", cells);
}

export const ICON_CONCEPTS: readonly IconConcept[] = [
  { id: "a", name: "A OLD REFINED", scene: oldRefined },
  { id: "b", name: "B BUCK AT DAWN", scene: buckAtDawn },
  { id: "c", name: "C DRAWN BOW", scene: drawnBow },
  { id: "d", name: "D BUCK PORTRAIT", scene: buckPortrait },
];
