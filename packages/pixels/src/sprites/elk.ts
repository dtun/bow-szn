import { defineSprites, erase, overlay, sprite } from "../compose.ts";
import type { Sprite } from "../types.ts";

export const ELK_KINDS = ["elk-cow", "elk-bull"] as const;
export type ElkKind = (typeof ELK_KINDS)[number];
export type ElkPose = "walk-1" | "walk-2" | "graze" | "flee" | "down";
export type ElkSpriteId = `${ElkKind}-${ElkPose}`;

const COW_BODIES = defineSprites<ElkPose>({
  "walk-1": [
    "..................E.E...",
    "..................UUUU..",
    "..................UUKUU.",
    ".................UUUULLK",
    "...............UUUUUUL..",
    "..............UUUUUU....",
    "...TTTTTTTTTTUUUU.......",
    "..LTTTTTTTTTTTUUU.......",
    "..LTTTTTTTTTTTTU........",
    "..LTttttttttTT..........",
    "...LLLLLLLLLLLL.........",
    "...U.E......E.U.........",
    "...U.E......E.U.........",
    "...U.E......E.U.........",
    "...U.E......E.U.........",
    "..U..E......E..U........",
    "..U..E......E..U........",
    "..K..K......K..K........",
  ],
  "walk-2": [
    "..................E.E...",
    "..................UUUU..",
    "..................UUKUU.",
    ".................UUUULLK",
    "...............UUUUUUL..",
    "..............UUUUUU....",
    "...TTTTTTTTTTUUUU.......",
    "..LTTTTTTTTTTTUUU.......",
    "..LTTTTTTTTTTTTU........",
    "..LTttttttttTT..........",
    "...LLLLLLLLLLLL.........",
    "...E.U......U.E.........",
    "...E.U......U.E.........",
    "...E.U......U.E.........",
    "...E.U......U.E.........",
    "..E...U....U...E........",
    "..E...U....U...E........",
    "..K...K....K...K........",
  ],
  graze: [
    "...TTTTTTTTTTUUUU.......",
    "..LTTTTTTTTTTTUUUU......",
    "..LTTTTTTTTTTTTUUUU.....",
    "..LTttttttttTTT.UUUU....",
    "...LLLLLLLLLLLL..UUUU...",
    "...U.E......E.U...UUUU..",
    "...U.E......E.U....UUUU.",
    "...U.E......E.U.....UUUU",
    "...U.E......E.U.....UUUU",
    "...U.E......E.U.....UKUL",
    "...U.E......E.U......ULK",
    "...K.K......K.K.........",
  ],
  flee: [
    "...................E.E..",
    "...................UUUU.",
    "..................UUKUU.",
    ".................UUUULLK",
    "...............UUUUUU...",
    "...TTTTTTTTTTUUUU.......",
    "..LTTTTTTTTTTTUUU.......",
    "..LTTTTTTTTTTTTU........",
    "..LTttttttttTT..........",
    "...LLLLLLLLLLL..........",
    "....U.E....E.U..........",
    "...U.E......E.U.........",
    "..U.E........E.U........",
    ".U.E..........E.U.......",
    "K.K............K.K......",
  ],
  down: [
    ".K.K.......K.K..........",
    ".U.E.......E.U..........",
    "..U.E.....E.U...........",
    "..U.E.....E.U...........",
    "...U.E...E.U............",
    "...LLLLLLLLLLLL..E.E....",
    "..LTttttttttTT.UUUUU....",
    "..LTTTTTTTTTTTTUUUUKUU..",
    "..LTTTTTTTTTTTTUUUUUULLK",
    "...tttttttttttt.UUUUUL..",
  ],
});

const BULL_RACK: Sprite = sprite("rack-bull", [
  "a.a.a...A.A.A",
  "a.a.a...A.A.A",
  "a.a.a...A.A.A",
  "a.a.a...A.A.A",
  "aaaaa...AAAAA",
  ".aaaa...AAAA.",
  "..aaa...AAA..",
  "...aaa.AAA...",
  "....aaAAA....",
  ".....aAA.....",
  ".....aAA.....",
]);

const BULL_RACK_CENTER = 6;

const LOWERED_BULL_RACK: Sprite = sprite("lowered-rack-bull", [
  "..a..A......",
  "a.aA.A......",
  "a.aAaA.A....",
  "a.aAaA.A....",
  ".aa.AAaA.A..",
  "..a.aAaA.A..",
  "...aa.AA.A..",
  "....a.aA.A..",
  ".....aa.AA.A",
  "......a.aA.A",
  "..........AA",
  "..........AA",
  "...........A",
]);

type Anchor = { x: number; y: number };

const STANDING_BULL_ANCHORS: Record<"walk-1" | "walk-2" | "flee", Anchor> = {
  "walk-1": { x: 17, y: 1 },
  "walk-2": { x: 17, y: 1 },
  flee: { x: 17, y: 1 },
};

const LOWERED_BULL_ANCHORS: Record<"graze" | "down", Anchor> = {
  graze: { x: 23, y: 6 },
  down: { x: 18, y: 4 },
};

const POSES: readonly ElkPose[] = ["walk-1", "walk-2", "graze", "flee", "down"];

function buildElk(kind: ElkKind, pose: ElkPose): Sprite {
  let name = `${kind}-${pose}`;
  let body = COW_BODIES[pose];
  if (kind === "elk-cow") {
    return { ...body, name };
  }
  if (pose === "graze" || pose === "down") {
    let rack = pose === "down" ? erase(name, LOWERED_BULL_RACK, "a") : LOWERED_BULL_RACK;
    let anchor = LOWERED_BULL_ANCHORS[pose];
    return overlay(name, rack, body, rack.w - 1 - anchor.x, rack.h - 1 - anchor.y);
  }
  let anchor = STANDING_BULL_ANCHORS[pose];
  return overlay(name, body, BULL_RACK, anchor.x - BULL_RACK_CENTER, anchor.y - BULL_RACK.h);
}

export const ELK_SPRITES = Object.fromEntries(
  ELK_KINDS.flatMap((kind) => POSES.map((pose) => [`${kind}-${pose}`, buildElk(kind, pose)]))
) as Record<ElkSpriteId, Sprite>;
