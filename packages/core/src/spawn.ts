import { grazeUntil, isLive, meadowPoint, type AnimalKind } from "./animals";
import type { Roller } from "./rng";
import { SPECIES } from "./species";
import { SPOTS } from "./spots";
import { TUNING } from "./tuning";
import {
  WORLD_W,
  type AntlerOdds,
  type Animal,
  type Antlers,
  type HuntConfig,
  type HuntState,
  type SpeciesId,
  type Vec2,
} from "./types";

const ANTLER_CLASSES: readonly (keyof AntlerOdds)[] = ["doe", "spike", "buck"];

function rollSpecies(config: HuntConfig, roller: Roller): SpeciesId {
  let inSeason = SPOTS[config.spot].species.filter((id) =>
    SPECIES[id].seasons.includes(config.season)
  );
  return roller.pick(inSeason, (id) => SPECIES[id].rarity);
}

function rollAntlers(species: SpeciesId, config: HuntConfig, roller: Roller): Antlers {
  let headgear = SPECIES[species].headgear;
  if (headgear.kind === "none") {
    return { kind: "none" };
  }
  let odds = headgear.odds[config.season];
  let antlerClass = roller.pick(ANTLER_CLASSES, (kind) => odds[kind]);
  if (antlerClass === "doe") {
    return { kind: "none" };
  }
  if (antlerClass === "spike") {
    return { kind: "spike" };
  }
  let [minPoints, maxPoints] = headgear.rackPoints;
  let rolls = config.season === "rut" ? TUNING.rut.rackRolls : 1;
  let points = minPoints;
  for (let roll = 0; roll < rolls; roll++) {
    points = Math.max(points, roller.int(minPoints, maxPoints));
  }
  return { kind: "rack", points };
}

function edgePoint(roller: Roller): Vec2 {
  let meadow = TUNING.animals.meadow;
  let margin = TUNING.animals.offFieldPx;
  let side = roller.int(0, 2);
  if (side === 0) {
    return { x: -margin, y: roller.between(meadow.minY, meadow.maxY) };
  }
  if (side === 1) {
    return { x: WORLD_W + margin, y: roller.between(meadow.minY, meadow.maxY) };
  }
  return { x: roller.between(meadow.minX, meadow.maxX), y: -margin };
}

function rollKind(config: HuntConfig, roller: Roller): AnimalKind {
  let species = rollSpecies(config, roller);
  return { species, antlers: rollAntlers(species, config, roller) };
}

export function openingAnimals(config: HuntConfig, roller: Roller): Animal[] {
  return Array.from({ length: TUNING.spawn.opening }, (_, index) => {
    let kind = rollKind(config, roller);
    let pos = meadowPoint(roller);
    let facing: Animal["facing"] = roller.chance(0.5) ? 1 : -1;
    let untilMs = grazeUntil(kind, config, 0, roller);
    return { id: index + 1, ...kind, pos, facing, mode: { kind: "graze", untilMs } };
  });
}

export function rollSpawnDelay(roller: Roller): number {
  let [minMs, maxMs] = TUNING.spawn.everyMs;
  return roller.between(minMs, maxMs);
}

function walkIn(id: number, config: HuntConfig, roller: Roller): Animal {
  let kind = rollKind(config, roller);
  let pos = edgePoint(roller);
  let target = meadowPoint(roller);
  let facing: Animal["facing"] = target.x < pos.x ? -1 : 1;
  return { id, ...kind, pos, facing, mode: { kind: "walk", target } };
}

export function stepSpawner(state: HuntState, dtMs: number, roller: Roller): HuntState {
  let spawnInMs = state.spawnInMs - dtMs;
  if (spawnInMs > 0) {
    return { ...state, spawnInMs };
  }
  let rescheduled = { ...state, spawnInMs: rollSpawnDelay(roller) };
  if (state.animals.filter(isLive).length >= TUNING.spawn.maxLive) {
    return rescheduled;
  }
  return {
    ...rescheduled,
    animals: [...state.animals, walkIn(state.nextAnimalId, state.config, roller)],
    nextAnimalId: state.nextAnimalId + 1,
  };
}
