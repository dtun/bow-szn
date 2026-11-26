import type { PrepState } from "@bow-szn/core";
import { SPRITES, type Sprite } from "@bow-szn/pixels";

import { dawnBackdrop } from "@/art/dawn-backdrop";
import type { SceneLayer, SceneRect, SceneSprite } from "@/art/scene";
import { rect } from "@/art/scene-shapes";

import { stuckArrows, type Landing } from "./landings";

const BALE = SPRITES["bale-target"];
const ARROW = SPRITES["bale-arrow"];
const PIN = SPRITES["sight-pin"];

export const SIGHT_COLS = BALE.w;
export const BALE_ROWS = BALE.h;
export const SHADOW_ROWS = 2;
export const SIGHT_ROWS = BALE_ROWS + SHADOW_ROWS;
export const PATH_ROW = Math.floor(BALE_ROWS / 2);
export const FACE_RIM_CELLS = 3;

const EDGE_CELLS = 2;
const PATH_START = EDGE_CELLS + FACE_RIM_CELLS;
const PATH_LENGTH = SIGHT_COLS - 2 * PATH_START;
const RED_RING_CELLS = 2;
const INNER_GOLD_SHARE = 0.5;

const INNER_GOLD = "Y";
const OUTER_GOLD = "y";
const RED_RING = "R";
const FACE_OUTLINE = "E";
const SHADOW = "F";
const SHADOW_UNDER_BALE_ROWS = 2;
const BLADE = "G";
const BLADE_ONE_IN = 37;
const BLADE_ROWS = 2;

export type GoldFace = { centerX: number; radius: number };

export function swayPosition(markerPos: number): number {
  return PATH_START + markerPos * PATH_LENGTH;
}

export function goldFace(zone: PrepState["zone"]): GoldFace {
  let [start, end] = zone;
  return {
    centerX: swayPosition((start + end) / 2),
    radius: ((end - start) * PATH_LENGTH) / 2,
  };
}

function shadowRects(): SceneRect[] {
  return [
    rect(
      1,
      BALE_ROWS - SHADOW_UNDER_BALE_ROWS,
      SIGHT_COLS - 2,
      SHADOW_UNDER_BALE_ROWS + SHADOW_ROWS,
      SHADOW
    ),
  ];
}

function ringAt(distance: number, radius: number): string | null {
  if (distance <= radius * INNER_GOLD_SHARE) {
    return INNER_GOLD;
  }
  if (distance <= radius) {
    return OUTER_GOLD;
  }
  if (distance <= radius + RED_RING_CELLS) {
    return RED_RING;
  }
  if (distance <= radius + FACE_RIM_CELLS) {
    return FACE_OUTLINE;
  }
  return null;
}

function faceRects(face: GoldFace): SceneRect[] {
  let reach = Math.ceil(face.radius + FACE_RIM_CELLS);
  let left = Math.max(0, Math.floor(face.centerX) - reach);
  let right = Math.min(SIGHT_COLS - 1, Math.ceil(face.centerX) + reach);
  let rects: SceneRect[] = [];
  for (let y = Math.max(0, PATH_ROW - reach); y <= Math.min(BALE_ROWS - 1, PATH_ROW + reach); y++) {
    let runStart = left;
    let runChar: string | null = null;
    for (let x = left; x <= right + 1; x++) {
      let char =
        x > right ? null : ringAt(Math.hypot(x + 0.5 - face.centerX, y - PATH_ROW), face.radius);
      if (char !== runChar) {
        if (runChar !== null) {
          rects.push(rect(runStart, y, x - runStart, 1, runChar));
        }
        runStart = x;
        runChar = char;
      }
    }
  }
  return rects;
}

function spriteLeft(position: number, sprite: Sprite): number {
  return Math.floor(position) - Math.floor(sprite.w / 2);
}

function arrowAt(landing: Landing): SceneSprite {
  return {
    sprite: ARROW,
    x: spriteLeft(swayPosition(landing.pos), ARROW),
    y: PATH_ROW - ARROW.h + 1,
  };
}

export function baleScene(
  zone: PrepState["zone"] | null,
  landings: readonly Landing[]
): SceneLayer[] {
  let stuck = stuckArrows(landings);
  return [
    { rects: shadowRects(), sprites: [{ sprite: BALE, x: 0, y: 0 }] },
    { rects: zone === null ? [] : faceRects(goldFace(zone)), sprites: [] },
    { rects: [], sprites: stuck.map(arrowAt) },
  ];
}

export function pinScene(markerPos: number): SceneLayer[] {
  return [
    {
      rects: [],
      sprites: [
        {
          sprite: PIN,
          x: spriteLeft(swayPosition(markerPos), PIN),
          y: PATH_ROW - Math.floor(PIN.h / 2),
        },
      ],
    },
  ];
}

function hashed(x: number, y: number): number {
  return (Math.imul(x, 73856093) ^ Math.imul(y, 19349663)) >>> 0;
}

function bladeRects(cols: number, rows: number, fromRow: number): SceneRect[] {
  let rects: SceneRect[] = [];
  for (let y = fromRow; y < rows - BLADE_ROWS; y++) {
    for (let x = 0; x < cols; x++) {
      if (hashed(x, y) % BLADE_ONE_IN === 0) {
        rects.push(rect(x, y, 1, BLADE_ROWS, BLADE));
      }
    }
  }
  return rects;
}

export function sightBackdrop(
  cols: number,
  rows: number,
  horizonRow: number,
  groundRow: number
): SceneLayer[] {
  return [
    dawnBackdrop(cols, rows, horizonRow),
    { rects: bladeRects(cols, rows, groundRow), sprites: [] },
  ];
}
