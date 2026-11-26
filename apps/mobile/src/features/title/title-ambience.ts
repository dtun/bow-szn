import { createRoller, type Roller } from "@bow-szn/core";
import { ANIMAL_FRAMES, SPRITES, type SpriteId } from "@bow-szn/pixels";

import { CLOUD } from "./dawn-cloud";

export type Facing = 1 | -1;
export type CloudPlacement = { x: number; down: number };
export type DoePlacement = { frame: SpriteId; x: number; facing: Facing };
export type RabbitPlacement = { frame: SpriteId; x: number; lift: number; facing: Facing };
export type TitleAmbience = {
  clouds: CloudPlacement[];
  doe: DoePlacement;
  rabbit: RabbitPlacement | null;
};

export const DOE_HOME_ACROSS = 0.6;

const CLOUD_LANES: readonly { across: number; down: number; cellsPerSecond: number }[] = [
  { across: 0.06, down: 0.1, cellsPerSecond: 0.9 },
  { across: 0.52, down: 0.62, cellsPerSecond: 0.6 },
];

const DOE_FRAMES = ANIMAL_FRAMES.doe;
const DOE_WIDTH = SPRITES[DOE_FRAMES.graze].w;
const DOE_CYCLE_MS = 14000;
const DOE_LOOK_AT_MS = { min: 2000, max: 5000 };
const DOE_LOOK_MS = 700;
const DOE_WALK_AT_MS = { min: 8500, max: 11000 };
const DOE_STEPS = { min: 3, max: 5 };
const DOE_STEP_MS = 300;
const DOE_STEP_CELLS = 2;

const RABBIT_FRAMES = ANIMAL_FRAMES.rabbit;
const RABBIT_WIDTH = SPRITES[RABBIT_FRAMES.graze].w;
const RABBIT_SLOT_MS = 11500;
const RABBIT_START_IN_SLOT_MS = { min: 8000, max: 11500 };
const RABBIT_CROSSING_MS = 4500;
const RABBIT_HOP_MS = 500;
const RABBIT_HOP_LIFT = 3;

const DOE_CYCLE_SALT = 0x51ed270b;
const DOE_PAIR_SALT = 0x2c1b3c6d;
const RABBIT_SALT = 0x297a2d39;

function rollerFor(seed: number, salt: number, index: number): Roller {
  return createRoller(Math.imul(seed | 0, 0x2545f491) ^ Math.imul(index + 1, 0x9e3779b1) ^ salt);
}

function cloudsAt(tMs: number, cols: number): CloudPlacement[] {
  let span = cols + CLOUD.w;
  return CLOUD_LANES.map(({ across, down, cellsPerSecond }) => {
    let start = Math.round(cols * across);
    let drift = Math.floor((cellsPerSecond * tMs) / 1000);
    return { x: ((start + CLOUD.w + drift) % span) - CLOUD.w, down };
  });
}

function doeAt(tMs: number, seed: number, cols: number): DoePlacement {
  let cycle = Math.floor(tMs / DOE_CYCLE_MS);
  let sinceCycleMs = tMs - cycle * DOE_CYCLE_MS;
  let pair = Math.floor(cycle / 2);
  let outbound = cycle % 2 === 0;
  let outward: Facing = pair % 2 === 0 ? 1 : -1;
  let steps = rollerFor(seed, DOE_PAIR_SALT, pair).int(DOE_STEPS.min, DOE_STEPS.max);
  let plan = rollerFor(seed, DOE_CYCLE_SALT, cycle);
  let lookAtMs = plan.int(DOE_LOOK_AT_MS.min, DOE_LOOK_AT_MS.max);
  let walkAtMs = plan.int(DOE_WALK_AT_MS.min, DOE_WALK_AT_MS.max);

  let stepIndex = Math.floor((sinceCycleMs - walkAtMs) / DOE_STEP_MS);
  let stepsTaken = Math.max(0, Math.min(steps, stepIndex + 1));
  let stepsFromHome = outbound ? stepsTaken : steps - stepsTaken;
  let walking = stepIndex >= 0 && stepIndex < steps;
  let lookingUp = sinceCycleMs >= lookAtMs && sinceCycleMs < lookAtMs + DOE_LOOK_MS;

  let frame = DOE_FRAMES.graze;
  if (walking) {
    frame = DOE_FRAMES.walk[stepIndex % 2];
  } else if (lookingUp) {
    frame = DOE_FRAMES.walk[0];
  }

  let home = Math.round(cols * DOE_HOME_ACROSS);
  let x = home + outward * stepsFromHome * DOE_STEP_CELLS;
  let inward: Facing = outward === 1 ? -1 : 1;
  return {
    frame,
    x: Math.max(0, Math.min(cols - DOE_WIDTH, x)),
    facing: outbound ? outward : inward,
  };
}

function hopPose(sinceStartMs: number): { frame: SpriteId; lift: number } {
  let phase = (sinceStartMs % RABBIT_HOP_MS) / RABBIT_HOP_MS;
  if (phase < 0.25) {
    return { frame: RABBIT_FRAMES.walk[0], lift: 0 };
  }
  if (phase < 0.75) {
    let rise = (phase - 0.25) / 0.5;
    return { frame: RABBIT_FRAMES.flee, lift: Math.round(RABBIT_HOP_LIFT * 4 * rise * (1 - rise)) };
  }
  return { frame: RABBIT_FRAMES.walk[1], lift: 0 };
}

function rabbitRun(seed: number, slot: number): { startMs: number; facing: Facing } {
  let roll = rollerFor(seed, RABBIT_SALT, slot);
  let startMs =
    slot * RABBIT_SLOT_MS + roll.int(RABBIT_START_IN_SLOT_MS.min, RABBIT_START_IN_SLOT_MS.max);
  return { startMs, facing: roll.chance(0.5) ? 1 : -1 };
}

function rabbitAt(tMs: number, seed: number, cols: number): RabbitPlacement | null {
  let slot = Math.floor(tMs / RABBIT_SLOT_MS);
  for (let candidate of [slot, slot - 1]) {
    if (candidate < 0) {
      continue;
    }
    let { startMs, facing } = rabbitRun(seed, candidate);
    let sinceStartMs = tMs - startMs;
    if (sinceStartMs >= 0 && sinceStartMs < RABBIT_CROSSING_MS) {
      let progress = sinceStartMs / RABBIT_CROSSING_MS;
      let span = cols + RABBIT_WIDTH;
      let x = facing === 1 ? -RABBIT_WIDTH + progress * span : cols - progress * span;
      return { ...hopPose(sinceStartMs), x: Math.round(x), facing };
    }
  }
  return null;
}

export function titleAmbience(tMs: number, seed: number, cols: number): TitleAmbience {
  return {
    clouds: cloudsAt(tMs, cols),
    doe: doeAt(tMs, seed, cols),
    rabbit: rabbitAt(tMs, seed, cols),
  };
}
