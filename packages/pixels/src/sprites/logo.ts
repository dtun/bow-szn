import { defineSprites, hstack, shadowed } from "../compose.ts";
import type { Sprite } from "../types.ts";

export type LogoLetterId =
  | "logo-b"
  | "logo-o"
  | "logo-w"
  | "logo-s"
  | "logo-e"
  | "logo-a"
  | "logo-n";
export type LogoSpriteId = LogoLetterId | "logo-wordmark";

const LETTER_GAP = 1;
const WORD_GAP = 5;

const LETTERS: Record<LogoLetterId, Sprite> = defineSprites({
  "logo-b": [
    "CCCCCC.",
    "CCCCCCC",
    "CC...CC",
    "CC...CC",
    "CCCCCC.",
    "CC...CC",
    "CC...CC",
    "CCCCCCC",
    "CCCCCC.",
  ],
  "logo-o": [
    ".CCCCC.",
    "CCCCCCC",
    "CC...CC",
    "CC...CC",
    "CC...CC",
    "CC...CC",
    "CC...CC",
    "CCCCCCC",
    ".CCCCC.",
  ],
  "logo-w": [
    "CC...CC",
    "CC...CC",
    "CC...CC",
    "CC...CC",
    "CC.C.CC",
    "CC.C.CC",
    "CCCCCCC",
    "CCCCCCC",
    ".CC.CC.",
  ],
  "logo-s": [
    ".CCCCCC",
    "CCCCCCC",
    "CC.....",
    "CCCCCC.",
    ".CCCCCC",
    ".....CC",
    ".....CC",
    "CCCCCCC",
    "CCCCCC.",
  ],
  "logo-e": [
    "CCCCCCC",
    "CCCCCCC",
    "CC.....",
    "CCCCCC.",
    "CCCCCC.",
    "CC.....",
    "CC.....",
    "CCCCCCC",
    "CCCCCCC",
  ],
  "logo-a": [
    "..CCC..",
    ".CCCCC.",
    "CC...CC",
    "CC...CC",
    "CCCCCCC",
    "CCCCCCC",
    "CC...CC",
    "CC...CC",
    "CC...CC",
  ],
  "logo-n": [
    "CC...CC",
    "CCC..CC",
    "CCCC.CC",
    "CCCCCCC",
    "CC.CCCC",
    "CC..CCC",
    "CC...CC",
    "CC...CC",
    "CC...CC",
  ],
});

const BOW = hstack("bow", [LETTERS["logo-b"], LETTERS["logo-o"], LETTERS["logo-w"]], LETTER_GAP);

const SEASON = hstack(
  "season",
  [
    LETTERS["logo-s"],
    LETTERS["logo-e"],
    LETTERS["logo-a"],
    LETTERS["logo-s"],
    LETTERS["logo-o"],
    LETTERS["logo-n"],
  ],
  LETTER_GAP
);

export const LOGO_SPRITES: Record<LogoSpriteId, Sprite> = {
  ...LETTERS,
  "logo-wordmark": shadowed("logo-wordmark", hstack("logo-wordmark", [BOW, SEASON], WORD_GAP), "R"),
};
