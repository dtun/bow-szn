import {
  arrowAt,
  currentAim,
  HUNTER_POS,
  isGlinting,
  previewPath,
  SPOTS,
  WORLD_H,
  type Animal,
  type Arrow,
  type HuntPhase,
  type HuntState,
  type Terrain,
  type Vec2,
} from "@bow-szn/core";
import { HUNTER_FRAMES, SPRITES } from "@bow-szn/pixels";

import { animalPose, glintFrame, rackTip } from "./animal-art";
import type { ArtId } from "./hunt-art";
import { huntView, type HuntView, type Screen } from "./hunt-view";

export type SpriteMark = {
  kind: "sprite";
  key: string;
  id: ArtId;
  x: number;
  y: number;
  flip: boolean;
  tint: string | null;
  rotate: number;
};

export type RectMark = {
  kind: "rect";
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
};

export type Mark = SpriteMark | RectMark;

export type Scene = {
  view: HuntView;
  field: { terrain: Terrain; seed: number };
  ground: Mark[];
  air: Mark[];
  powerLabel: string | null;
  resultLabel: string | null;
  overLabel: string | null;
};

const SHADOW_COLOR = "rgba(11,15,26,0.28)";
const AIM_DOT_COLOR = "#f4efe1";
const RETICLE_COLOR = "#f7d44a";
const TRAIL_COLOR = "rgba(255,255,255,0.45)";

export const HUNTER_ANCHOR: Vec2 = { x: HUNTER_POS.x, y: WORLD_H - 2 };

const AIM_DOT_COUNT = 12;
const AIM_DOT_SIZE = 2;
const RETICLE_LENGTH = 9;
const TANGENT_STEP = 0.02;
const TRAIL_STEP = 0.03;
const TRAIL_DOTS = 3;

function sprite(key: string, id: ArtId, at: Vec2, flip = false, rotate = 0): SpriteMark {
  return {
    kind: "sprite",
    key,
    id,
    x: Math.round(at.x),
    y: Math.round(at.y),
    flip,
    tint: null,
    rotate,
  };
}

function rect(key: string, center: Vec2, width: number, height: number, color: string): RectMark {
  return {
    kind: "rect",
    key,
    x: Math.round(center.x - width / 2),
    y: Math.round(center.y - height / 2),
    width,
    height,
    color,
  };
}

function animalMarks(animal: Animal, elapsedMs: number): Mark[] {
  let pose = animalPose(animal, elapsedMs);
  if (pose === null) {
    return [];
  }
  let width = SPRITES[pose.id].w - 4;
  return [
    rect(`shadow-${animal.id}`, animal.pos, width, 2, SHADOW_COLOR),
    sprite(`animal-${animal.id}`, pose.id, animal.pos, animal.facing === -1, pose.rotate),
  ];
}

function glintMarks(animal: Animal, elapsedMs: number): Mark[] {
  let pose = animalPose(animal, elapsedMs);
  if (pose === null || !isGlinting(animal, elapsedMs)) {
    return [];
  }
  let frame = glintFrame(elapsedMs, animal);
  let tip = rackTip(animal, pose);
  return [sprite(`glint-${animal.id}`, frame, { x: tip.x, y: tip.y + SPRITES[frame].h / 2 })];
}

function byDepth(animals: Animal[]): Animal[] {
  return [...animals].sort((a, b) => a.pos.y - b.pos.y);
}

function hunterMark(phase: HuntPhase): Mark {
  let frame = phase.kind === "drawing" ? HUNTER_FRAMES.draw : HUNTER_FRAMES.idle;
  return sprite("hunter", frame, HUNTER_ANCHOR);
}

function drawingMarks(state: HuntState): Mark[] {
  let aim = currentAim(state);
  if (aim === null) {
    return [];
  }
  let dots = previewPath(aim, AIM_DOT_COUNT).map((point, index) =>
    rect(`aim-dot-${index}`, point, AIM_DOT_SIZE, AIM_DOT_SIZE, AIM_DOT_COLOR)
  );
  return [
    ...dots,
    rect("reticle-across", aim.target, RETICLE_LENGTH, 1, RETICLE_COLOR),
    rect("reticle-down", aim.target, 1, RETICLE_LENGTH, RETICLE_COLOR),
  ];
}

function airborneAt(arrow: Arrow, progress: number): Vec2 {
  let { ground, height } = arrowAt({ ...arrow, elapsedMs: arrow.durationMs * progress });
  return { x: ground.x, y: ground.y - height };
}

function flightMarks(arrow: Arrow): Mark[] {
  let progress = Math.min(1, arrow.elapsedMs / arrow.durationMs);
  let { ground } = arrowAt(arrow);
  let from = airborneAt(arrow, Math.max(0, progress - TANGENT_STEP));
  let to = airborneAt(arrow, Math.min(1, progress + TANGENT_STEP));
  let heading = Math.atan2(to.x - from.x, from.y - to.y);
  let trail = Array.from({ length: TRAIL_DOTS }, (_, index) =>
    rect(
      `arrow-trail-${index}`,
      airborneAt(arrow, Math.max(0, progress - (index + 1) * TRAIL_STEP)),
      1,
      1,
      TRAIL_COLOR
    )
  );
  return [
    rect("arrow-shadow", ground, 3, 1, SHADOW_COLOR),
    ...trail,
    sprite("arrow", "arrow", airborneAt(arrow, progress), false, heading),
  ];
}

function phaseMarks(state: HuntState): Mark[] {
  switch (state.phase.kind) {
    case "drawing":
      return drawingMarks(state);
    case "flight":
      return flightMarks(state.phase.arrow);
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

export function sceneFor(state: HuntState, screen: Screen): Scene {
  let animals = byDepth(state.animals);
  return {
    view: huntView(screen),
    field: { terrain: SPOTS[state.config.spot].terrain, seed: state.config.seed },
    ground: animals.flatMap((animal) => animalMarks(animal, state.elapsedMs)),
    air: [
      ...animals.flatMap((animal) => glintMarks(animal, state.elapsedMs)),
      hunterMark(state.phase),
      ...phaseMarks(state),
    ],
    powerLabel: powerLabel(state),
    resultLabel: resultLabel(state.phase),
    overLabel: overLabel(state.phase),
  };
}
