import {
  arrowAt,
  currentAim,
  HUNTER_POS,
  previewPath,
  SPECIES,
  WORLD_H,
  WORLD_W,
  type Animal,
  type HuntPhase,
  type HuntState,
  type Vec2,
} from "@bow-szn/core";

export type SceneRect = {
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
};

export type Scene = {
  rects: SceneRect[];
  powerLabel: string | null;
  resultLabel: string | null;
  overLabel: string | null;
};

const FIELD_COLOR = "#2d6b24";
const HUNTER_COLOR = "#f08a4b";
const LIVE_ANIMAL_COLOR = "#8fe05a";
const DOWN_ANIMAL_COLOR = "#8a8f98";
const AIM_DOT_COLOR = "#f4efe1";
const RETICLE_COLOR = "#f7d44a";
const ARROW_COLOR = "#f4efe1";
const SHADOW_COLOR = "#1a3a14";

const HUNTER_SIZE = 10;
const AIM_DOT_COUNT = 12;
const AIM_DOT_SIZE = 2;
const RETICLE_LENGTH = 9;
const ARROW_WIDTH = 2;
const ARROW_LENGTH = 8;
const SHADOW_WIDTH = 6;
const SHADOW_HEIGHT = 2;

function centered(
  key: string,
  center: Vec2,
  width: number,
  height: number,
  color: string
): SceneRect {
  return {
    key,
    x: Math.round(center.x - width / 2),
    y: Math.round(center.y - height / 2),
    width,
    height,
    color,
  };
}

function animalRect(animal: Animal): SceneRect {
  let size = SPECIES[animal.species].hitRadius * 2;
  let color = animal.mode.kind === "down" ? DOWN_ANIMAL_COLOR : LIVE_ANIMAL_COLOR;
  return centered(`animal-${animal.id}`, animal.pos, size, size, color);
}

function animalRects(animals: Animal[]): SceneRect[] {
  return animals.filter((animal) => animal.mode.kind !== "gone").map(animalRect);
}

function drawingRects(state: HuntState): SceneRect[] {
  let aim = currentAim(state);
  if (aim === null) {
    return [];
  }
  let dots = previewPath(aim, AIM_DOT_COUNT).map((point, index) =>
    centered(`aim-dot-${index}`, point, AIM_DOT_SIZE, AIM_DOT_SIZE, AIM_DOT_COLOR)
  );
  return [
    ...dots,
    centered("reticle-across", aim.target, RETICLE_LENGTH, 1, RETICLE_COLOR),
    centered("reticle-down", aim.target, 1, RETICLE_LENGTH, RETICLE_COLOR),
  ];
}

function flightRects(phase: Extract<HuntPhase, { kind: "flight" }>): SceneRect[] {
  let { ground, height } = arrowAt(phase.arrow);
  let airborne = { x: ground.x, y: ground.y - height };
  return [
    centered("arrow-shadow", ground, SHADOW_WIDTH, SHADOW_HEIGHT, SHADOW_COLOR),
    centered("arrow", airborne, ARROW_WIDTH, ARROW_LENGTH, ARROW_COLOR),
  ];
}

function phaseRects(state: HuntState): SceneRect[] {
  switch (state.phase.kind) {
    case "drawing":
      return drawingRects(state);
    case "flight":
      return flightRects(state.phase);
    case "ready":
    case "result":
    case "over":
      return [];
  }
}

function powerLabel(state: HuntState): string | null {
  let aim = currentAim(state);
  return aim === null ? null : `POWER ${Math.round(aim.power * 100)}%`;
}

function resultLabel(phase: HuntPhase): string | null {
  if (phase.kind !== "result") {
    return null;
  }
  return phase.outcome.kind === "harvest" ? "HIT!" : "MISS";
}

function overLabel(phase: HuntPhase): string | null {
  if (phase.kind !== "over") {
    return null;
  }
  return phase.reason === "dusk" ? "DUSK" : "OUT OF ARROWS";
}

export function sceneFor(state: HuntState): Scene {
  return {
    rects: [
      { key: "field", x: 0, y: 0, width: WORLD_W, height: WORLD_H, color: FIELD_COLOR },
      centered("hunter", HUNTER_POS, HUNTER_SIZE, HUNTER_SIZE, HUNTER_COLOR),
      ...animalRects(state.animals),
      ...phaseRects(state),
    ],
    powerLabel: powerLabel(state),
    resultLabel: resultLabel(state.phase),
    overLabel: overLabel(state.phase),
  };
}
