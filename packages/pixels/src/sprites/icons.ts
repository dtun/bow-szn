import { defineSprites } from "../compose.ts";
import type { Sprite } from "../types.ts";

export type IconSpriteId =
  | "icon-quiver-arrow"
  | "icon-wind-light"
  | "icon-wind-medium"
  | "icon-wind-strong"
  | "icon-freezer"
  | "icon-plaque";

export const ICON_SPRITES: Record<IconSpriteId, Sprite> = defineSprites({
  "icon-quiver-arrow": [
    "..Y..",
    ".YYY.",
    "..C..",
    "..C..",
    "..C..",
    "..C..",
    ".RCR.",
    ".RCR.",
    "R.C.R",
  ],
  "icon-wind-light": [
    ".Y..........",
    ".TRR........",
    ".TRRR.......",
    ".T.RR.......",
    ".T..R.......",
    ".T..........",
    ".T..........",
    ".T..........",
    ".T..........",
    "TTT.........",
  ],
  "icon-wind-medium": [
    ".Y..........",
    ".TRRRR......",
    ".TMRRRRR....",
    ".TRRRRRRR...",
    ".T.MRRRR....",
    ".T...RR.....",
    ".T..........",
    ".T..........",
    ".T..........",
    "TTT.........",
  ],
  "icon-wind-strong": [
    ".Y..........",
    ".TRRRRRRR.RR",
    ".TMRRRRRRRRR",
    ".T.MRRRRRRR.",
    ".T..MMRRRR..",
    ".T....RR....",
    ".T..........",
    ".T..........",
    ".T..........",
    "TTT.........",
  ],
  "icon-freezer": [
    ".HHHHHHHHHHHH.",
    "HllllllllllllH",
    "HlWWlllllllllH",
    "HHHHHHHHHHHHHH",
    "HCCCCCCCCCCCCH",
    "HCCCCCZCCCCCCH",
    "HCCCCZZZCCCCCH",
    "HCCCCCZCCCCCCH",
    "HCCCCCCCCCCCCH",
    "HCCCCCCCCCCCCH",
    "HHHHHHHHHHHHHH",
    ".hh........hh.",
  ],
  "icon-plaque": [
    "..UUUUUUUU..",
    ".UbbbbbbbbU.",
    "UbBBBBBBBBbU",
    "UbBBBBBBBBbU",
    "UbBYYYYYYBbU",
    "UbByyyyyyBbU",
    "UbByyyyyyBbU",
    "UbBBBBBBBBbU",
    "UbBBBBBBBBbU",
    ".UbBBBBBBbU.",
    "..UbBBBBbU..",
    "...UbBBbU...",
    "....UUUU....",
  ],
});
