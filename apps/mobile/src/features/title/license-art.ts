import { PALETTE, SPRITES, type Sprite } from "@bow-szn/pixels";

import type { SceneLayer, SceneRect } from "@/art/scene";

export type Box = { x: number; y: number; width: number; height: number };

export type LicenseLayout = {
  cols: number;
  rows: number;
  paper: SceneLayer;
  title: Box;
  level: Box;
  season: Box;
  perforationRow: number;
  tag: Box;
};

export const LICENSE_CELL = 4;
export const MIN_LICENSE_COLS = 68;
export const MAX_LICENSE_COLS = 104;
export const MENU_MARGIN = 16;
export const MENU_GAP = 8;

const STAMP = SPRITES["stamp-frame"];
export const LICENSE_PAD = 3;
const PAD = LICENSE_PAD;
const TITLE_X = 12;
const TITLE_Y = 3;
const TITLE_HEIGHT = 4;
const RULE_ROWS = [9, 11];
const STAMPS_Y = 14;
const PERFORATION_GAP = 3;
const TAG_GAP = 3;
export const GO_TAG_ROWS = 14;
export const JOURNAL_TAG_ROWS = 12;
export const TAG_POINT = 3;
export const TAG_EDGE = 2;
const TAG_HOLE_X = 5;
export const TAG_LABEL_X = TAG_HOLE_X + 4;
const HOLE_CENTER = 5;

export const NOTEBOOK: Sprite = {
  name: "title-notebook",
  w: 14,
  h: 16,
  rows: [
    "UUUUUUUUUUUUUU",
    "UEEbbbbbbbbbRU",
    "UEEBBBBBBBBBRU",
    "UEEBBBBBBBBBRU",
    "UEEBCCCCCCBBRU",
    "UEEBCKKKKCBBRU",
    "UEEBCCCCCCBBRU",
    "UEEBCKKKCCBBRU",
    "UEEBCCCCCCBBRU",
    "UEEBBBBBBBBBRU",
    "UEEBBBBBBBBBRU",
    "UEEBBBBBBBBBRU",
    "UEEBBBBBBBBBRU",
    "UEEBBBBBBBBBRU",
    "UEEBBBBBBBBBRU",
    "UUUUUUUUUUUUUU",
  ],
};

function rect(x: number, y: number, width: number, height: number, char: string): SceneRect {
  return { x, y, width, height, color: PALETTE[char] };
}

function punchedHole(centerX: number, centerY: number): SceneRect[] {
  return [
    rect(centerX - 1, centerY - 2, 3, 1, "S"),
    rect(centerX - 2, centerY - 1, 5, 3, "S"),
    rect(centerX - 1, centerY + 2, 3, 1, "S"),
  ];
}

function sideNotches(cols: number, row: number): SceneRect[] {
  return [
    rect(0, row - 1, 1, 3, "S"),
    rect(1, row, 2, 1, "S"),
    rect(cols - 1, row - 1, 1, 3, "S"),
    rect(cols - 3, row, 2, 1, "S"),
  ];
}

function perforationDots(cols: number, row: number): SceneRect[] {
  let dots: SceneRect[] = [];
  for (let x = PAD; x < cols - PAD; x += 2) {
    dots.push(rect(x, row, 1, 1, "a"));
  }
  return dots;
}

export function licenseCols(screenWidth: number): number {
  let room = Math.floor((screenWidth - MENU_MARGIN * 2) / LICENSE_CELL);
  return Math.max(MIN_LICENSE_COLS, Math.min(MAX_LICENSE_COLS, room));
}

export function licenseLayout(cols: number): LicenseLayout {
  let perforationRow = STAMPS_Y + STAMP.h + PERFORATION_GAP;
  let tagY = perforationRow + TAG_GAP;
  let rows = tagY + GO_TAG_ROWS + PAD;
  let levelX = Math.floor(cols / 4 - STAMP.w / 2);
  let seasonX = Math.floor((cols * 3) / 4 - STAMP.w / 2);

  let paper: SceneLayer = {
    rects: [
      rect(1, 0, cols - 2, rows, "U"),
      rect(0, 1, cols, rows - 2, "U"),
      rect(2, 1, cols - 4, rows - 2, "C"),
      rect(1, 2, cols - 2, rows - 4, "C"),
      rect(2, rows - 2, cols - 4, 1, "L"),
      ...punchedHole(HOLE_CENTER, HOLE_CENTER),
      ...RULE_ROWS.map((row) => rect(PAD, row, cols - PAD * 2, 1, "R")),
      ...perforationDots(cols, perforationRow),
      ...sideNotches(cols, perforationRow),
    ],
    sprites: [],
  };

  return {
    cols,
    rows,
    paper,
    title: { x: TITLE_X, y: TITLE_Y, width: cols - TITLE_X - PAD, height: TITLE_HEIGHT },
    level: { x: levelX, y: STAMPS_Y, width: STAMP.w, height: STAMP.h },
    season: { x: seasonX, y: STAMPS_Y, width: STAMP.w, height: STAMP.h },
    perforationRow,
    tag: { x: PAD, y: tagY, width: cols - PAD * 2, height: GO_TAG_ROWS },
  };
}

export type TagSkin = { face: string; edge: string };

export function tagLayer(width: number, rows: number, skin: TagSkin, hole: boolean): SceneLayer {
  let rects: SceneRect[] = [];
  for (let row = 0; row < rows; row++) {
    let inset = Math.max(0, TAG_POINT - Math.min(row, rows - 1 - row));
    let onEdge = row >= rows - TAG_EDGE;
    rects.push(rect(inset, row, width - inset, 1, onEdge ? skin.edge : skin.face));
  }
  if (hole) {
    let holeY = Math.floor((rows - TAG_EDGE) / 2);
    rects.push(rect(TAG_HOLE_X, holeY - 1, 2, 2, "C"));
  }
  return { rects, sprites: [] };
}
