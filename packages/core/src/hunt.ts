import { aimFromPull } from "./aim";
import { noticesDraw } from "./animals";
import { launchArrow } from "./arrow";
import { timeScale } from "./juice";
import { createRoller } from "./rng";
import { openingAnimals, rollSpawnDelay } from "./spawn";
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
import { stepAt, stepIndexAt } from "./world";

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

function showLonger(state: HuntState, dtMs: number): HuntState {
  if (state.phase.kind !== "result") {
    return state;
  }
  return { ...state, phase: { ...state.phase, shownMs: state.phase.shownMs + dtMs } };
}

function advance(state: HuntState, dtMs: number): HuntState {
  if (state.phase.kind === "over") {
    return state;
  }
  let elapsedMs = state.elapsedMs + dtMs * timeScale(state);
  let next = showLonger(state, dtMs);
  for (let index = stepIndexAt(state.elapsedMs) + 1; index <= stepIndexAt(elapsedMs); index++) {
    next = stepAt(next, index);
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
