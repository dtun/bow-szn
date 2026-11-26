import { currentAim, isFullDraw, TUNING, type HuntState, type Vec2 } from "@bow-szn/core";

import type { Box } from "./hud";
import { CREAM, RED, rect, YELLOW, type Mark } from "./scene-marks";

export type DrawFeel = "steady" | "full" | "wobble";

export type DrawGauge = { marks: Mark[]; box: Box; percent: number; feel: DrawFeel };

const POWER_SEGMENTS = 10;
const CHEST: Vec2 = { x: 90, y: 297 };
const RADIUS = 20;
const SWEEP = (Math.PI * 4) / 3;
const START = -SWEEP / 2;
const DOTS = 84;
const EMPTY = "rgba(11,15,26,0.4)";
const SHAKE_X_MS = 37;
const SHAKE_Y_MS = 53;

const FEEL_COLORS: Record<DrawFeel, string> = { steady: CREAM, full: YELLOW, wobble: RED };

export function powerSegments(power: number): number {
  return Math.floor(power * POWER_SEGMENTS + 1e-9);
}

function feelOf(pull: Vec2, heldMs: number): DrawFeel {
  if (heldMs > TUNING.sway.onsetMs) {
    return "wobble";
  }
  return isFullDraw(pull) ? "full" : "steady";
}

function shake(feel: DrawFeel, elapsedMs: number): Vec2 {
  if (feel !== "wobble") {
    return { x: 0, y: 0 };
  }
  return {
    x: Math.round(Math.sin(elapsedMs / SHAKE_X_MS)),
    y: Math.round(Math.cos(elapsedMs / SHAKE_Y_MS)),
  };
}

export function drawGauge(hunt: HuntState): DrawGauge | null {
  let aim = currentAim(hunt);
  if (aim === null || hunt.phase.kind !== "drawing") {
    return null;
  }
  let feel = feelOf(hunt.phase.pull, hunt.phase.heldMs);
  let offset = shake(feel, hunt.elapsedMs);
  let lit = Math.round(aim.power * (DOTS + 1));
  let marks = Array.from({ length: DOTS + 1 }, (_, index) => {
    let angle = START + (SWEEP * index) / DOTS;
    let x = Math.round(CHEST.x + offset.x + Math.sin(angle) * RADIUS);
    let y = Math.round(CHEST.y + offset.y - Math.cos(angle) * RADIUS);
    return rect(`gauge-${index}`, x, y, 1, 1, index < lit ? FEEL_COLORS[feel] : EMPTY);
  });
  return {
    marks,
    box: {
      x: CHEST.x - RADIUS,
      y: CHEST.y - RADIUS,
      width: RADIUS * 2,
      height: RADIUS * 2,
    },
    percent: Math.round(aim.power * 100),
    feel,
  };
}
