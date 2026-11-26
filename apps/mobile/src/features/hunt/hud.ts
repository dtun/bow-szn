import { SPOTS, type HuntState, type Wind } from "@bow-szn/core";
import { WIND_FLAG_FRAMES, type SpriteId } from "@bow-szn/pixels";

import type { HuntView } from "./hunt-view";
import {
  CREAM,
  INK,
  label,
  NAVY,
  rect,
  sprite,
  YELLOW,
  type Label,
  type Mark,
} from "./scene-marks";

export type Box = { x: number; y: number; width: number; height: number };

export type Hud = { marks: Mark[]; labels: Label[]; mapButton: Box; quiver: Box };

const BAR_H = 12;
const ROW_GAP = 2;
const ROW_H = 12;
const EDGE = 3;
const TEXT = 6;
const MAP_W = 26;
const ARROW_STEP = 6;
const WIND_W = 32;
const TAGS_GAP = 4;
const PILL = "rgba(19,33,74,0.82)";

export function clockLabel(clockMin: number): string {
  let minutes = Math.floor(clockMin);
  let hour = Math.floor(minutes / 60);
  let hour12 = hour % 12 === 0 ? 12 : hour % 12;
  let minute = String(minutes % 60).padStart(2, "0");
  return `${hour12}:${minute} ${hour < 12 ? "AM" : "PM"}`;
}

function windFlag(wind: Wind): SpriteId {
  return WIND_FLAG_FRAMES[Math.max(0, Math.min(WIND_FLAG_FRAMES.length - 1, wind.strength - 1))];
}

function quiverMarks(arrows: number, box: Box): Mark[] {
  return [
    rect("quiver", box.x, box.y, box.width, box.height, PILL),
    ...Array.from({ length: arrows }, (_, index) =>
      sprite(`quiver-arrow-${index}`, "icon-quiver-arrow", {
        x: box.x + 4 + index * ARROW_STEP,
        y: box.y + box.height - 1,
      })
    ),
  ];
}

export function hudFor(hunt: HuntState, view: HuntView): Hud {
  let { left, right } = view.bounds;
  let top = view.safeTop;
  let row = top + BAR_H + ROW_GAP;
  let textY = top + (BAR_H - TEXT) / 2;
  let mapButton: Box = { x: left + EDGE, y: row, width: MAP_W, height: ROW_H };
  let quiver: Box = {
    x: mapButton.x + MAP_W + EDGE + 1,
    y: row,
    width: 3 + Math.max(1, hunt.arrows) * ARROW_STEP,
    height: ROW_H,
  };
  let wind: Box = { x: right - EDGE - WIND_W, y: row, width: WIND_W, height: ROW_H };
  let marks: Mark[] = [
    rect("hud-bar", left, top, right - left, BAR_H, NAVY),
    rect("hud-bar-edge", left, top + BAR_H, right - left, 1, INK),
    ...quiverMarks(hunt.arrows, quiver),
    rect("wind", wind.x, wind.y, wind.width, wind.height, PILL),
    sprite(
      "wind-flag",
      windFlag(hunt.wind),
      { x: wind.x + 10, y: wind.y + ROW_H },
      {
        flip: hunt.wind.dir === -1,
      }
    ),
  ];
  let labels: Label[] = [
    label("spot", SPOTS[hunt.config.spot].name, { x: left + EDGE, y: textY }, TEXT, CREAM),
    label("clock", clockLabel(hunt.clockMin), { x: right - EDGE, y: textY }, TEXT, YELLOW, "right"),
    label(
      "tags",
      `TAGS ${hunt.harvests.length}`,
      { x: quiver.x + quiver.width + TAGS_GAP, y: row + (ROW_H - TEXT) / 2 },
      TEXT,
      CREAM
    ),
    label(
      "wind-strength",
      String(hunt.wind.strength),
      { x: wind.x + wind.width - 3, y: row + (ROW_H - TEXT) / 2 },
      TEXT,
      CREAM,
      "right"
    ),
  ];
  return { marks, labels, mapButton, quiver };
}
