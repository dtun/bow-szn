import { TUNING } from "./tuning";
import { HUNTER_POS, type Aim, type HuntState, type Vec2 } from "./types";
import { add, clamp, magnitude, normalize, scale, sub, ZERO } from "./vec";

function swayOf(hunt: Pick<HuntState, "phase" | "elapsedMs">): Vec2 {
  let heldMs = hunt.phase.kind === "drawing" ? hunt.phase.heldMs : 0;
  let sway = TUNING.sway;
  let amplitude = clamp(((heldMs - sway.onsetMs) / 1000) * sway.growthPxPerSec, 0, sway.maxPx);
  if (amplitude === 0) {
    return ZERO;
  }
  let angle = (2 * Math.PI * hunt.elapsedMs) / sway.periodMs;
  return {
    x: amplitude * Math.sin(angle),
    y: amplitude * sway.liftScale * Math.sin(2 * angle),
  };
}

export function isFullDraw(pull: Vec2): boolean {
  return magnitude(pull) / TUNING.aim.maxPullPx >= TUNING.aim.fullDrawPower;
}

export function aimFromPull(
  pull: Vec2,
  hunt: Pick<HuntState, "wind" | "phase" | "elapsedMs">
): Aim | null {
  let pullLength = magnitude(pull);
  if (pullLength < TUNING.aim.deadZonePx) {
    return null;
  }
  let dir = normalize(sub(ZERO, pull));
  let power = clamp(pullLength / TUNING.aim.maxPullPx, 0, 1);
  let range = power * TUNING.aim.maxRangePx;
  let drift = {
    x: hunt.wind.dir * hunt.wind.strength * TUNING.wind.driftPerStrength * range,
    y: 0,
  };
  let sway = swayOf(hunt);
  let target = add(add(add(HUNTER_POS, scale(dir, range)), drift), sway);
  return { dir, power, target, sway };
}

export function currentAim(state: HuntState): Aim | null {
  return state.phase.kind === "drawing" ? aimFromPull(state.phase.pull, state) : null;
}
