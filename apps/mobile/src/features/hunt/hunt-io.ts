import type { Harvest } from "@bow-szn/core";

import type { HuntEffect } from "./hunt-effects";

export type HuntIo = {
  record: (harvest: Harvest) => void;
};

export function fireEffects(effects: HuntEffect[], io: HuntIo) {
  for (let effect of effects) {
    if (effect.kind === "record") {
      io.record(effect.harvest);
    }
  }
}
