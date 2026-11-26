import { aimFromPull, isFullDraw } from "./aim";
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
  type Wind,
} from "./types";
import { ZERO } from "./vec";

const STEP_MS = 5;

const READY: HuntPhase = { kind: "ready" };

export function createHunt(config: HuntConfig): HuntState {
  let roller = createRoller(config.seed);
  let animals = openingAnimals(config, roller);
  let spawnInMs = rollSpawnDelay(roller);
  let wind: Wind = {
    dir: roller.chance(0.5) ? 1 : -1,
    strength: roller.int(0, TUNING.wind.maxStrength),
  };
  return {
    config,
    rng: roller.state(),
    elapsedMs: 0,
    clockMin: TUNING.clock.startMin,
    arrows: TUNING.difficulty[config.difficulty].arrows,
    wind,
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

function clockAt(elapsedMs: number): number {
  let clock = TUNING.clock;
  return Math.min(clock.endMin, clock.startMin + (elapsedMs / 1000) * clock.gameMinPerSec);
}

function isDusk(state: HuntState): boolean {
  return state.clockMin >= TUNING.clock.endMin;
}

function endAtDusk(state: HuntState): HuntState {
  let interruptible = state.phase.kind === "ready" || state.phase.kind === "drawing";
  return interruptible && isDusk(state)
    ? { ...state, phase: { kind: "over", reason: "dusk" } }
    : state;
}

function advance(state: HuntState, dtMs: number): HuntState {
  if (state.phase.kind === "over") {
    return state;
  }
  let elapsedMs = state.elapsedMs + dtMs;
  let firstStep = Math.floor(state.elapsedMs / STEP_MS) + 1;
  let lastStep = Math.floor(elapsedMs / STEP_MS);
  let next = state;
  for (let index = firstStep; index <= lastStep; index++) {
    next = stepPhase(stepWorld(next, index * STEP_MS));
  }
  return endAtDusk({ ...next, elapsedMs, clockMin: clockAt(elapsedMs) });
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
  if (state.phase.kind !== "result") {
    return state;
  }
  if (isDusk(state)) {
    return { ...state, phase: { kind: "over", reason: "dusk" } };
  }
  if (state.arrows === 0) {
    return { ...state, phase: { kind: "over", reason: "quiver-empty" } };
  }
  return { ...state, phase: READY };
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
