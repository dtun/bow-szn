import {
  arrowAt,
  HUNTER_POS,
  isGlinting,
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

import { aimMarks } from "./aim-marks";
import { animalPose, glintFrame, rackTip } from "./animal-art";
import { airborneAt, headingAt } from "./arrow-path";
import { hudFor, type Hud } from "./hud";
import { huntView, type HuntView, type Screen } from "./hunt-view";
import { powerFor, type PowerMeter } from "./power-meter";
import { centeredRect, sprite, type Label, type Mark } from "./scene-marks";

export type { Label, Mark, OvalMark, RectMark, SpriteMark } from "./scene-marks";

export type Scene = {
  view: HuntView;
  field: { terrain: Terrain; seed: number };
  ground: Mark[];
  air: Mark[];
  labels: Label[];
  hud: Hud;
  power: PowerMeter | null;
  resultLabel: string | null;
};

const SHADOW_COLOR = "rgba(11,15,26,0.28)";
const TRAIL_COLOR = "rgba(255,255,255,0.45)";

export const HUNTER_ANCHOR: Vec2 = { x: HUNTER_POS.x, y: WORLD_H - 2 };

const TRAIL_STEP = 0.03;
const TRAIL_DOTS = 3;

function animalMarks(animal: Animal, elapsedMs: number): Mark[] {
  let pose = animalPose(animal, elapsedMs);
  if (pose === null) {
    return [];
  }
  let width = SPRITES[pose.id].w - 4;
  return [
    centeredRect(`shadow-${animal.id}`, animal.pos, width, 2, SHADOW_COLOR),
    sprite(`animal-${animal.id}`, pose.id, animal.pos, {
      flip: animal.facing === -1,
      rotate: pose.rotate,
    }),
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

function flightMarks(arrow: Arrow): Mark[] {
  let progress = Math.min(1, arrow.elapsedMs / arrow.durationMs);
  let { ground } = arrowAt(arrow);
  let heading = headingAt(arrow, progress);
  let trail = Array.from({ length: TRAIL_DOTS }, (_, index) =>
    centeredRect(
      `arrow-trail-${index}`,
      airborneAt(arrow, Math.max(0, progress - (index + 1) * TRAIL_STEP)),
      1,
      1,
      TRAIL_COLOR
    )
  );
  return [
    centeredRect("arrow-shadow", ground, 3, 1, SHADOW_COLOR),
    ...trail,
    sprite("arrow", "arrow", airborneAt(arrow, progress), { rotate: heading }),
  ];
}

function resultLabel(phase: HuntPhase): string | null {
  if (phase.kind !== "result") {
    return null;
  }
  return phase.outcome.kind === "harvest" ? "HIT!" : "MISS";
}

export function sceneFor(state: HuntState, screen: Screen): Scene {
  let view = huntView(screen);
  let animals = byDepth(state.animals);
  let aim = aimMarks(state);
  let flight = state.phase.kind === "flight" ? flightMarks(state.phase.arrow) : [];
  return {
    view,
    field: { terrain: SPOTS[state.config.spot].terrain, seed: state.config.seed },
    ground: [
      ...(aim?.zone ?? []),
      ...animals.flatMap((animal) => animalMarks(animal, state.elapsedMs)),
    ],
    air: [
      ...animals.flatMap((animal) => glintMarks(animal, state.elapsedMs)),
      hunterMark(state.phase),
      ...(aim?.sight ?? []),
      ...flight,
    ],
    labels: aim?.labels ?? [],
    hud: hudFor(state, view),
    power: powerFor(state, view),
    resultLabel: resultLabel(state.phase),
  };
}
