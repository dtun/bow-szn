import { fleeFrom, hitRadius, isLive, isSpookedBy } from "./animals";
import { buildHarvest } from "./harvest";
import { createRoller } from "./rng";
import { TUNING } from "./tuning";
import type { Animal, HuntConfig, HuntState, ShotOutcome, Vec2 } from "./types";
import { distance } from "./vec";

function closestWithin(
  animals: Animal[],
  landing: Vec2,
  config: HuntConfig,
  zoneScale: number
): Animal | null {
  let best: Animal | null = null;
  let bestDistance = Infinity;
  for (let animal of animals) {
    let away = distance(animal.pos, landing);
    let reach = hitRadius(animal, config) * zoneScale;
    if (isLive(animal) && away <= reach && away < bestDistance) {
      best = animal;
      bestDistance = away;
    }
  }
  return best;
}

export function landArrow(state: HuntState, landing: Vec2): HuntState {
  let struck = closestWithin(state.animals, landing, state.config, 1);
  let near =
    struck === null
      ? closestWithin(state.animals, landing, state.config, TUNING.hit.nearScale)
      : null;
  let animals = state.animals.map((animal): Animal => {
    if (animal.id === struck?.id) {
      return { ...animal, mode: { kind: "down" } };
    }
    if (animal.id === near?.id || isSpookedBy(animal, landing, state.config)) {
      return fleeFrom(animal, landing);
    }
    return animal;
  });
  if (struck === null) {
    let outcome: ShotOutcome = { kind: "miss", near: near !== null };
    return { ...state, animals, phase: { kind: "result", outcome } };
  }
  let roller = createRoller(state.rng);
  let harvest = buildHarvest(state, struck, landing, roller);
  return {
    ...state,
    rng: roller.state(),
    animals,
    harvests: [...state.harvests, harvest],
    phase: { kind: "result", outcome: { kind: "harvest", harvest } },
  };
}
