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
] as const;

export type SoundId = (typeof SOUND_IDS)[number];
