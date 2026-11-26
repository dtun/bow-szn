import { TUNING } from "./tuning";
import { HUNTER_POS, type Aim, type HuntState, type Vec2 } from "./types";
import { add, clamp, magnitude, normalize, scale, sub, ZERO } from "./vec";

export function aimFromPull(pull: Vec2, hunt: Pick<HuntState, "wind">): Aim | null {
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
  let sway = ZERO;
  let target = add(add(add(HUNTER_POS, scale(dir, range)), drift), sway);
  return { dir, power, target, sway };
}
