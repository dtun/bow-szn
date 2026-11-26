import {
  arrowAt,
  currentAim,
  HUNTER_POS,
  isGlinting,
  SPOTS,
  timeScale,
  TUNING,
  WORLD_H,
  type Animal,
  type Arrow,
  type HuntState,
  type Terrain,
  type Vec2,
} from "@bow-szn/core";
import { HUNTER_FRAMES, SPRITES } from "@bow-szn/pixels";

import { aimMarks } from "./aim-marks";
import { animalPose, glintFrame, rackTip } from "./animal-art";
import { airborneAt, headingAt } from "./arrow-path";
import { bowMarks } from "./bow-marks";
import { drawGauge, type DrawGauge } from "./draw-gauge";
import { hudFor, type Hud } from "./hud";
import { burstAge, isFrozen, type Juice } from "./hunt-session";
import { huntView, type Bounds, type HuntView, type Screen } from "./hunt-view";
import { burstMarks, popLabel, shakeOffset } from "./juice-marks";
import { resultFor, type ResultView } from "./result-view";
import { sunArc } from "./sun-arc";
import {
  centeredRect,
  INK,
  label,
  rect,
  sprite,
  YELLOW,
  type Label,
  type Mark,
} from "./scene-marks";

export type { Label, Mark, OvalMark, RectMark, SpriteMark } from "./scene-marks";

export type Scene = {
  view: HuntView;
  shake: Vec2;
  field: { terrain: Terrain; seed: number };
  ground: Mark[];
  sky: Mark[];
  air: Mark[];
  labels: Label[];
  hud: Hud;
  draw: DrawGauge | null;
  result: ResultView;
};

const SHADOW_COLOR = "rgba(11,15,26,0.28)";
const TRAIL_COLOR = "rgba(255,255,255,0.45)";

export const HUNTER_ANCHOR: Vec2 = { x: HUNTER_POS.x, y: WORLD_H - 2 };

const TRAIL_STEP = 0.03;
const TRAIL_DOTS = 3;
const FELLED_FLASH_MS = 520;
const FELLED_BLINK_MS = 70;
const WHITE = "#ffffff";
const DUST_COLORS = ["#c9a36b", "#9c7a45"];
const DUST_STEP_MS = 70;
const SLOW_MO_DIM = "rgba(8,12,40,0.3)";
const FLASH = "rgba(255,255,255,0.6)";
const BRACKET_REACH = 11;
const LINE_HEIGHT = 1.2;
const CALLOUT_SIZE = 8;
const CALLOUT_LIFT = 4;
const CALLOUT_RISE_MAX = 6;
const OVERLAY_MARGIN = 8;

function labelBox(label: Label): Bounds {
  let width = label.text.length * label.size;
  let left =
    label.align === "center"
      ? label.x - width / 2
      : label.align === "right"
        ? label.x - width
        : label.x;
  return { left, top: label.y, right: left + width, bottom: label.y + label.size * LINE_HEIGHT };
}

function overlaps(a: Bounds, b: Bounds): boolean {
  return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
}

export function oneAtATime(labels: Label[]): Label[] {
  let shown: Label[] = [];
  for (let each of labels) {
    if (!shown.some((kept) => overlaps(labelBox(kept), labelBox(each)))) {
      shown.push(each);
    }
  }
  return shown;
}

function felledFlash(animal: Animal, juice: Juice): string | null {
  let pop = juice.pop;
  if (pop === null || pop.animalId !== animal.id) {
    return null;
  }
  let age = juice.nowMs - pop.startMs;
  return age < FELLED_FLASH_MS && Math.floor(age / FELLED_BLINK_MS) % 2 === 0 ? WHITE : null;
}

function dustTrail(animal: Animal, elapsedMs: number): Mark[] {
  if (animal.mode.kind !== "flee") {
    return [];
  }
  let step = Math.floor(elapsedMs / DUST_STEP_MS);
  return [0, 1, 2].map((index) => {
    let behind = 6 + ((index * 3 + step) % 9);
    let at = { x: animal.pos.x - animal.facing * behind, y: animal.pos.y - ((step + index) % 3) };
    return centeredRect(`dust-trail-${animal.id}-${index}`, at, 1, 1, DUST_COLORS[index % 2]);
  });
}

function animalMarks(animal: Animal, elapsedMs: number, juice: Juice): Mark[] {
  let pose = animalPose(animal, elapsedMs);
  if (pose === null) {
    return [];
  }
  let width = SPRITES[pose.id].w - 4;
  return [
    centeredRect(`shadow-${animal.id}`, animal.pos, width, 2, SHADOW_COLOR),
    ...dustTrail(animal, elapsedMs),
    sprite(`animal-${animal.id}`, pose.id, animal.pos, {
      flip: animal.facing === -1,
      rotate: pose.rotate,
      tint: felledFlash(animal, juice),
      outline: INK,
    }),
  ];
}

function alertLabels(animals: Animal[], elapsedMs: number): Label[] {
  return animals.flatMap((animal) => {
    let pose = animalPose(animal, elapsedMs);
    if (pose === null || animal.mode.kind !== "alert") {
      return [];
    }
    let top = animal.pos.y - SPRITES[pose.id].h - 8;
    return [label(`alert-${animal.id}`, "!", { x: animal.pos.x, y: top }, 6, YELLOW, "center")];
  });
}

function calloutLabels(animals: Animal[], juice: Juice, elapsedMs: number): Label[] {
  return juice.bursts.flatMap((burst) => {
    let animal = animals.find((each) => burst.kind === "callout" && each.id === burst.animalId);
    let pose = animal === undefined ? null : animalPose(animal, elapsedMs);
    let age = burstAge(juice, burst);
    if (burst.kind !== "callout" || animal === undefined || pose === null || age < 0) {
      return [];
    }
    let rise = Math.min(CALLOUT_RISE_MAX, (TUNING.juice.popRisePxPerSec * age) / 1000);
    let top = animal.pos.y - SPRITES[pose.id].h - CALLOUT_LIFT - CALLOUT_SIZE - rise;
    return [
      label(
        `callout-${animal.id}`,
        burst.text,
        { x: animal.pos.x, y: top },
        CALLOUT_SIZE,
        YELLOW,
        "center"
      ),
    ];
  });
}

function overlay(key: string, bounds: Bounds, color: string): Mark {
  return rect(
    key,
    bounds.left - OVERLAY_MARGIN,
    bounds.top - OVERLAY_MARGIN,
    bounds.right - bounds.left + OVERLAY_MARGIN * 2,
    bounds.bottom - bounds.top + OVERLAY_MARGIN * 2,
    color
  );
}

function slowMoMarks(state: HuntState, bounds: Bounds): Mark[] {
  if (state.phase.kind !== "flight" || timeScale(state) === 1) {
    return [];
  }
  let target = state.phase.arrow.to;
  let corners = [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ];
  let brackets = corners.flatMap(([sx, sy], index) => {
    let x = Math.round(target.x + sx * BRACKET_REACH);
    let y = Math.round(target.y + sy * BRACKET_REACH);
    return [
      rect(`bracket-across-${index}`, sx > 0 ? x - 2 : x, y, 3, 1, YELLOW),
      rect(`bracket-down-${index}`, x, sy > 0 ? y - 2 : y, 1, 3, YELLOW),
    ];
  });
  return [overlay("slow-mo", bounds, SLOW_MO_DIM), ...brackets];
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

function hunterMarks(state: HuntState): Mark[] {
  let hunter = sprite("hunter", HUNTER_FRAMES.idle, HUNTER_ANCHOR);
  return state.phase.kind === "drawing" ? [hunter, ...bowMarks(currentAim(state))] : [hunter];
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

export function sceneFor(state: HuntState, juice: Juice, screen: Screen): Scene {
  let view = huntView(screen);
  let animals = byDepth(state.animals);
  let aim = aimMarks(state);
  let flight = state.phase.kind === "flight" ? flightMarks(state.phase.arrow) : [];
  let bursts = burstMarks(juice);
  let confetti = bursts.filter((mark) => mark.key.startsWith("confetti-"));
  let result = resultFor(state, juice);
  let pop = result.kind === "card" ? null : popLabel(state, juice);
  let sun = sunArc(state.clockMin, view);
  let draw = drawGauge(state);
  let hud = hudFor(state, view);
  return {
    view,
    shake: shakeOffset(juice),
    field: { terrain: SPOTS[state.config.spot].terrain, seed: state.config.seed },
    ground: [
      ...(aim?.ground ?? []),
      ...bursts.filter((mark) => !mark.key.startsWith("confetti-")),
      ...animals.flatMap((animal) => animalMarks(animal, state.elapsedMs, juice)),
    ],
    sky: sun.marks,
    air: [
      ...animals.flatMap((animal) => glintMarks(animal, state.elapsedMs)),
      ...(draw?.marks ?? []),
      ...hunterMarks(state),
      ...(aim?.sight ?? []),
      ...slowMoMarks(state, view.bounds),
      ...flight,
      ...confetti,
      ...(isFrozen(juice) ? [overlay("flash", view.bounds, FLASH)] : []),
    ],
    labels: oneAtATime([
      ...(pop === null ? [] : [pop]),
      ...calloutLabels(animals, juice, state.elapsedMs),
      ...(aim?.labels ?? []),
      ...alertLabels(animals, state.elapsedMs),
    ]),
    hud: { ...hud, labels: [...hud.labels, ...sun.labels] },
    draw,
    result,
  };
}
