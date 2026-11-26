import {
  currentAim,
  HUNTER_POS,
  previewPath,
  TUNING,
  YARDS_PER_PX,
  type HuntState,
  type Vec2,
} from "@bow-szn/core";

import {
  centeredRect,
  CREAM,
  GREEN,
  INK,
  label,
  RED,
  sprite,
  YELLOW,
  type Label,
  type Mark,
} from "./scene-marks";

export type AimMarks = { ground: Mark[]; sight: Mark[]; labels: Label[] };

type Pin = { yards: number; color: string };

const PINS: readonly Pin[] = [
  { yards: 20, color: GREEN },
  { yards: 30, color: YELLOW },
  { yards: 40, color: RED },
];
const PIN_HEAD = 3;
const PIN_LABEL_GAP = 4;
const ARC_DOT_STEP_PX = 4;
const BIG_DOT_EVERY = 3;
const WHITE = "#ffffff";
const TICK_REACH = 6;
const PULSE_MS = 260;
const RETICLE_HALF = 4;
const TEXT = 6;

function pins(dir: Vec2, reach: number): { marks: Mark[]; labels: Label[] } {
  let shown = PINS.filter((pin) => pin.yards / YARDS_PER_PX <= reach);
  return {
    marks: shown.flatMap((pin) => {
      let at = {
        x: HUNTER_POS.x + (dir.x * pin.yards) / YARDS_PER_PX,
        y: HUNTER_POS.y + (dir.y * pin.yards) / YARDS_PER_PX,
      };
      return [
        centeredRect(`pin-ring-${pin.yards}`, at, PIN_HEAD + 2, PIN_HEAD + 2, INK),
        centeredRect(`pin-${pin.yards}`, at, PIN_HEAD, PIN_HEAD, pin.color),
      ];
    }),
    labels: shown.map((pin) =>
      label(
        `pin-label-${pin.yards}`,
        String(pin.yards),
        {
          x: HUNTER_POS.x + (dir.x * pin.yards) / YARDS_PER_PX + PIN_LABEL_GAP,
          y: HUNTER_POS.y + (dir.y * pin.yards) / YARDS_PER_PX - TEXT / 2,
        },
        TEXT,
        CREAM
      )
    ),
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
  let ruler = pins(aim.dir, reach);
  let anchor = { x: target.x, y: target.y + RETICLE_HALF + 1 };
  return {
    ground: ruler.marks,
    sight: [
      ...arc,
      sprite("reticle-shadow", "reticle", { x: anchor.x + 1, y: anchor.y + 1 }, { tint: INK }),
      sprite("reticle", "reticle", anchor, { tint: color }),
      ...ticks,
    ],
    labels: [
      label(
        "yards",
        `${Math.round(reach * YARDS_PER_PX)}Y`,
        { x: target.x, y: target.y - 15 },
        TEXT,
        CREAM,
        "center"
      ),
      ...ruler.labels,
    ],
  };
}
