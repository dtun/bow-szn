import {
  createRoller,
  HUNTER_POS,
  TUNING,
  WORLD_H,
  WORLD_W,
  type Roller,
  type Terrain,
} from "@bow-szn/core";
import { PALETTE, SPRITES, type SpriteId } from "@bow-szn/pixels";

import type { Bounds } from "./hunt-view";
import { spriteBlocks, type Block } from "./sprite-pictures";

export type Decor = { id: SpriteId; x: number; y: number };

export type FieldLayout = { ground: Block[]; decor: Decor[]; canopy: Decor[] };

export type Box = Bounds;

type Look = {
  ground: string;
  light: string;
  dark: string;
  trail: string;
  specks: readonly string[];
  treelineRows: number;
  edge: readonly SpriteId[];
  puddles: number;
};

const LOOKS: Record<Terrain, Look> = {
  hardwoods: {
    ground: PALETTE.G,
    light: PALETTE.g,
    dark: PALETTE.D,
    trail: PALETTE.T,
    specks: [PALETTE.Y, PALETTE.C],
    treelineRows: 2,
    edge: ["tree-canopy", "tree-canopy", "bush", "stump"],
    puddles: 0,
  },
  meadow: {
    ground: PALETTE.g,
    light: PALETTE.G,
    dark: PALETTE.D,
    trail: PALETTE.T,
    specks: [PALETTE.Y, PALETTE.C, PALETTE.V],
    treelineRows: 1,
    edge: ["bush", "grass-tuft-1", "grass-tuft-2", "tree-canopy"],
    puddles: 0,
  },
  marsh: {
    ground: PALETTE.D,
    light: PALETTE.G,
    dark: PALETTE.F,
    trail: PALETTE.t,
    specks: [PALETTE.a],
    treelineRows: 1,
    edge: ["cattails", "cattails", "bush", "grass-tuft-1"],
    puddles: 4,
  },
  ridge: {
    ground: PALETTE.G,
    light: PALETTE.a,
    dark: PALETTE.D,
    trail: PALETTE.a,
    specks: [PALETTE.H, PALETTE.h],
    treelineRows: 1,
    edge: ["rock-1", "rock-2", "tree-canopy", "stump"],
    puddles: 0,
  },
};

const MEADOW = TUNING.animals.meadow;
const SPECKLES_PER_PX = 360 / (WORLD_W * WORLD_H);
const SPECKS = 26;
const TRAIL_TOP = 196;
const TRAIL_PEBBLES = 40;
const TREE_STEP = 14;
const TREELINE_FLOOR = 44;
const TREELINE_ROW_DROP = 9;
const CANOPY_ROW_RISE = 11;
const EDGE_TOP = 78;
const EDGE_STEP: readonly [number, number] = [26, 40];
const LOW_DECOR_TOP = 272;
const LOW_DECOR_STEP = 32;
const STAND_FLOOR = WORLD_H - 2;
const LADDER_RUNG_STEP = 4;

export const OPEN_MIDDLE: Box = {
  left: MEADOW.minX,
  top: 60,
  right: MEADOW.maxX,
  bottom: MEADOW.maxY,
};

export const STAND: Box = {
  left: HUNTER_POS.x - 24,
  top: HUNTER_POS.y - 20,
  right: HUNTER_POS.x + 24,
  bottom: Infinity,
};

export function groundColor(terrain: Terrain): string {
  return LOOKS[terrain].ground;
}

export function decorBox(decor: Decor): Box {
  let sprite = SPRITES[decor.id];
  let left = decor.x - Math.floor(sprite.w / 2);
  return { left, top: decor.y - sprite.h, right: left + sprite.w, bottom: decor.y };
}

function pickEdge(look: Look, roller: Roller): SpriteId {
  return look.edge[roller.int(0, look.edge.length - 1)];
}

function speckles(look: Look, bounds: Bounds, roller: Roller): Block[] {
  let width = bounds.right - bounds.left;
  let height = bounds.bottom - bounds.top;
  let blocks: Block[] = [];
  for (let index = 0; index < Math.round(width * height * SPECKLES_PER_PX); index++) {
    let x = roller.int(bounds.left, bounds.right - 2);
    let y = roller.int(bounds.top + 1, bounds.bottom - 1);
    let color = roller.chance(0.55) ? look.light : look.dark;
    blocks.push({ x, y, width: 2, height: 1, color });
    blocks.push({ x: x + roller.int(0, 1), y: y - 1, width: 1, height: 1, color });
  }
  for (let index = 0; index < SPECKS; index++) {
    let color = look.specks[index % look.specks.length];
    blocks.push({
      x: roller.int(0, WORLD_W - 1),
      y: roller.int(60, 260),
      width: 1,
      height: 1,
      color,
    });
  }
  return blocks;
}

function trail(look: Look, bounds: Bounds, roller: Roller): Block[] {
  let phase = roller.between(0, Math.PI * 2);
  let blocks: Block[] = [];
  for (let y = TRAIL_TOP; y < bounds.bottom; y++) {
    let width = Math.min(24, Math.round(20 - (WORLD_H - y) * 0.11));
    let center = Math.round(HUNTER_POS.x + Math.sin(y * 0.045 + phase) * 7);
    blocks.push({ x: center - (width >> 1), y, width, height: 1, color: look.trail });
  }
  for (let index = 0; index < TRAIL_PEBBLES; index++) {
    let x = roller.int(HUNTER_POS.x - 12, HUNTER_POS.x + 12);
    let y = roller.int(TRAIL_TOP + 4, bounds.bottom - 1);
    blocks.push({ x, y, width: 1, height: 1, color: PALETTE.t });
  }
  return blocks;
}

function ladder(bounds: Bounds): Block[] {
  let height = bounds.bottom - STAND_FLOOR;
  if (height <= 0) {
    return [];
  }
  let left = HUNTER_POS.x - 12;
  let rails: Block[] = [
    { x: left + 3, y: STAND_FLOOR, width: 1, height, color: PALETTE.E },
    { x: left + 4, y: STAND_FLOOR, width: 1, height, color: PALETTE.b },
    { x: left + 9, y: STAND_FLOOR, width: 1, height, color: PALETTE.E },
    { x: left + 14, y: STAND_FLOOR, width: 1, height, color: PALETTE.E },
    { x: left + 19, y: STAND_FLOOR, width: 1, height, color: PALETTE.b },
    { x: left + 20, y: STAND_FLOOR, width: 1, height, color: PALETTE.E },
  ];
  let rungs: Block[] = [];
  for (let y = STAND_FLOOR + 2; y < bounds.bottom; y += LADDER_RUNG_STEP) {
    rungs.push({ x: left + 10, y, width: 4, height: 1, color: PALETTE.b });
  }
  return [...rails, ...rungs];
}

function puddle(center: { x: number; y: number }, roller: Roller): Block[] {
  let rx = roller.int(5, 9);
  let ry = roller.int(3, 5);
  let blocks: Block[] = [];
  for (let row = -ry; row <= ry; row++) {
    let half = Math.round(rx * Math.sqrt(1 - (row / ry) ** 2));
    let color = row === -ry + 1 ? PALETTE.l : PALETTE.Z;
    blocks.push({ x: center.x - half, y: center.y + row, width: half * 2 + 1, height: 1, color });
  }
  return blocks;
}

function puddles(look: Look, roller: Roller): Block[] {
  return Array.from({ length: look.puddles }, (_, index) => {
    let left = index % 2 === 0;
    let x = left
      ? roller.int(0, OPEN_MIDDLE.left - 10)
      : roller.int(OPEN_MIDDLE.right + 10, WORLD_W);
    return puddle({ x, y: roller.int(90, 240) }, roller);
  }).flat();
}

function canopyRow(bounds: Bounds, y: number, shift: number, roller: Roller): Decor[] {
  let trees: Decor[] = [];
  for (let x = bounds.left - 8 + shift; x < bounds.right + TREE_STEP; x += TREE_STEP) {
    trees.push({ id: "tree-canopy", x: x + roller.int(0, 3), y: y + roller.int(0, 4) });
  }
  return trees;
}

function canopy(look: Look, bounds: Bounds, roller: Roller): Decor[] {
  let trees: Decor[] = [];
  let row = 0;
  for (let y = TREELINE_FLOOR - CANOPY_ROW_RISE; y > bounds.top; y -= CANOPY_ROW_RISE) {
    row += 1;
    trees.push(...canopyRow(bounds, y, (row % 2) * 7, roller));
  }
  for (let treeline = 0; treeline < look.treelineRows; treeline++) {
    let y = TREELINE_FLOOR + treeline * TREELINE_ROW_DROP;
    trees.push(...canopyRow(bounds, y, treeline * 7, roller));
  }
  return trees.sort((a, b) => a.y - b.y);
}

function edgeX(id: SpriteId, side: "left" | "right", bounds: Bounds, roller: Roller): number {
  let half = Math.ceil(SPRITES[id].w / 2);
  return side === "left"
    ? roller.int(Math.max(bounds.left, half - 8), OPEN_MIDDLE.left - half)
    : roller.int(OPEN_MIDDLE.right + half, Math.min(bounds.right, WORLD_W + 8 - half));
}

function edges(look: Look, bounds: Bounds, roller: Roller): Decor[] {
  let decor: Decor[] = [];
  for (let side of ["left", "right"] as const) {
    let y = EDGE_TOP + roller.int(0, 12);
    while (y <= MEADOW.maxY + 14) {
      let id = pickEdge(look, roller);
      decor.push({ id, x: edgeX(id, side, bounds, roller), y });
      y += roller.int(EDGE_STEP[0], EDGE_STEP[1]);
    }
  }
  return decor;
}

function lowCorners(look: Look, bounds: Bounds, roller: Roller): Decor[] {
  let decor: Decor[] = [];
  for (let row = LOW_DECOR_TOP; row < bounds.bottom + 4; row += LOW_DECOR_STEP) {
    for (let side of ["left", "right"] as const) {
      let id = pickEdge(look, roller);
      let half = Math.ceil(SPRITES[id].w / 2);
      let x =
        side === "left"
          ? roller.int(Math.max(bounds.left, half - 6), STAND.left - half)
          : roller.int(STAND.right + half, Math.min(bounds.right, WORLD_W + 6 - half));
      decor.push({ id, x, y: row + roller.int(0, 8) });
    }
  }
  return decor;
}

export function fieldLayout(terrain: Terrain, seed: number, bounds: Bounds): FieldLayout {
  let look = LOOKS[terrain];
  let roller = createRoller(seed);
  let ground: Block[] = [
    {
      x: bounds.left,
      y: bounds.top,
      width: bounds.right - bounds.left,
      height: bounds.bottom - bounds.top,
      color: look.ground,
    },
    ...speckles(look, bounds, roller),
    ...puddles(look, roller),
    ...trail(look, bounds, roller),
    ...ladder(bounds),
  ];
  let decor = [...edges(look, bounds, roller), ...lowCorners(look, bounds, roller)];
  return {
    ground,
    decor: decor.sort((a, b) => a.y - b.y),
    canopy: canopy(look, bounds, roller),
  };
}

function decorBlocks(decor: Decor[]): Block[] {
  return decor.flatMap((each) => {
    let box = decorBox(each);
    return spriteBlocks(SPRITES[each.id], null, box.left, box.top);
  });
}

export function groundBlocks(layout: FieldLayout): Block[] {
  return [...layout.ground, ...decorBlocks(layout.decor)];
}

export function canopyBlocks(layout: FieldLayout): Block[] {
  return decorBlocks(layout.canopy);
}
