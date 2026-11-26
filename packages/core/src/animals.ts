import type { Roller } from "./rng";
import { SPECIES } from "./species";
import { TUNING } from "./tuning";
import { WORLD_H, WORLD_W, type Animal, type HuntConfig, type Vec2 } from "./types";
import { add, distance, magnitude, normalize, scale, sub } from "./vec";

export function isLive(animal: Animal): boolean {
  return animal.mode.kind !== "down" && animal.mode.kind !== "gone";
}

export function hitRadius(animal: Animal, config: HuntConfig): number {
  let buck = animal.antlers.kind === "rack" ? TUNING.hit.buckZoneScale : 1;
  return (
    SPECIES[animal.species].hitRadius * TUNING.difficulty[config.difficulty].hitZoneScale * buck
  );
}

function spookRadius(animal: Animal, config: HuntConfig): number {
  let buck = animal.antlers.kind === "rack" ? TUNING.animals.buckWariness : 1;
  return SPECIES[animal.species].spookRadius * TUNING.difficulty[config.difficulty].wariness * buck;
}

export function isSpookedBy(animal: Animal, source: Vec2, config: HuntConfig): boolean {
  return isLive(animal) && distance(animal.pos, source) <= spookRadius(animal, config);
}

export function fleeFrom(animal: Animal, source: Vec2): Animal {
  let away = normalize(sub(animal.pos, source));
  let dir = magnitude(away) === 0 ? { x: 0, y: -1 } : away;
  return { ...animal, mode: { kind: "flee", dir } };
}

export function noticesDraw(animal: Animal, hunter: Vec2, config: HuntConfig): boolean {
  let calm = animal.mode.kind === "graze" || animal.mode.kind === "walk";
  let reach = spookRadius(animal, config) * TUNING.animals.drawSpookScale;
  return calm && distance(animal.pos, hunter) <= reach;
}

export type AnimalKind = Pick<Animal, "species" | "antlers">;

function isRutting(animal: AnimalKind, config: HuntConfig): boolean {
  return config.season === "rut" && SPECIES[animal.species].headgear.kind === "antlered";
}

function walkSpeed(animal: Animal, config: HuntConfig): number {
  let rut = isRutting(animal, config) ? TUNING.rut.antleredSpeedScale : 1;
  return SPECIES[animal.species].speed * TUNING.difficulty[config.difficulty].speedScale * rut;
}

export function meadowPoint(roller: Roller): Vec2 {
  let meadow = TUNING.animals.meadow;
  return {
    x: roller.between(meadow.minX, meadow.maxX),
    y: roller.between(meadow.minY, meadow.maxY),
  };
}

export function grazeUntil(
  animal: AnimalKind,
  config: HuntConfig,
  nowMs: number,
  roller: Roller
): number {
  let [minMs, maxMs] = TUNING.animals.grazeMs;
  let buck = animal.antlers.kind === "rack" ? TUNING.animals.buckGrazeScale : 1;
  let rut = isRutting(animal, config) ? TUNING.rut.antleredGrazeScale : 1;
  return nowMs + roller.between(minMs, maxMs) * buck * rut;
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

function walk(
  animal: Animal,
  target: Vec2,
  config: HuntConfig,
  stepPx: number,
  nowMs: number,
  roller: Roller
): Animal {
  let toTarget = sub(target, animal.pos);
  let remaining = magnitude(toTarget);
  if (remaining <= stepPx) {
    let untilMs = grazeUntil(animal, config, nowMs, roller);
    return { ...animal, pos: target, mode: { kind: "graze", untilMs } };
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
      return walk(animal, mode.target, config, stepPx, nowMs, roller);
    case "alert":
      return nowMs < mode.untilMs
        ? animal
        : {
            ...animal,
            mode: { kind: "graze", untilMs: grazeUntil(animal, config, nowMs, roller) },
          };
    case "flee":
      return flee(animal, mode.dir, stepPx * TUNING.animals.fleeSpeedScale);
    case "gone":
    case "down":
      return animal;
  }
}
