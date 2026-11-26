import type { Roller } from "./rng";
import { SPECIES } from "./species";
import { HUNTER_POS, type Animal, type Harvest, type HuntState, type Vec2 } from "./types";
import { distance } from "./vec";

export const YARDS_PER_PX = 0.5;

export function buildHarvest(
  hunt: HuntState,
  animal: Animal,
  landing: Vec2,
  roller: Roller
): Harvest {
  let species = SPECIES[animal.species];
  let weightLb = roller.int(species.weightLb[0], species.weightLb[1]);
  return {
    id: `${hunt.config.seed}-${animal.id}`,
    species: animal.species,
    antlers: animal.antlers,
    weightLb,
    meatLb: Math.round(weightLb * species.meatYield),
    spot: hunt.config.spot,
    season: hunt.config.season,
    clockMin: Math.floor(hunt.clockMin),
    shotYards: Math.round(distance(HUNTER_POS, landing) * YARDS_PER_PX),
  };
}
