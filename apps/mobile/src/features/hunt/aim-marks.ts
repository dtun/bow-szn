import {
  currentAim,
  HUNTER_POS,
  previewPath,
  TUNING,
  YARDS_PER_PX,
  type HuntState,
} from "@bow-szn/core";

import { centeredRect, CREAM, INK, label, RED, sprite, type Label, type Mark } from "./scene-marks";

export type AimMarks = { zone: Mark[]; sight: Mark[]; labels: Label[] };

const ZONE_FILL = "rgba(11,15,26,0.14)";
const ZONE_DOT = "rgba(244,239,225,0.55)";
const ZONE_DOT_STEP_PX = 5;
const ARC_DOT_STEP_PX = 4;
const BIG_DOT_EVERY = 3;
const WHITE = "#ffffff";
const TICK_REACH = 6;
const PULSE_MS = 260;
const RETICLE_HALF = 4;

function killZone(): { marks: Mark[]; labels: Label[] } {
  let reach = TUNING.aim.maxRangePx;
  let count = Math.floor((Math.PI * reach) / ZONE_DOT_STEP_PX);
  let dots = Array.from({ length: count + 1 }, (_, index) => {
    let angle = Math.PI + (Math.PI * index) / count;
    let at = {
      x: HUNTER_POS.x + Math.cos(angle) * reach,
      y: HUNTER_POS.y + Math.sin(angle) * reach,
    };
    return centeredRect(`zone-dot-${index}`, at, 1, 1, ZONE_DOT);
  });
  return {
    marks: [
      {
        kind: "oval",
        key: "zone",
        x: HUNTER_POS.x - reach,
        y: HUNTER_POS.y - reach,
        width: reach * 2,
        height: reach * 2,
        color: ZONE_FILL,
      },
      ...dots,
    ],
    labels: [
      label(
        "kill-zone",
        "KILL ZONE",
        { x: HUNTER_POS.x, y: HUNTER_POS.y - reach + 4 },
        4,
        CREAM,
        "center"
      ),
    ],
  };
}

export function aimMarks(hunt: HuntState): AimMarks | null {
  let aim = currentAim(hunt);
  if (aim === null || hunt.phase.kind !== "drawing") {
    return null;
  }
  let wobbling = hunt.phase.heldMs > TUNING.sway.onsetMs;
  let reach = Math.hypot(aim.target.x - HUNTER_POS.x, aim.target.y - HUNTER_POS.y);
  let count = Math.max(4, Math.floor(reach / ARC_DOT_STEP_PX));
  let arc = previewPath(aim, count + 1)
    .slice(1, -1)
    .map((point, index) =>
      (index + 1) % BIG_DOT_EVERY === 0
        ? centeredRect(`arc-dot-${index}`, point, 2, 2, WHITE)
        : centeredRect(`arc-dot-${index}`, point, 1, 1, CREAM)
    );
  let target = { x: Math.round(aim.target.x), y: Math.round(aim.target.y) };
  let pulse = Math.floor(hunt.elapsedMs / PULSE_MS) % 2;
  let tick = TICK_REACH + pulse;
  let color = wobbling ? RED : WHITE;
  let ticks = [
    { x: target.x - tick, y: target.y },
    { x: target.x + tick, y: target.y },
    { x: target.x, y: target.y - tick },
    { x: target.x, y: target.y + tick },
  ].map((at, index) => centeredRect(`reticle-tick-${index}`, at, 1, 1, color));
  let zone = killZone();
  let anchor = { x: target.x, y: target.y + RETICLE_HALF + 1 };
  return {
    zone: zone.marks,
    sight: [
      ...arc,
      sprite("reticle-shadow", "reticle", { x: anchor.x + 1, y: anchor.y + 1 }, { tint: INK }),
      sprite("reticle", "reticle", anchor, { tint: color }),
      ...ticks,
    ],
    labels: [
      ...zone.labels,
      label(
        "yards",
        `${Math.round(reach * YARDS_PER_PX)}Y`,
        { x: target.x, y: target.y - 13 },
        4,
        CREAM,
        "center"
      ),
    ],
  };
}
