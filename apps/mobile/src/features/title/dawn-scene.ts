import { SPRITES, type Sprite } from "@bow-szn/pixels";

import { dawnBackdrop } from "@/art/dawn-backdrop";
import type { SceneLayer } from "@/art/scene";
import { rect } from "@/art/scene-shapes";

import { ambientLayer } from "./ambient-layer";
import type { TitleAmbience } from "./title-ambience";

export type DawnOptions = { skyTopRow?: number; horizonRow?: number };

export type DawnScene = {
  layers: SceneLayer[];
  horizonRow: number;
  ambient(ambience: TitleAmbience): SceneLayer;
};

const HORIZON_AT = 0.6;
const TUFT_SPOTS: readonly { across: number; below: number }[] = [
  { across: 0.08, below: 22 },
  { across: 0.42, below: 18 },
  { across: 0.78, below: 30 },
  { across: 0.9, below: 14 },
];

const HUNTER: Sprite = {
  name: "title-hunter",
  w: 10,
  h: 10,
  rows: [
    "...OOOO...",
    "..OOOOOO..",
    "...PPPP...",
    "...PPPP...",
    "b.OOOOOO..",
    "bbOOOOOOO.",
    "b.OOOOOO..",
    "b..KKKK...",
    "b..K..K...",
    "...K..K...",
  ],
};

function standLayer(cols: number, horizon: number): SceneLayer {
  let canopy = SPRITES["tree-canopy"];
  let trunkX = Math.round(cols * 0.17);
  let platformY = horizon + 6;
  let hunterY = platformY - HUNTER.h;
  let canopyY = hunterY - canopy.h - 1;
  return {
    rects: [
      rect(trunkX - 1, canopyY + canopy.h - 4, 3, platformY + 12 - (canopyY + canopy.h - 4), "U"),
      rect(trunkX - 3, platformY + 12, 7, 1, "U"),
      rect(trunkX - 7, platformY, 15, 2, "b"),
      rect(trunkX - 7, platformY + 2, 15, 1, "t"),
    ],
    sprites: [
      { sprite: canopy, x: trunkX - Math.floor(canopy.w / 2), y: canopyY },
      { sprite: HUNTER, x: trunkX - 4, y: hunterY },
    ],
  };
}

export function dawnScene(
  cols: number,
  rows: number,
  { skyTopRow = 0, horizonRow = Math.round(rows * HORIZON_AT) }: DawnOptions = {}
): DawnScene {
  let tufts = TUFT_SPOTS.map(({ across, below }) => ({
    sprite: SPRITES["grass-tuft-1"],
    x: Math.round(cols * across),
    y: horizonRow + below,
  }));

  let backdrop = dawnBackdrop(cols, rows, horizonRow);
  backdrop.sprites.push(...tufts);

  return {
    horizonRow,
    layers: [backdrop, standLayer(cols, horizonRow)],
    ambient(ambience) {
      return ambientLayer(ambience, { horizonRow, skyTopRow });
    },
  };
}
