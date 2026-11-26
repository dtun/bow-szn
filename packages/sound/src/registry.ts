import type { Sound } from "./types.ts";
import type { SoundId } from "./sounds/ids.ts";
import { CREAK, FULL_DRAW, HIT, THUNK, TWANG, WHOOSH } from "./sounds/effects.ts";

export const SOUND_SAMPLE_RATE = 22050;

export const SOUNDS: Record<SoundId, Sound> = {
  creak: CREAK,
  "full-draw": FULL_DRAW,
  twang: TWANG,
  whoosh: WHOOSH,
  thunk: THUNK,
  hit: HIT,
};
