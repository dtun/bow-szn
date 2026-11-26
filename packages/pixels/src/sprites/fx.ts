import { defineSprites } from "../compose.ts";
import type { Sprite } from "../types.ts";

export type FxSpriteId =
  | "dirt-puff-1"
  | "dirt-puff-2"
  | "dirt-puff-3"
  | "glint-1"
  | "glint-2"
  | "glint-3"
  | "confetti-red"
  | "confetti-yellow"
  | "confetti-blue"
  | "confetti-cream";

export const FX_SPRITES: Record<FxSpriteId, Sprite> = defineSprites({
  "dirt-puff-1": ["..TT..", ".TTtT.", "TTtTTt", ".tttt."],
  "dirt-puff-2": [
    "...TT.TT..",
    ".TTtTTtTT.",
    "TTt....tTT",
    "Tt......tT",
    ".TTt..tTT.",
    "..tTTTTt..",
  ],
  "dirt-puff-3": [
    ".T....t..T..",
    "..t.T....t..",
    "T...t..T...t",
    "..T.....t.T.",
    ".t..T.t.....",
    "...t....T..t",
  ],
  "glint-1": [".W.", "WYW", ".W."],
  "glint-2": ["..W..", "..Y..", "WYWYW", "..Y..", "..W.."],
  "glint-3": [".Y.", "YWY", ".Y."],
  "confetti-red": ["RR", "RM"],
  "confetti-yellow": ["YY", "Yy"],
  "confetti-blue": ["ll", "lZ"],
  "confetti-cream": ["CC", "CL"],
});
