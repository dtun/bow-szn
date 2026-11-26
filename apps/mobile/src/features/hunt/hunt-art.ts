import { SPRITES, type Sprite, type SpriteId } from "@bow-szn/pixels";

const RETICLE: Sprite = {
  name: "reticle",
  w: 9,
  h: 9,
  rows: [
    "...WWW...",
    "..W...W..",
    ".W.....W.",
    "W.......W",
    "W...W...W",
    "W.......W",
    ".W.....W.",
    "..W...W..",
    "...WWW...",
  ],
};

export type ArtId = SpriteId | "reticle";

export const ART: Record<ArtId, Sprite> = { ...SPRITES, reticle: RETICLE };
