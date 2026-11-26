import { PALETTE, SPRITES, type Sprite } from "@bow-szn/pixels";

import type { SceneLayer, SceneRect, SceneSprite } from "@/art/scene";

import { CLOUD } from "./dawn-cloud";
import { titleAmbience } from "./title-ambience";

export type DawnScene = { layers: SceneLayer[]; horizonRow: number };

const HORIZON_AT = 0.6;
const SKY_BANDS: readonly { until: number; char: string }[] = [
  { until: 0.22, char: "n" },
  { until: 0.42, char: "Z" },
  { until: 0.62, char: "l" },
  { until: 0.8, char: "P" },
  { until: 1, char: "O" },
];
const FIELD_BANDS: readonly { rows: number; char: string }[] = [
  { rows: 5, char: "g" },
  { rows: 9, char: "G" },
  { rows: Infinity, char: "D" },
];
const TREELINE_OVERLAP = 1;
const DOE_FEET_BELOW_HORIZON = 14;
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

function rect(x: number, y: number, width: number, height: number, char: string): SceneRect {
  return { x, y, width, height, color: PALETTE[char] };
}

function skyRects(cols: number, horizon: number): SceneRect[] {
  let rects: SceneRect[] = [];
  let top = 0;
  SKY_BANDS.forEach((band, index) => {
    let bottom = index === SKY_BANDS.length - 1 ? horizon : Math.round(horizon * band.until);
    rects.push(rect(0, top, cols, bottom - top, band.char));
    let next = SKY_BANDS[index + 1];
    if (next && bottom > top) {
      for (let x = 0; x < cols; x += 2) {
        rects.push(rect(x, bottom - 1, 1, 1, next.char));
      }
    }
    top = bottom;
  });
  return rects;
}

function sunRects(cols: number, horizon: number): SceneRect[] {
  let centerX = Math.round(cols * 0.68);
  let centerY = horizon - 4;
  let radius = Math.max(5, Math.round(cols * 0.15));
  let rects: SceneRect[] = [];
  for (let offset = -radius; offset <= radius; offset++) {
    let row = centerY + offset;
    if (row < horizon) {
      let half = Math.floor(Math.sqrt(radius * radius - offset * offset));
      rects.push(rect(centerX - half, row, half * 2 + 1, 1, "Y"));
    }
  }
  return rects;
}

function hillRects(cols: number, horizon: number): SceneRect[] {
  let rects: SceneRect[] = [];
  let runStart = 0;
  function rise(x: number): number {
    return Math.round(4 + 2 * Math.sin(x / 6) + 1.5 * Math.sin(x / 2.3));
  }
  for (let x = 1; x <= cols; x++) {
    if (x === cols || rise(x) !== rise(runStart)) {
      let height = rise(runStart);
      rects.push(rect(runStart, horizon - height, x - runStart, height + 1, "h"));
      runStart = x;
    }
  }
  return rects;
}

function fieldRects(cols: number, rows: number, horizon: number): SceneRect[] {
  let rects: SceneRect[] = [];
  let top = horizon;
  FIELD_BANDS.forEach((band, index) => {
    let bottom = Math.min(rows, top + band.rows);
    if (bottom > top) {
      rects.push(rect(0, top, cols, bottom - top, band.char));
      let next = FIELD_BANDS[index + 1];
      if (next && bottom < rows) {
        for (let x = 0; x < cols; x += 2) {
          rects.push(rect(x, bottom - 1, 1, 1, next.char));
        }
      }
    }
    top = bottom;
  });
  return rects;
}

function treelineSprites(cols: number, horizon: number): SceneSprite[] {
  let treeline = SPRITES["brand-treeline"];
  let sprites: SceneSprite[] = [];
  for (let x = 0; x < cols; x += treeline.w) {
    sprites.push({ sprite: treeline, x, y: horizon - treeline.h + TREELINE_OVERLAP });
  }
  return sprites;
}

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

function ambientLayer(cols: number, horizon: number): SceneLayer {
  let { clouds, doe } = titleAmbience(0, 0, cols);
  let doeSprite = SPRITES[doe.frame];
  return {
    rects: [],
    sprites: [
      ...clouds.map(({ x, down }) => ({ sprite: CLOUD, x, y: Math.round(horizon * down) - 1 })),
      { sprite: doeSprite, x: doe.x, y: horizon + DOE_FEET_BELOW_HORIZON - doeSprite.h },
    ],
  };
}

export function dawnScene(cols: number, rows: number): DawnScene {
  let horizonRow = Math.round(rows * HORIZON_AT);
  let tufts = TUFT_SPOTS.map(({ across, below }) => ({
    sprite: SPRITES["grass-tuft-1"],
    x: Math.round(cols * across),
    y: horizonRow + below,
  }));

  let backdrop: SceneLayer = {
    rects: [
      ...skyRects(cols, horizonRow),
      ...sunRects(cols, horizonRow),
      ...hillRects(cols, horizonRow),
      ...fieldRects(cols, rows, horizonRow),
    ],
    sprites: [...treelineSprites(cols, horizonRow), ...tufts],
  };

  return {
    horizonRow,
    layers: [backdrop, standLayer(cols, horizonRow), ambientLayer(cols, horizonRow)],
  };
}
