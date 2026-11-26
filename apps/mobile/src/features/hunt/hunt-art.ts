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

const DEER_TAG: Sprite = {
  name: "deer-tag",
  w: 7,
  h: 12,
  rows: [
    "..RRR..",
    ".R...R.",
    "..R.R..",
    ".KKRKK.",
    "KOOKOOK",
    "KOOOOOK",
    "KOCCCOK",
    "KOOOOOK",
    "KOCCOOK",
    "KOOOOOK",
    "KOOOOOK",
    ".KKKKK.",
  ],
};

export type ArtId = SpriteId | "reticle" | "deer-tag";

export const ART: Record<ArtId, Sprite> = { ...SPRITES, reticle: RETICLE, "deer-tag": DEER_TAG };
