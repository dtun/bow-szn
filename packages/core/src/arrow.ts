import { TUNING } from "./tuning";
import { HUNTER_POS, type Aim, type Arrow, type Vec2 } from "./types";
import { clamp, distance, lerp } from "./vec";

export function launchArrow(aim: Aim): Arrow {
  let flightPx = distance(HUNTER_POS, aim.target);
  return {
    from: HUNTER_POS,
    to: aim.target,
    durationMs: TUNING.arrow.baseFlightMs + (flightPx / TUNING.arrow.speedPxPerSec) * 1000,
    elapsedMs: 0,
    peakHeight: flightPx * TUNING.arrow.arcHeightPerPx,
  };
}

export function arrowAt(arrow: Arrow): { ground: Vec2; height: number } {
  let progress = clamp(arrow.elapsedMs / arrow.durationMs, 0, 1);
  return {
    ground: lerp(arrow.from, arrow.to, progress),
    height: 4 * arrow.peakHeight * progress * (1 - progress),
  };
}

export function previewPath(aim: Aim, points: number): Vec2[] {
  let arrow = launchArrow(aim);
  return Array.from({ length: points }, (_, index) => {
    let sample = arrowAt({ ...arrow, elapsedMs: (arrow.durationMs * index) / (points - 1) });
    return { x: sample.ground.x, y: sample.ground.y - sample.height };
  });
}
