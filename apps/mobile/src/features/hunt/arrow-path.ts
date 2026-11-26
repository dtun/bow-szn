import { arrowAt, type Arrow, type Vec2 } from "@bow-szn/core";

const TANGENT_STEP = 0.02;

export function airborneAt(arrow: Arrow, progress: number): Vec2 {
  let { ground, height } = arrowAt({ ...arrow, elapsedMs: arrow.durationMs * progress });
  return { x: ground.x, y: ground.y - height };
}

export function headingAt(arrow: Arrow, progress: number): number {
  let from = airborneAt(arrow, Math.max(0, progress - TANGENT_STEP));
  let to = airborneAt(arrow, Math.min(1, progress + TANGENT_STEP));
  return Math.atan2(to.x - from.x, from.y - to.y);
}
