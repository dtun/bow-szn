import { defineSprites, overlay, sprite } from "../compose.ts";
import type { Sprite } from "../types.ts";

export const DEER_KINDS = ["doe", "spike", "buck-small", "buck-medium", "buck-large"] as const;
export type DeerKind = (typeof DEER_KINDS)[number];
export type DeerPose = "walk-1" | "walk-2" | "graze" | "flee";
export type DeerSpriteId = `${DeerKind}-${DeerPose}`;

const DOE_BODIES = defineSprites<DeerPose>({
  "walk-1": [
    ".............U.U..",
    ".............BBBB.",
    ".............BBKBB",
    "...........BBBBBLK",
    "..........BBBBL...",
    "...bbbbbbbbbB.....",
    ".CBBBBBBBBBBB.....",
    ".CBBBBBBBBBBB.....",
    "..BLLLLLLLLBB.....",
    "..B.U....U.B......",
    "..B.U....U.B......",
    ".B..U....U..B.....",
    ".B..U....U..B.....",
    ".E..E....E..E.....",
  ],
  "walk-2": [
    ".............U.U..",
    ".............BBBB.",
    ".............BBKBB",
    "...........BBBBBLK",
    "..........BBBBL...",
    "...bbbbbbbbbB.....",
    ".CBBBBBBBBBBB.....",
    ".CBBBBBBBBBBB.....",
    "..BLLLLLLLLBB.....",
    "..U.B....B.U......",
    "..U.B....B.U......",
    ".U...B..B...U.....",
    ".U...B..B...U.....",
    ".E...E..E...E.....",
  ],
  graze: [
    "...bbbbbbbbbb.....",
    ".CBBBBBBBBBBBB....",
    ".CBBBBBBBBBBBBB...",
    "..BLLLLLLLLBB.BU..",
    "..B.U....U.B..BBB.",
    "..B.U....U.B...BKL",
    "..B.U....U.B....LK",
    "..B.U....U.B......",
    "..E.E....E.E......",
  ],
  flee: [
    ".............U.U..",
    ".............BBBB.",
    "C...........BBBKBB",
    "CC........BBBBBLLK",
    ".C.bbbbbbbbbB.....",
    ".BBBBBBBBBBBBB....",
    ".BBBBBBBBBBBB.....",
    "..BLLLLLLLLB......",
    "...B.U..U.B.......",
    "..B.U....U.B......",
    ".B.U......U.B.....",
    "E.E........E.E....",
  ],
});

type Rack = { art: Sprite; cx: number };

const RACKS: Record<Exclude<DeerKind, "doe">, Rack> = {
  spike: {
    cx: 2,
    art: sprite("rack-spike", ["a...A", "a...A", ".a.A.", ".a.A.", ".a.A."]),
  },
  "buck-small": {
    cx: 3,
    art: sprite("rack-small", ["a.a.A.A", ".a...A.", ".a...A.", ".aa.AA.", "..aAA.."]),
  },
  "buck-medium": {
    cx: 4,
    art: sprite("rack-medium", [
      "a.a...A.A",
      "a.a...A.A",
      "aaa...AAA",
      ".aaa.AAA.",
      "..aaAAA..",
      "...aAA...",
      "...aAA...",
    ]),
  },
  "buck-large": {
    cx: 5,
    art: sprite("rack-large", [
      "a.a.a.A.A.A",
      "a.a.a.A.A.A",
      "a.a.a.A.A.A",
      "aaaaa.AAAAA",
      ".aaa...AAA.",
      "..aaa.AAA..",
      "...aaaAA...",
      "....aaAA...",
      "....aAA....",
    ]),
  },
};

const HEAD_ANCHORS: Record<DeerPose, { x: number; y: number }> = {
  "walk-1": { x: 12, y: 1 },
  "walk-2": { x: 12, y: 1 },
  flee: { x: 12, y: 1 },
  graze: { x: 12, y: 3 },
};

const POSES: readonly DeerPose[] = ["walk-1", "walk-2", "graze", "flee"];

function buildDeer(kind: DeerKind, pose: DeerPose): Sprite {
  let name = `${kind}-${pose}`;
  let body = DOE_BODIES[pose];
  if (kind === "doe") {
    return { ...body, name };
  }
  let rack = RACKS[kind];
  let anchor = HEAD_ANCHORS[pose];
  let x = anchor.x - rack.cx;
  let y = anchor.y - rack.art.h;
  if (pose === "graze") {
    return overlay(name, rack.art, body, -x, -y);
  }
  return overlay(name, body, rack.art, x, y);
}

export const DEER_SPRITES = Object.fromEntries(
  DEER_KINDS.flatMap((kind) => POSES.map((pose) => [`${kind}-${pose}`, buildDeer(kind, pose)]))
) as Record<DeerSpriteId, Sprite>;
