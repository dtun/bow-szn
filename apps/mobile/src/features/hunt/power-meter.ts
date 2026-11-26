import { currentAim, TUNING, type HuntState } from "@bow-szn/core";

import type { HuntView } from "./hunt-view";
import {
  CREAM,
  DIM,
  GREEN,
  label,
  NAVY,
  RED,
  rect,
  YELLOW,
  type Label,
  type Mark,
} from "./scene-marks";

export type PowerMeter = { marks: Mark[]; labels: Label[] };

export const POWER_SEGMENTS = 10;

const PANEL_W = 50;
const PANEL_H = 38;
const EDGE = 3;
const SEGMENT_W = 3;
const SEGMENT_STEP = 4;
const SEGMENT_H = 6;
const STEADY_W = 42;
const GREEN_SEGMENTS = 5;
const YELLOW_SEGMENTS = 8;

export function powerSegments(power: number): number {
  return Math.floor(power * POWER_SEGMENTS + 1e-9);
}

function segmentColor(index: number): string {
  if (index < GREEN_SEGMENTS) {
    return GREEN;
  }
  return index < YELLOW_SEGMENTS ? YELLOW : RED;
}

export function steadiness(heldMs: number): number {
  return Math.max(0, Math.min(1, 1 - heldMs / TUNING.sway.onsetMs));
}

export function powerFor(hunt: HuntState, view: HuntView): PowerMeter | null {
  let aim = currentAim(hunt);
  if (aim === null || hunt.phase.kind !== "drawing") {
    return null;
  }
  let steady = steadiness(hunt.phase.heldMs);
  let wobbling = hunt.phase.heldMs > TUNING.sway.onsetMs;
  let lit = powerSegments(aim.power);
  let x = view.bounds.right - EDGE - PANEL_W;
  let y = view.safeBottom - EDGE - PANEL_H;
  let segments = Array.from({ length: POWER_SEGMENTS }, (_, index) =>
    rect(
      `power-segment-${index}`,
      x + 5 + index * SEGMENT_STEP,
      y + 14,
      SEGMENT_W,
      SEGMENT_H,
      index < lit ? segmentColor(index) : DIM
    )
  );
  let steadyColor = steady > 0.35 ? GREEN : YELLOW;
  return {
    marks: [
      rect("power-edge", x - 1, y - 1, PANEL_W + 2, PANEL_H + 2, CREAM),
      rect("power-panel", x, y, PANEL_W, PANEL_H, NAVY),
      ...segments,
      rect("steady-track", x + 4, y + 32, STEADY_W, 2, DIM),
      rect("steady", x + 4, y + 32, Math.round(STEADY_W * steady), 2, wobbling ? RED : steadyColor),
    ],
    labels: [
      label("power", "POWER", { x: x + 4, y: y + 5 }, 4, CREAM),
      label(
        "power-percent",
        `${Math.round(aim.power * 100)}%`,
        { x: x + PANEL_W - 3, y: y + 4 },
        6,
        YELLOW,
        "right"
      ),
      label(
        "steady",
        wobbling ? "WOBBLE!" : "STEADY",
        { x: x + 4, y: y + 24 },
        4,
        wobbling ? RED : CREAM
      ),
    ],
  };
}
