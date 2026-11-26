import { isLive } from "./animals";
import { TUNING } from "./tuning";
import type { Animal, HuntState, ShotOutcome } from "./types";
import { stepAt, stepIndexAt } from "./world";

export function flightOutcome(state: HuntState): ShotOutcome | null {
  if (state.phase.kind !== "flight") {
    return null;
  }
  let next = state;
  let index = stepIndexAt(state.elapsedMs);
  while (next.phase.kind === "flight") {
    index += 1;
    next = stepAt(next, index);
  }
  return next.phase.kind === "result" ? next.phase.outcome : null;
}

export function shotWillHit(state: HuntState): boolean {
  return flightOutcome(state)?.kind === "harvest";
}

export function timeScale(state: HuntState): number {
  if (state.phase.kind !== "flight") {
    return 1;
  }
  let arrow = state.phase.arrow;
  if (arrow.elapsedMs / arrow.durationMs < TUNING.juice.slowMoFrom) {
    return 1;
  }
  let outcome = flightOutcome(state);
  let buck = outcome?.kind === "harvest" && outcome.harvest.antlers.kind === "rack";
  return buck ? TUNING.juice.slowMoRate : 1;
}

export function isGlinting(animal: Animal, elapsedMs: number): boolean {
  let juice = TUNING.juice;
  let bigRack = animal.antlers.kind === "rack" && animal.antlers.points >= juice.glintMinPoints;
  if (!bigRack || !isLive(animal)) {
    return false;
  }
  return (elapsedMs + animal.id * juice.glintStaggerMs) % juice.glintEveryMs < juice.glintMs;
}
