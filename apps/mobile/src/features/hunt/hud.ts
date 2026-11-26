import { SPOTS, TUNING, type HuntState, type Wind } from "@bow-szn/core";
import { PALETTE } from "@bow-szn/pixels";

import type { HuntView } from "./hunt-view";
import { CREAM, label, rect, RED, sprite, YELLOW, type Label, type Mark } from "./scene-marks";

export type Box = { x: number; y: number; width: number; height: number };

export type Hud = { marks: Mark[]; labels: Label[]; mapButton: Box; quiver: Box; tags: Box };

const ROW_H = 12;
const EDGE = 3;
const TEXT = 6;
const MAP_W = 26;
const ARROW_STEP = 6;
const WIND_W = 32;
const TAGS_GAP = 4;
const TAG_STEP = 8;
const TITLE = 8;
const TITLE_DROP = 6;
const PILL = "rgba(19,33,74,0.82)";
const POLE_INSET = 4;
const POLE_H = 10;
const FLY_STEP = 3;
const FLY_ROOM = FLY_STEP * 4;
const RIPPLE = 0.8;
const FLUTTER_MS: readonly number[] = [0, 760, 500, 320];

export type HudRow = { top: number; bottom: number; windLeft: number };

export function hudRow(view: HuntView): HudRow {
  let top = view.safeTop + EDGE;
  return { top, bottom: top + ROW_H, windLeft: view.bounds.right - EDGE - WIND_W };
}

export function hudRowBottom(view: HuntView): number {
  return hudRow(view).bottom;
}

function windFlag(wind: Wind, box: Box, elapsedMs: number): Mark[] {
  let pole = wind.dir === 1 ? box.x + POLE_INSET : box.x + box.width - POLE_INSET - FLY_ROOM;
  let top = box.y + 1;
  let staff = [
    rect("wind-knob", pole, top - 1, 1, 1, YELLOW),
    rect("wind-pole", pole, top, 1, POLE_H, PALETTE.T),
  ];
  if (wind.strength === 0) {
    return [
      ...staff,
      rect("wind-fly-1", pole + wind.dir, top + 1, 1, 4, RED),
      rect("wind-fly-2", pole + wind.dir * 2, top + 2, 1, 3, PALETTE.M),
    ];
  }
  let length = FLY_STEP * (Math.min(wind.strength, FLUTTER_MS.length - 1) + 1);
  let period = FLUTTER_MS[Math.min(wind.strength, FLUTTER_MS.length - 1)];
  let phase = (2 * Math.PI * elapsedMs) / period;
  let fly = Array.from({ length }, (_, index) => {
    let along = index + 1;
    let sway = Math.round(Math.sin(phase - along * RIPPLE) * Math.min(1, along / 4));
    let height = along > length - 2 ? 2 : 3;
    let color = along % 4 < 2 ? RED : CREAM;
    return rect(`wind-fly-${along}`, pole + wind.dir * along, top + 1 + sway, 1, height, color);
  });
  return [...staff, ...fly];
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
  let { left } = view.bounds;
  let { top: row, bottom, windLeft } = hudRow(view);
  let mapButton: Box = { x: left + EDGE, y: row, width: MAP_W, height: ROW_H };
  let quiver: Box = {
    x: mapButton.x + MAP_W + EDGE + 1,
    y: row,
    width: 3 + Math.max(1, hunt.arrows) * ARROW_STEP,
    height: ROW_H,
  };
  let tags: Box = {
    x: quiver.x + quiver.width + TAGS_GAP,
    y: row,
    width: Math.max(1, hunt.harvests.length) * TAG_STEP,
    height: ROW_H,
  };
  let wind: Box = { x: windLeft, y: row, width: WIND_W, height: ROW_H };
  let marks: Mark[] = [
    ...quiverMarks(hunt.arrows, quiver),
    ...hunt.harvests.map((harvest, index) =>
      sprite(`tag-${harvest.id}`, "deer-tag", {
        x: tags.x + 3 + index * TAG_STEP,
        y: tags.y + tags.height,
      })
    ),
    rect("wind", wind.x, wind.y, wind.width, wind.height, PILL),
    ...windFlag(hunt.wind, wind, hunt.elapsedMs),
  ];
  let title =
    hunt.elapsedMs < TUNING.hud.spotTitleMs
      ? [
          label(
            "spot",
            SPOTS[hunt.config.spot].name,
            { x: 90, y: bottom + TITLE_DROP },
            TITLE,
            YELLOW,
            "center"
          ),
        ]
      : [];
  let labels: Label[] = [
    ...title,
    label(
      "wind-strength",
      String(hunt.wind.strength),
      { x: wind.x + wind.width - 3, y: row + (ROW_H - TEXT) / 2 },
      TEXT,
      CREAM,
      "right"
    ),
  ];
  return { marks, labels, mapButton, quiver, tags };
}
