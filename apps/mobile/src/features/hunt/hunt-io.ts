import type { Harvest } from "@bow-szn/core";

import { lightTap, mediumTap, success } from "@/platform/haptics";
import { playSfx } from "@/platform/sfx";

import type { HuntEffect, HuntHaptic, HuntSound } from "./hunt-effects";

export type HuntIo = {
  record: (harvest: Harvest) => void;
  play: (sound: HuntSound) => void;
  feel: (haptic: HuntHaptic) => void;
};

const FEELS: Record<HuntHaptic, () => void> = {
  tick: lightTap,
  release: mediumTap,
  harvest: success,
};

export function deviceIo(record: (harvest: Harvest) => void): HuntIo {
  function feel(haptic: HuntHaptic) {
    FEELS[haptic]();
  }
  return { record, play: playSfx, feel };
}

function unrouted(effect: never): never {
  throw new Error(`No route for the hunt effect ${JSON.stringify(effect)}`);
}

export function fireEffects(effects: HuntEffect[], io: HuntIo) {
  for (let effect of effects) {
    switch (effect.kind) {
      case "sound":
        io.play(effect.sound);
        break;
      case "haptic":
        io.feel(effect.haptic);
        break;
      case "record":
        io.record(effect.harvest);
        break;
      case "hit-stop":
      case "shake":
      case "confetti":
      case "dirt":
      case "dust":
      case "stuck":
      case "pop":
        break;
      default:
        unrouted(effect);
    }
  }
}
