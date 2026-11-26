import { defineSprites, erase, overlay, sprite } from "../compose.ts";
import type { Sprite } from "../types.ts";

export const DEER_KINDS = ["doe", "spike", "buck-small", "buck-medium", "buck-large"] as const;
export type DeerKind = (typeof DEER_KINDS)[number];
export type DeerPose = "walk-1" | "walk-2" | "graze" | "flee" | "down";
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
  down: [
    "E.E.....E.E.......",
    "B.U.....U.B.......",
    ".B.U...U.B........",
    ".B.U...U.B........",
    "..B.U.U.B.........",
    "..LLLLLLLLL...U.U.",
    ".CBBBBBBBBBBBBBBB.",
    ".CBBBBBBBBBBBBBKBL",
    "...UUUUUUUUUUUUULK",
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

const LOWERED_RACKS: Record<Exclude<DeerKind, "doe">, Sprite> = {
  spike: sprite("lowered-rack-spike", ["a.A..", ".a.A.", "...A.", "....A", "....A"]),
  "buck-small": sprite("lowered-rack-small", [
    ".a..A..",
    ".a..A..",
    "aa.AA..",
    ".a.aA.A",
    ".....AA",
    ".....AA",
    "......A",
  ]),
  "buck-medium": sprite("lowered-rack-medium", [
    "a..A....",
    "a.aA.A..",
    "a.aA.A..",
    "a.aA.A..",
    ".aa.AA..",
    "..a.aA.A",
    "......AA",
    "......AA",
    ".......A",
  ]),
  "buck-large": sprite("lowered-rack-large", [
    "..a..A....",
    "a.aA.A....",
    "a.aAaA.A..",
    ".aa.AA.A..",
    "..a.aA.A..",
    "...aa.AA..",
    "....a.aA.A",
    "........AA",
    "........AA",
    ".........A",
  ]),
};

type Anchor = { x: number; y: number };

const STANDING_ANCHORS: Record<"walk-1" | "walk-2" | "flee" | "graze", Anchor> = {
  "walk-1": { x: 12, y: 1 },
  "walk-2": { x: 12, y: 1 },
  flee: { x: 12, y: 1 },
  graze: { x: 12, y: 3 },
};

const LOWERED_ANCHORS: Record<"down", Anchor> = {
  down: { x: 15, y: 5 },
};

const POSES: readonly DeerPose[] = ["walk-1", "walk-2", "graze", "flee", "down"];

function buildDeer(kind: DeerKind, pose: DeerPose): Sprite {
  let name = `${kind}-${pose}`;
  let body = DOE_BODIES[pose];
  if (kind === "doe") {
    return { ...body, name };
  }
  if (pose === "down") {
    let rack = erase(name, LOWERED_RACKS[kind], "a");
    let anchor = LOWERED_ANCHORS[pose];
    return overlay(name, rack, body, rack.w - 1 - anchor.x, rack.h - 1 - anchor.y);
  }
  let rack = RACKS[kind];
  let anchor = STANDING_ANCHORS[pose];
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
