import {
  createHunt,
  hitRadius,
  huntReducer,
  HUNTER_POS,
  TUNING,
  type Animal,
  type HuntConfig,
  type Vec2,
} from "@bow-szn/core";

import { huntConfigFor } from "../src/features/hunt/hunt-config.ts";
import { pullForRange } from "../src/features/hunt/test-support/standing-doe.ts";
import { worldScale } from "../src/features/hunt/world-scale.ts";

export type Swipe = { start: Vec2; end: Vec2; durationMs: number };

export type StoreShot = { config: HuntConfig; target: Vec2; swipe: Swipe; slackMs: number };

export const SCREEN_PT = { width: 440, height: 956 };

export const PAN_SLOP_PT = 10;

export const SWIPE_MS = 500;

export const TITLE_NOTICED_LATE_MS = 1000;

export const SETTLE_BEFORE_PRESS_MS = 3500;

export const TOUCH_MS = TUNING.hud.spotTitleMs + TITLE_NOTICED_LATE_MS + SETTLE_BEFORE_PRESS_MS;

const SEED_LIMIT = 100_000;
export const WANTED_SLACK_MS = 2000;
const SAMPLE_MS = 50;
const HORIZON_MS = 14_000;
const SCAN_LIMIT_MS = 4000;
const AIM_MARGIN_PX = 2;
const ELBOW_ROOM_PX = 25;
const MIN_RANGE_PX = 30;
const MAX_RANGE_PX = 120;
const SETTLE_ITERATIONS = 3;

type Frames = Animal[][];

function isRackBuck(animal: Animal): boolean {
  return animal.species === "whitetail" && animal.antlers.kind === "rack";
}

function gap(from: Vec2, to: Vec2): number {
  return Math.hypot(from.x - to.x, from.y - to.y);
}

export function flightMs(target: Vec2): number {
  return TUNING.arrow.baseFlightMs + (gap(HUNTER_POS, target) / TUNING.arrow.speedPxPerSec) * 1000;
}

function framesOf(config: HuntConfig): Frames {
  let hunt = createHunt(config);
  let frames: Frames = [];
  for (let ms = 0; ms <= HORIZON_MS; ms += SAMPLE_MS) {
    frames.push(hunt.animals);
    hunt = huntReducer(hunt, { type: "tick", dtMs: SAMPLE_MS });
  }
  return frames;
}

function frameAt(ms: number): number {
  return Math.round(ms / SAMPLE_MS);
}

function whereIs(frames: Frames, id: number, ms: number): Vec2 | null {
  return frames[frameAt(ms)].find((animal) => animal.id === id)?.pos ?? null;
}

function landingTarget(frames: Frames, id: number): Vec2 | null {
  let target = whereIs(frames, id, TOUCH_MS + SWIPE_MS);
  for (let round = 0; round < SETTLE_ITERATIONS && target !== null; round++) {
    target = whereIs(frames, id, TOUCH_MS + SWIPE_MS + flightMs(target));
  }
  return target;
}

function isSteadyAt(frame: Animal[], id: number, target: Vec2, reachPx: number): boolean {
  let buck = frame.find((animal) => animal.id === id);
  return (
    buck !== undefined &&
    gap(buck.pos, target) <= reachPx &&
    frame.every((other) => other.id === id || gap(other.pos, target) >= ELBOW_ROOM_PX)
  );
}

function slackAround(
  frames: Frames,
  id: number,
  target: Vec2,
  reachPx: number,
  landMs: number
): number {
  let center = frameAt(landMs);
  let slackMs = 0;
  for (let offset = 1; offset * SAMPLE_MS <= SCAN_LIMIT_MS; offset++) {
    let before = frames[center - offset];
    let after = frames[center + offset];
    if (
      after === undefined ||
      !isSteadyAt(before, id, target, reachPx) ||
      !isSteadyAt(after, id, target, reachPx)
    ) {
      break;
    }
    slackMs = offset * SAMPLE_MS;
  }
  return slackMs;
}

export function swipeFor(target: Vec2): Swipe {
  let range = gap(HUNTER_POS, target);
  let dragPt = pullForRange(range) * worldScale(SCREEN_PT.width, SCREEN_PT.height) + PAN_SLOP_PT;
  let away = { x: (HUNTER_POS.x - target.x) / range, y: (HUNTER_POS.y - target.y) / range };
  let middle = { x: SCREEN_PT.width / 2, y: SCREEN_PT.height / 2 };
  function along(sign: -1 | 1): Vec2 {
    return {
      x: Math.round(middle.x + (sign * away.x * dragPt) / 2),
      y: Math.round(middle.y + (sign * away.y * dragPt) / 2),
    };
  }
  return { start: along(-1), end: along(1), durationMs: SWIPE_MS };
}

function shotsAt(config: HuntConfig): StoreShot[] {
  let hunt = createHunt(config);
  if (hunt.wind.strength !== 0) {
    return [];
  }
  let bucks = hunt.animals.filter(isRackBuck);
  if (bucks.length === 0) {
    return [];
  }
  let frames = framesOf(config);
  return bucks.flatMap((buck) => {
    let target = landingTarget(frames, buck.id);
    if (target === null || gap(HUNTER_POS, target) < MIN_RANGE_PX) {
      return [];
    }
    if (gap(HUNTER_POS, target) > MAX_RANGE_PX) {
      return [];
    }
    let landMs = TOUCH_MS + SWIPE_MS + flightMs(target);
    let reachPx = hitRadius(buck, config) - AIM_MARGIN_PX;
    let slackMs = slackAround(frames, buck.id, target, reachPx, landMs);
    return [{ config, target, swipe: swipeFor(target), slackMs }];
  });
}

export function planStoreShot(): StoreShot {
  for (let seed = 1; seed <= SEED_LIMIT; seed++) {
    let steady = shotsAt(huntConfigFor({ seed: String(seed) }, 0)).find(
      (shot) => shot.slackMs >= WANTED_SLACK_MS
    );
    if (steady !== undefined) {
      return steady;
    }
  }
  throw new Error("no seed leaves a lone buck standing where the arrow lands");
}
