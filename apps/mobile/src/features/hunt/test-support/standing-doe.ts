import { createHunt, HUNTER_POS, TUNING, type Vec2 } from "@bow-szn/core";

import { huntConfigFor } from "../hunt-config";

type StandingDoe = { seed: string; pos: Vec2 };

const EMPTY_GROUND_RANGE_PX = 30;

function findStandingDoe(): StandingDoe {
  for (let seed = 1; seed < 5000; seed++) {
    let hunt = createHunt(huntConfigFor({ seed: String(seed) }, 0));
    let doe = hunt.animals.find(
      (animal) =>
        animal.species === "whitetail" &&
        animal.antlers.kind === "none" &&
        animal.mode.kind === "graze" &&
        animal.mode.untilMs >= 2000 &&
        Math.abs(animal.pos.x - HUNTER_POS.x) <= 2 &&
        animal.pos.y >= 150
    );
    let alone =
      doe !== undefined &&
      hunt.animals.every(
        (other) =>
          other.id === doe.id || Math.hypot(other.pos.x - doe.pos.x, other.pos.y - doe.pos.y) > 30
      );
    if (doe !== undefined && alone && hunt.wind.strength === 0) {
      return { seed: String(seed), pos: doe.pos };
    }
  }
  throw new Error("no seed puts a lone doe dead ahead in calm air");
}

function pullForRange(rangePx: number): number {
  return (rangePx * TUNING.aim.maxPullPx) / TUNING.aim.maxRangePx;
}

export const STANDING_DOE = findStandingDoe();

export const PULL_TO_DOE = pullForRange(HUNTER_POS.y - STANDING_DOE.pos.y);

export const PULL_TO_EMPTY_GROUND = pullForRange(EMPTY_GROUND_RANGE_PX);
