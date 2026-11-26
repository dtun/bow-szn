import {
  createHunt,
  huntReducer,
  HUNTER_POS,
  TUNING,
  type Animal,
  type HuntConfig,
  type HuntEvent,
  type HuntState,
  type Vec2,
} from "../index";

export const CONFIG: HuntConfig = {
  spot: "miller-bottoms",
  season: "early",
  difficulty: "medium",
  seed: 42,
};

export const LONG_MS = 10 * 60 * 1000;

export const DOE: Animal = {
  id: 1,
  species: "whitetail",
  antlers: { kind: "none" },
  pos: { x: 90, y: 180 },
  facing: 1,
  mode: { kind: "graze", untilMs: LONG_MS },
};

export function huntWith(animals: Animal[], config: HuntConfig = CONFIG): HuntState {
  return {
    ...createHunt(config),
    wind: { dir: 1, strength: 0 },
    animals,
    nextAnimalId: 100,
    spawnInMs: LONG_MS,
  };
}

export function play(state: HuntState, events: HuntEvent[]): HuntState {
  return events.reduce(huntReducer, state);
}

export function pullToward(point: Vec2): Vec2 {
  let pxPerRangePx = TUNING.aim.maxPullPx / 140;
  return {
    x: (HUNTER_POS.x - point.x) * pxPerRangePx,
    y: (HUNTER_POS.y - point.y) * pxPerRangePx,
  };
}

export function shootAt(point: Vec2): HuntEvent[] {
  return [
    { type: "draw-start" },
    { type: "draw-move", pull: pullToward(point) },
    { type: "release" },
    { type: "tick", dtMs: 2000 },
  ];
}
