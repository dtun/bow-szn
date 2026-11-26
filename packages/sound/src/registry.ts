import type { Sound } from "./types.ts";
import type { SoundId } from "./sounds/ids.ts";
import { TAP_HIT, TAP_SLIP, UI_SELECT } from "./sounds/interface.ts";
import { GLINT, SPOOK, WHIFF } from "./sounds/reactions.ts";
import { CREAK, FULL_DRAW, HIT, THUNK, TWANG, WHOOSH } from "./sounds/shot.ts";

export const SOUND_SAMPLE_RATE = 22050;

export const SOUNDS: Record<SoundId, Sound> = {
  creak: CREAK,
  "full-draw": FULL_DRAW,
  twang: TWANG,
  whoosh: WHOOSH,
  thunk: THUNK,
  hit: HIT,
  spook: SPOOK,
  glint: GLINT,
  whiff: WHIFF,
  "tap-hit": TAP_HIT,
  "tap-slip": TAP_SLIP,
  "ui-select": UI_SELECT,
};
