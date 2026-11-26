import { aimFromPull } from "./aim";
import { noticesDraw, stepAnimal } from "./animals";
import { launchArrow } from "./arrow";
import { createRoller } from "./rng";
import { landArrow } from "./shot";
import { openingAnimals, rollSpawnDelay, stepSpawner } from "./spawn";
import { TUNING } from "./tuning";
import {
  HUNTER_POS,
  type Animal,
  type HuntConfig,
  type HuntEvent,
  type HuntPhase,
  type HuntState,
  type Vec2,
} from "./types";
import { ZERO } from "./vec";

const STEP_MS = 5;

const READY: HuntPhase = { kind: "ready" };

export function createHunt(config: HuntConfig): HuntState {
  let roller = createRoller(config.seed);
  let animals = openingAnimals(config, roller);
  let spawnInMs = rollSpawnDelay(roller);
  return {
    config,
    rng: roller.state(),
    elapsedMs: 0,
    clockMin: TUNING.clock.startMin,
    arrows: TUNING.difficulty[config.difficulty].arrows,
    wind: { dir: 1, strength: 0 },
    animals,
    nextAnimalId: animals.length + 1,
    spawnInMs,
    phase: READY,
    harvests: [],
  };
}

function stepWorld(state: HuntState, nowMs: number): HuntState {
  let roller = createRoller(state.rng);
  let animals = state.animals.map((animal) =>
    stepAnimal(animal, state.config, nowMs, STEP_MS, roller)
  );
  let spawned = stepSpawner({ ...state, animals }, STEP_MS, roller);
  return { ...spawned, rng: roller.state() };
}

function stepPhase(state: HuntState): HuntState {
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
  let firstStep = Math.floor(state.elapsedMs / STEP_MS) + 1;
  let lastStep = Math.floor(elapsedMs / STEP_MS);
  let next = state;
  for (let index = firstStep; index <= lastStep; index++) {
    next = stepPhase(stepWorld(next, index * STEP_MS));
  }
  return { ...next, elapsedMs };
}

function startDraw(state: HuntState): HuntState {
  if (state.phase.kind !== "ready" || state.arrows === 0) {
    return state;
  }
  let untilMs = state.elapsedMs + TUNING.animals.alertMs;
  let animals = state.animals.map(
    (animal): Animal =>
      noticesDraw(animal, HUNTER_POS, state.config)
        ? { ...animal, mode: { kind: "alert", untilMs } }
        : animal
  );
  return { ...state, animals, phase: { kind: "drawing", pull: ZERO, heldMs: 0 } };
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
