import { aimFromPull } from "./aim";
import { launchArrow } from "./arrow";
import { landArrow } from "./shot";
import { TUNING } from "./tuning";
import type { Animal, HuntConfig, HuntEvent, HuntPhase, HuntState, Vec2 } from "./types";
import { ZERO } from "./vec";

const STEP_MS = 5;

const READY: HuntPhase = { kind: "ready" };

const STARTING_DOE: Animal = {
  id: 1,
  species: "whitetail",
  antlers: { kind: "none" },
  pos: { x: 90, y: 180 },
  facing: 1,
  mode: { kind: "graze", untilMs: 0 },
};

export function createHunt(config: HuntConfig): HuntState {
  return {
    config,
    rng: config.seed | 0,
    elapsedMs: 0,
    clockMin: TUNING.clock.startMin,
    arrows: TUNING.difficulty[config.difficulty].arrows,
    wind: { dir: 1, strength: 0 },
    animals: [STARTING_DOE],
    nextAnimalId: STARTING_DOE.id + 1,
    spawnInMs: 0,
    phase: READY,
    harvests: [],
  };
}

function step(state: HuntState): HuntState {
  if (state.phase.kind !== "flight") {
    return state;
  }
  let arrow = { ...state.phase.arrow, elapsedMs: state.phase.arrow.elapsedMs + STEP_MS };
  if (arrow.elapsedMs < arrow.durationMs) {
    return { ...state, phase: { kind: "flight", arrow } };
  }
  return landArrow(state, arrow.to);
}

function advance(state: HuntState, dtMs: number): HuntState {
  let elapsedMs = state.elapsedMs + dtMs;
  let steps = Math.floor(elapsedMs / STEP_MS) - Math.floor(state.elapsedMs / STEP_MS);
  let next = state;
  for (let count = 0; count < steps; count++) {
    next = step(next);
  }
  return { ...next, elapsedMs };
}

function startDraw(state: HuntState): HuntState {
  if (state.phase.kind !== "ready" || state.arrows === 0) {
    return state;
  }
  return { ...state, phase: { kind: "drawing", pull: ZERO, heldMs: 0 } };
}

function movePull(state: HuntState, pull: Vec2): HuntState {
  if (state.phase.kind !== "drawing") {
    return state;
  }
  return { ...state, phase: { ...state.phase, pull } };
}

function release(state: HuntState): HuntState {
  if (state.phase.kind !== "drawing") {
    return state;
  }
  let aim = aimFromPull(state.phase.pull, state);
  if (aim === null) {
    return { ...state, phase: READY };
  }
  return { ...state, arrows: state.arrows - 1, phase: { kind: "flight", arrow: launchArrow(aim) } };
}

function cancelDraw(state: HuntState): HuntState {
  return state.phase.kind === "drawing" ? { ...state, phase: READY } : state;
}

function dismiss(state: HuntState): HuntState {
  return state.phase.kind === "result" ? { ...state, phase: READY } : state;
}

export function huntReducer(state: HuntState, event: HuntEvent): HuntState {
  switch (event.type) {
    case "tick":
      return advance(state, event.dtMs);
    case "draw-start":
      return startDraw(state);
    case "draw-move":
      return movePull(state, event.pull);
    case "release":
      return release(state);
    case "cancel":
      return cancelDraw(state);
    case "dismiss":
      return dismiss(state);
  }
}
