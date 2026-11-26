import { createHunt, HUNTER_POS, TUNING, type Animal, type Vec2 } from "@bow-szn/core";

import { huntConfigFor, type HuntParams } from "../hunt-config";

export type Standing = { seed: string; pos: Vec2; id: number };

const EMPTY_GROUND_RANGE_PX = 30;
const ELBOW_ROOM_PX = 30;

export function findStanding(
  params: Omit<HuntParams, "seed">,
  wanted: (animal: Animal) => boolean,
  grazeMs: number
): Standing {
  for (let seed = 1; seed < 50_000; seed++) {
    let hunt = createHunt(huntConfigFor({ ...params, seed: String(seed) }, 0));
    let found = hunt.animals.find(
      (animal) =>
        wanted(animal) &&
        animal.mode.kind === "graze" &&
        animal.mode.untilMs >= grazeMs &&
        Math.abs(animal.pos.x - HUNTER_POS.x) <= 2 &&
        animal.pos.y >= 150
    );
    let alone =
      found !== undefined &&
      hunt.animals.every(
        (other) =>
          other.id === found.id ||
          Math.hypot(other.pos.x - found.pos.x, other.pos.y - found.pos.y) > ELBOW_ROOM_PX
      );
    if (found !== undefined && alone && hunt.wind.strength === 0) {
      return { seed: String(seed), pos: found.pos, id: found.id };
    }
  }
  throw new Error("no seed puts a lone animal dead ahead in calm air");
}

export function pullForRange(rangePx: number): number {
  return (rangePx * TUNING.aim.maxPullPx) / TUNING.aim.maxRangePx;
}

export const STANDING_DOE = findStanding(
  {},
  (animal) => animal.species === "whitetail" && animal.antlers.kind === "none",
  2000
);

export const PULL_TO_DOE = pullForRange(HUNTER_POS.y - STANDING_DOE.pos.y);

export const RUT = { season: "rut" } as const;

export const STANDING_BUCK = findStanding(
  RUT,
  (animal) => animal.species === "whitetail" && animal.antlers.kind === "rack",
  1000
);

export const PULL_TO_BUCK = pullForRange(HUNTER_POS.y - STANDING_BUCK.pos.y);

export const PULL_TO_EMPTY_GROUND = pullForRange(EMPTY_GROUND_RANGE_PX);
