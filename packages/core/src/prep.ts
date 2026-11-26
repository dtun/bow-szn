import { createRoller, type Roller } from "./rng";
import { TUNING } from "./tuning";
import type { Difficulty, PrepEvent, PrepState } from "./types";

function zoneAwayFrom(markerPos: number, width: number, roller: Roller): PrepState["zone"] {
  let start = markerPos < 0.5 ? roller.between(0.5, 1 - width) : roller.between(0, 0.5 - width);
  return [start, start + width];
}

export function createPrep(difficulty: Difficulty, seed: number): PrepState {
  let roller = createRoller(seed);
  let scale = TUNING.difficulty[difficulty];
  let zone = zoneAwayFrom(0, TUNING.prep.zoneWidth * scale.prepZoneScale, roller);
  return {
    markerPos: 0,
    markerDir: 1,
    speed: TUNING.prep.markerBarsPerSec * scale.prepSpeedScale,
    zone,
    hits: 0,
    needed: TUNING.prep.needed,
    lastTap: "none",
    rng: roller.state(),
  };
}

export function isPrepDone(state: PrepState): boolean {
  return state.hits >= state.needed;
}

function sweep(state: PrepState, dtMs: number): PrepState {
  let markerPos = state.markerPos + (state.markerDir * state.speed * dtMs) / 1000;
  let markerDir = state.markerDir;
  while (markerPos > 1 || markerPos < 0) {
    if (markerPos > 1) {
      markerPos = 2 - markerPos;
      markerDir = -1;
    } else {
      markerPos = -markerPos;
      markerDir = 1;
    }
  }
  return { ...state, markerPos, markerDir };
}

function tap(state: PrepState): PrepState {
  let [start, end] = state.zone;
  if (state.markerPos < start || state.markerPos > end) {
    return { ...state, lastTap: "slip" };
  }
  let roller = createRoller(state.rng);
  let zone = zoneAwayFrom(state.markerPos, end - start, roller);
  return { ...state, hits: state.hits + 1, lastTap: "hit", zone, rng: roller.state() };
}

export function prepReducer(state: PrepState, event: PrepEvent): PrepState {
  if (isPrepDone(state)) {
    return state;
  }
  switch (event.type) {
    case "tick":
      return sweep(state, event.dtMs);
    case "tap":
      return tap(state);
  }
}
