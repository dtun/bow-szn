import { isFullDraw } from "./aim";
import { stepAnimal } from "./animals";
import { createRoller } from "./rng";
import { landArrow } from "./shot";
import { stepSpawner } from "./spawn";
import type { HuntState } from "./types";

const STEP_MS = 5;

export function stepIndexAt(elapsedMs: number): number {
  return Math.floor(elapsedMs / STEP_MS);
}

function stepAnimals(state: HuntState, nowMs: number): HuntState {
  let roller = createRoller(state.rng);
  let animals = state.animals.map((animal) =>
    stepAnimal(animal, state.config, nowMs, STEP_MS, roller)
  );
  let spawned = stepSpawner({ ...state, animals }, STEP_MS, roller);
  return { ...spawned, rng: roller.state() };
}

function stepPhase(state: HuntState): HuntState {
  if (state.phase.kind === "drawing") {
    return isFullDraw(state.phase.pull)
      ? { ...state, phase: { ...state.phase, heldMs: state.phase.heldMs + STEP_MS } }
      : state;
  }
  if (state.phase.kind !== "flight") {
    return state;
  }
  let arrow = { ...state.phase.arrow, elapsedMs: state.phase.arrow.elapsedMs + STEP_MS };
  if (arrow.elapsedMs < arrow.durationMs) {
    return { ...state, phase: { kind: "flight", arrow } };
  }
  return landArrow(state, arrow.to);
}

export function stepAt(state: HuntState, stepIndex: number): HuntState {
  return stepPhase(stepAnimals(state, stepIndex * STEP_MS));
}
