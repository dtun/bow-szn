import { TUNING, type Vec2 } from "@bow-szn/core";
import { PALETTE } from "@bow-szn/pixels";

import { HORIZON } from "./field-layout";
import { hudRow } from "./hud";
import type { HuntView } from "./hunt-view";
import { label, rect, YELLOW, type Label, type Mark } from "./scene-marks";

export type SunArc = { marks: Mark[]; labels: Label[] };

const SUN_R = 5;
const RIM = 1;
const SIDE = 14;
const SUNRISE_Y = HORIZON - 6;
const CLEARANCE = SUN_R + RIM + 3;
const TRACK_STEP = 0.04;
const TRACK = "rgba(255,255,255,0.85)";
const TEXT = 6;
const MIN_CLIMB = 8;

export function shortClock(clockMin: number): string {
  let minutes = Math.floor(clockMin);
  let hour = Math.floor(minutes / 60) % 12;
  return `${hour === 0 ? 12 : hour}:${String(minutes % 60).padStart(2, "0")}`;
}

function morningPassed(clockMin: number): number {
  let { startMin, endMin } = TUNING.clock;
  return Math.max(0, Math.min(1, (clockMin - startMin) / (endMin - startMin)));
}

function sunAt(view: HuntView, passed: number): Vec2 {
  let { left, right } = view.bounds;
  let peak = hudRow(view).bottom + CLEARANCE;
  let climb = 1 - (1 - passed) ** 2;
  return {
    x: Math.round(left + SIDE + passed * (right - left - SIDE * 2)),
    y: Math.round(SUNRISE_Y - (SUNRISE_Y - peak) * climb),
  };
}

function disk(key: string, center: Vec2, radius: number, color: string): Mark[] {
  return Array.from({ length: radius * 2 + 1 }, (_, index) => {
    let row = index - radius;
    let half = Math.floor(Math.sqrt(radius ** 2 - row ** 2));
    return rect(`${key}-${index}`, center.x - half, center.y + row, half * 2 + 1, 1, color);
  });
}

function track(view: HuntView, passed: number): Mark[] {
  let dots: Mark[] = [];
  for (let ahead = passed + TRACK_STEP; ahead <= 1 + 1e-9; ahead += TRACK_STEP) {
    let at = sunAt(view, ahead);
    dots.push(rect(`sun-track-${dots.length}`, at.x, at.y, 1, 1, TRACK));
  }
  return dots;
}

function hasRoomForTheSun(view: HuntView): boolean {
  return hudRow(view).bottom + CLEARANCE <= SUNRISE_Y - MIN_CLIMB;
}

function clockInTheRow(clockMin: number, view: HuntView): SunArc {
  let row = hudRow(view);
  let at = { x: row.windLeft - 3, y: row.top + (row.bottom - row.top - TEXT) / 2 };
  return {
    marks: [],
    labels: [label("sun-time", shortClock(clockMin), at, TEXT, YELLOW, "right")],
  };
}

export function sunArc(clockMin: number, view: HuntView): SunArc {
  if (!hasRoomForTheSun(view)) {
    return clockInTheRow(clockMin, view);
  }
  let passed = morningPassed(clockMin);
  let sun = sunAt(view, passed);
  let lastCall = clockMin >= TUNING.clock.endMin - TUNING.hud.lastCallMin;
  return {
    marks: [
      ...track(view, passed),
      ...disk("sun-rim", sun, SUN_R + RIM, PALETTE.P),
      ...disk("sun", sun, SUN_R, PALETTE.Y),
    ],
    labels: lastCall
      ? [
          label(
            "sun-time",
            shortClock(clockMin),
            { x: sun.x - SUN_R - RIM - 2, y: sun.y - TEXT / 2 },
            TEXT,
            YELLOW,
            "right"
          ),
        ]
      : [],
  };
}
