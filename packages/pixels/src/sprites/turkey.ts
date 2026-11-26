import { defineSprites } from "../compose.ts";
import type { Sprite } from "../types.ts";

export type TurkeyPose = "walk-1" | "walk-2" | "graze" | "flee";
export type TurkeySpriteId = `turkey-${TurkeyPose}`;

export const TURKEY_SPRITES: Record<TurkeySpriteId, Sprite> = defineSprites({
  "turkey-walk-1": [
    "..T.T.T.T.......",
    ".TbTbTbTbT......",
    ".bUbUbUbUbU.ZZ..",
    "..UUUUUUUUU.ZKY.",
    "..UUUUUUUUUEERR.",
    "...UbUUUUUUEE...",
    "...UUbUUUUUU....",
    "....UUUUUUU.....",
    ".....bbbbb......",
    ".....V.V........",
    ".....V..V.......",
    "....VV..VV......",
  ],
  "turkey-walk-2": [
    "..T.T.T.T.......",
    ".TbTbTbTbT......",
    ".bUbUbUbUbU.ZZ..",
    "..UUUUUUUUU.ZKY.",
    "..UUUUUUUUUEERR.",
    "...UbUUUUUUEE...",
    "...UUbUUUUUU....",
    "....UUUUUUU.....",
    ".....bbbbb......",
    "......V.V.......",
    ".....V...V......",
    "....VV...VV.....",
  ],
  "turkey-graze": [
    "..T.T.T.T.......",
    ".TbTbTbTbT......",
    ".bUbUbUbUbU.....",
    "..UUUUUUUUU.....",
    "..UUUUUUUUUEE...",
    "...UbUUUUUUUEE..",
    "...UUbUUUUUU.EE.",
    "....UUUUUUU...ZZ",
    ".....bbbbb..RZKY",
    ".....V.V........",
    ".....V..V.......",
    "....VV..VV......",
  ],
  "turkey-flee": [
    "............ZZ..",
    "............ZKY.",
    "...........ERRR.",
    "..TTUUUUUUEEE...",
    ".TbUbUUUUUUE....",
    ".bUUUUbUUUUU....",
    "..UUUUUUUUU.....",
    "...bbbbbbb......",
    "..V.V...V.V.....",
    ".V...V.V...V....",
    "V...V.....V.....",
  ],
});
