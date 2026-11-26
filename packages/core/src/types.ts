export const WORLD_W = 180;
export const WORLD_H = 320;
export const HUNTER_POS: Vec2 = { x: 90, y: 290 };

export type Vec2 = { x: number; y: number };

export type SpeciesId = "whitetail" | "turkey" | "rabbit" | "elk";
export type SeasonId = "early" | "rut" | "late";
export type Difficulty = "easy" | "medium" | "hard";
export type Terrain = "hardwoods" | "meadow" | "marsh" | "ridge";
export type SpotId = "cedar-hollow" | "miller-bottoms" | "high-ridge" | "cattail-marsh";

export type Species = {
  id: SpeciesId;
  name: string;
  hitRadius: number;
  speed: number;
  spookRadius: number;
  weightLb: readonly [min: number, max: number];
  maxPoints: number;
  seasons: readonly SeasonId[];
  rarity: number;
};

export type Spot = {
  id: SpotId;
  name: string;
  blurb: string;
  difficulty: Difficulty;
  terrain: Terrain;
  species: readonly SpeciesId[];
  mapPos: Vec2;
};

export type Wind = { dir: -1 | 1; strength: number };

export type AnimalMode =
  | { kind: "graze"; untilMs: number }
  | { kind: "walk"; target: Vec2 }
  | { kind: "alert"; untilMs: number }
  | { kind: "flee"; dir: Vec2 }
  | { kind: "gone" }
  | { kind: "down" };

export type Animal = {
  id: number;
  species: SpeciesId;
  pos: Vec2;
  facing: -1 | 1;
  mode: AnimalMode;
};

export type Aim = {
  dir: Vec2;
  power: number;
  target: Vec2;
  sway: Vec2;
};

export type Arrow = {
  from: Vec2;
  to: Vec2;
  durationMs: number;
  elapsedMs: number;
  peakHeight: number;
};

export type Harvest = {
  id: string;
  species: SpeciesId;
  weightLb: number;
  points: number;
  spot: SpotId;
  season: SeasonId;
  clockMin: number;
  shotYards: number;
};

export type ShotOutcome = { kind: "harvest"; harvest: Harvest } | { kind: "miss"; near: boolean };

export type HuntPhase =
  | { kind: "ready" }
  | { kind: "drawing"; pull: Vec2; heldMs: number }
  | { kind: "flight"; arrow: Arrow }
  | { kind: "result"; outcome: ShotOutcome }
  | { kind: "over"; reason: "dusk" | "quiver-empty" };

export type HuntConfig = {
  spot: SpotId;
  season: SeasonId;
  difficulty: Difficulty;
  seed: number;
};

export type HuntState = {
  config: HuntConfig;
  rng: number;
  elapsedMs: number;
  clockMin: number;
  arrows: number;
  wind: Wind;
  animals: Animal[];
  nextAnimalId: number;
  spawnInMs: number;
  phase: HuntPhase;
  harvests: Harvest[];
};

export type HuntEvent =
  | { type: "tick"; dtMs: number }
  | { type: "draw-start" }
  | { type: "draw-move"; pull: Vec2 }
  | { type: "release" }
  | { type: "cancel" }
  | { type: "dismiss" };

export type PrepState = {
  markerPos: number;
  markerDir: -1 | 1;
  speed: number;
  zone: readonly [start: number, end: number];
  hits: number;
  needed: number;
  lastTap: "none" | "hit" | "slip";
  rng: number;
};

export type PrepEvent = { type: "tick"; dtMs: number } | { type: "tap" };

export type Journal = { harvests: Harvest[] };
