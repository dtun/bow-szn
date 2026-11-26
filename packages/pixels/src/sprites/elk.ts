import { defineSprites, overlay, sprite } from "../compose.ts";
import type { Sprite } from "../types.ts";

export const ELK_KINDS = ["elk-cow", "elk-bull"] as const;
export type ElkKind = (typeof ELK_KINDS)[number];
export type ElkPose = "walk-1" | "walk-2" | "graze" | "flee";
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

const BULL_HEAD_ANCHORS: Record<ElkPose, { x: number; y: number }> = {
  "walk-1": { x: 17, y: 1 },
  "walk-2": { x: 17, y: 1 },
  flee: { x: 17, y: 1 },
  graze: { x: 17, y: 7 },
};

const POSES: readonly ElkPose[] = ["walk-1", "walk-2", "graze", "flee"];

function buildElk(kind: ElkKind, pose: ElkPose): Sprite {
  let name = `${kind}-${pose}`;
  let body = COW_BODIES[pose];
  if (kind === "elk-cow") {
    return { ...body, name };
  }
  let anchor = BULL_HEAD_ANCHORS[pose];
  let x = anchor.x - BULL_RACK_CENTER;
  let y = anchor.y - BULL_RACK.h;
  if (pose === "graze") {
    return overlay(name, BULL_RACK, body, -x, -y);
  }
  return overlay(name, body, BULL_RACK, x, y);
}

export const ELK_SPRITES = Object.fromEntries(
  ELK_KINDS.flatMap((kind) => POSES.map((pose) => [`${kind}-${pose}`, buildElk(kind, pose)]))
) as Record<ElkSpriteId, Sprite>;
