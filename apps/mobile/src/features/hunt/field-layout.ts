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

import { spriteBlocks, type Block } from "./sprite-pictures";

export type Decor = { id: SpriteId; x: number; y: number };

export type FieldLayout = { ground: Block[]; decor: Decor[] };

export type Box = { left: number; top: number; right: number; bottom: number };

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
const HUD_BOTTOM = 26;
const TRAIL_TOP = 196;
const SPECKLES = 360;
const SPECKS = 26;
const TRAIL_PEBBLES = 40;
const TREE_STEP = 14;
const TREELINE_FLOOR = 44;
const TREELINE_ROW_DROP = 9;
const EDGE_TOP = 78;
const EDGE_STEP: readonly [number, number] = [26, 40];
const BOTTOM_DECOR_ROWS = [272, 304];

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
  bottom: WORLD_H,
};

export function decorBox(decor: Decor): Box {
  let sprite = SPRITES[decor.id];
  let left = decor.x - Math.floor(sprite.w / 2);
  return { left, top: decor.y - sprite.h, right: left + sprite.w, bottom: decor.y };
}

function speckles(look: Look, roller: Roller): Block[] {
  let blocks: Block[] = [];
  for (let index = 0; index < SPECKLES; index++) {
    let x = roller.int(0, WORLD_W - 2);
    let y = roller.int(HUD_BOTTOM, WORLD_H - 1);
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

function trail(look: Look, roller: Roller): Block[] {
  let phase = roller.between(0, Math.PI * 2);
  let blocks: Block[] = [];
  for (let y = TRAIL_TOP; y < WORLD_H; y++) {
    let width = Math.round(20 - (WORLD_H - y) * 0.11);
    let center = Math.round(HUNTER_POS.x + Math.sin(y * 0.045 + phase) * 7);
    blocks.push({ x: center - (width >> 1), y, width, height: 1, color: look.trail });
  }
  for (let index = 0; index < TRAIL_PEBBLES; index++) {
    let x = roller.int(HUNTER_POS.x - 12, HUNTER_POS.x + 12);
    blocks.push({
      x,
      y: roller.int(TRAIL_TOP + 4, WORLD_H - 1),
      width: 1,
      height: 1,
      color: PALETTE.t,
    });
  }
  return blocks;
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

function treeline(look: Look, roller: Roller): Decor[] {
  let trees: Decor[] = [];
  for (let row = 0; row < look.treelineRows; row++) {
    for (let x = -8 + row * 7; x < WORLD_W + TREE_STEP; x += TREE_STEP) {
      let y = TREELINE_FLOOR + row * TREELINE_ROW_DROP + roller.int(0, 4);
      trees.push({ id: "tree-canopy", x: x + roller.int(0, 3), y });
    }
  }
  return trees;
}

function edgeX(id: SpriteId, side: "left" | "right", roller: Roller): number {
  let half = Math.ceil(SPRITES[id].w / 2);
  return side === "left"
    ? roller.int(half - 8, OPEN_MIDDLE.left - half)
    : roller.int(OPEN_MIDDLE.right + half, WORLD_W + 8 - half);
}

function edges(look: Look, roller: Roller): Decor[] {
  let decor: Decor[] = [];
  for (let side of ["left", "right"] as const) {
    let y = EDGE_TOP + roller.int(0, 12);
    while (y <= MEADOW.maxY + 14) {
      let id = look.edge[roller.int(0, look.edge.length - 1)];
      decor.push({ id, x: edgeX(id, side, roller), y });
      y += roller.int(EDGE_STEP[0], EDGE_STEP[1]);
    }
  }
  return decor;
}

function bottomCorners(look: Look, roller: Roller): Decor[] {
  return BOTTOM_DECOR_ROWS.flatMap((row) =>
    (["left", "right"] as const).map((side) => {
      let id = look.edge[roller.int(0, look.edge.length - 1)];
      let half = Math.ceil(SPRITES[id].w / 2);
      let x =
        side === "left"
          ? roller.int(half - 6, STAND.left - half)
          : roller.int(STAND.right + half, WORLD_W + 6 - half);
      return { id, x, y: row + roller.int(0, 8) };
    })
  );
}

export function fieldLayout(terrain: Terrain, seed: number): FieldLayout {
  let look = LOOKS[terrain];
  let roller = createRoller(seed);
  let ground: Block[] = [
    { x: 0, y: 0, width: WORLD_W, height: WORLD_H, color: look.ground },
    ...speckles(look, roller),
    ...puddles(look, roller),
    ...trail(look, roller),
  ];
  let decor = [...treeline(look, roller), ...edges(look, roller), ...bottomCorners(look, roller)];
  return { ground, decor: decor.sort((a, b) => a.y - b.y) };
}

export function fieldBlocks(layout: FieldLayout): Block[] {
  return [
    ...layout.ground,
    ...layout.decor.flatMap((decor) => {
      let box = decorBox(decor);
      return spriteBlocks(SPRITES[decor.id], null, box.left, box.top);
    }),
  ];
}
