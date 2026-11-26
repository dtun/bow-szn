export const SOUND_IDS = ["creak", "full-draw", "twang", "whoosh", "thunk", "hit"] as const;

export type SoundId = (typeof SOUND_IDS)[number];
