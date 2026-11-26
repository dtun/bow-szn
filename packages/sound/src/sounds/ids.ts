export const SOUND_IDS = [
  "creak",
  "full-draw",
  "twang",
  "whoosh",
  "thunk",
  "hit",
  "spook",
  "glint",
  "whiff",
  "tap-hit",
  "tap-slip",
  "ui-select",
] as const;

export type SoundId = (typeof SOUND_IDS)[number];
