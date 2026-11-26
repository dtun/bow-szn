import { hitRadius, isLive } from "./animals";
import { buildHarvest } from "./harvest";
import { createRoller } from "./rng";
import { TUNING } from "./tuning";
import type { Animal, HuntState, Vec2 } from "./types";
import { distance } from "./vec";

function closestWithin(
  animals: Animal[],
  landing: Vec2,
  radiusOf: (animal: Animal) => number
): Animal | null {
  let best: Animal | null = null;
  let bestDistance = Infinity;
  for (let animal of animals) {
    let away = distance(animal.pos, landing);
    if (isLive(animal) && away <= radiusOf(animal) && away < bestDistance) {
      best = animal;
      bestDistance = away;
    }
  }
  return best;
}

export function landArrow(state: HuntState, landing: Vec2): HuntState {
  let struck = closestWithin(state.animals, landing, hitRadius);
  if (struck === null) {
    let near = closestWithin(
      state.animals,
      landing,
      (animal) => hitRadius(animal) * TUNING.hit.nearScale
    );
    return { ...state, phase: { kind: "result", outcome: { kind: "miss", near: near !== null } } };
  }
  let roller = createRoller(state.rng);
  let harvest = buildHarvest(state, struck, landing, roller);
  let struckId = struck.id;
  return {
    ...state,
    rng: roller.state(),
    animals: state.animals.map((animal) =>
      animal.id === struckId ? { ...animal, mode: { kind: "down" } } : animal
    ),
    harvests: [...state.harvests, harvest],
    phase: { kind: "result", outcome: { kind: "harvest", harvest } },
  };
}
