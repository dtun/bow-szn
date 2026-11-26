import type { Roller } from "./rng";
import { SPECIES } from "./species";
import { TUNING } from "./tuning";
import { WORLD_H, WORLD_W, type Animal, type HuntConfig, type Vec2 } from "./types";
import { add, magnitude, scale, sub } from "./vec";

export function isLive(animal: Animal): boolean {
  return animal.mode.kind !== "down" && animal.mode.kind !== "gone";
}

export function hitRadius(animal: Animal): number {
  return SPECIES[animal.species].hitRadius;
}

function walkSpeed(animal: Animal, config: HuntConfig): number {
  return SPECIES[animal.species].speed * TUNING.difficulty[config.difficulty].speedScale;
}

function meadowPoint(roller: Roller): Vec2 {
  let meadow = TUNING.animals.meadow;
  return {
    x: roller.between(meadow.minX, meadow.maxX),
    y: roller.between(meadow.minY, meadow.maxY),
  };
}

function grazeUntil(nowMs: number, roller: Roller): number {
  let [minMs, maxMs] = TUNING.animals.grazeMs;
  return nowMs + roller.between(minMs, maxMs);
}

function isOffField(pos: Vec2): boolean {
  let margin = TUNING.animals.offFieldPx;
  return pos.x < -margin || pos.x > WORLD_W + margin || pos.y < -margin || pos.y > WORLD_H + margin;
}

function facingAlong(dx: number, facing: Animal["facing"]): Animal["facing"] {
  if (dx > 0) {
    return 1;
  }
  return dx < 0 ? -1 : facing;
}

function walk(animal: Animal, target: Vec2, stepPx: number, nowMs: number, roller: Roller): Animal {
  let toTarget = sub(target, animal.pos);
  let remaining = magnitude(toTarget);
  if (remaining <= stepPx) {
    return { ...animal, pos: target, mode: { kind: "graze", untilMs: grazeUntil(nowMs, roller) } };
  }
  return {
    ...animal,
    pos: add(animal.pos, scale(toTarget, stepPx / remaining)),
    facing: facingAlong(toTarget.x, animal.facing),
  };
}

function flee(animal: Animal, dir: Vec2, stepPx: number): Animal {
  let pos = add(animal.pos, scale(dir, stepPx));
  if (isOffField(pos)) {
    return { ...animal, pos, mode: { kind: "gone" } };
  }
  return { ...animal, pos, facing: facingAlong(dir.x, animal.facing) };
}

export function stepAnimal(
  animal: Animal,
  config: HuntConfig,
  nowMs: number,
  dtMs: number,
  roller: Roller
): Animal {
  let mode = animal.mode;
  let stepPx = (walkSpeed(animal, config) * dtMs) / 1000;
  switch (mode.kind) {
    case "graze":
      return nowMs < mode.untilMs
        ? animal
        : { ...animal, mode: { kind: "walk", target: meadowPoint(roller) } };
    case "walk":
      return walk(animal, mode.target, stepPx, nowMs, roller);
    case "alert":
      return nowMs < mode.untilMs
        ? animal
        : { ...animal, mode: { kind: "graze", untilMs: grazeUntil(nowMs, roller) } };
    case "flee":
      return flee(animal, mode.dir, stepPx * TUNING.animals.fleeSpeedScale);
    case "gone":
    case "down":
      return animal;
  }
}
