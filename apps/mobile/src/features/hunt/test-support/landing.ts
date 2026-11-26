import {
  createHunt,
  HUNTER_POS,
  huntReducer,
  type Animal,
  type HuntPhase,
  type HuntState,
  type Vec2,
} from "@bow-szn/core";

export const DOE: Animal = {
  id: 7,
  species: "whitetail",
  antlers: { kind: "none" },
  pos: { x: 90, y: 200 },
  facing: 1,
  mode: { kind: "graze", untilMs: 60_000 },
};

export const BUCK: Animal = { ...DOE, antlers: { kind: "rack", points: 10 } };

export const EMPTY_GROUND: Vec2 = { x: 40, y: 150 };

export function huntWith(animals: Animal[], phase: HuntPhase = { kind: "ready" }): HuntState {
  let opening = createHunt({ spot: "cedar-hollow", season: "early", difficulty: "easy", seed: 1 });
  return { ...opening, wind: { dir: 1, strength: 0 }, animals, phase, spawnInMs: 1e9 };
}

export function aboutToLand(animals: Animal[], to: Vec2): HuntState {
  return huntWith(animals, {
    kind: "flight",
    arrow: { from: HUNTER_POS, to, durationMs: 400, elapsedMs: 399, peakHeight: 10 },
  });
}

export function landed(prev: HuntState): HuntState {
  return huntReducer(prev, { type: "tick", dtMs: 20 });
}
