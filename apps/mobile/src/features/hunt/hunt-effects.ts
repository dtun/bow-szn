import {
  canMount,
  currentAim,
  isFullDraw,
  isGlinting,
  TUNING,
  type Animal,
  type AnimalMode,
  type Harvest,
  type HuntState,
  type SpeciesId,
  type Vec2,
} from "@bow-szn/core";

import type { SfxId } from "@/platform/sfx";

import { headingAt } from "./arrow-path";
import { tagName } from "./hunt-over";
import { powerSegments } from "./draw-gauge";

export type HuntSound = Extract<
  SfxId,
  | "creak"
  | "full-draw"
  | "twang"
  | "whoosh"
  | "thunk"
  | "hit"
  | "spook"
  | "glint"
  | "whiff"
  | "fanfare"
>;

export type HuntHaptic = "tick" | "release" | "harvest";

export type PopTone = "buck" | "snack" | "near" | "miss";

export type Pop = { text: string; at: Vec2; tone: PopTone; animalId: number | null };

export type HuntEffect =
  | { kind: "sound"; sound: HuntSound }
  | { kind: "haptic"; haptic: HuntHaptic }
  | { kind: "record"; harvest: Harvest }
  | { kind: "hit-stop" }
  | { kind: "shake"; px: number }
  | { kind: "confetti"; at: Vec2; count: number }
  | { kind: "dirt"; at: Vec2 }
  | { kind: "dust"; at: Vec2 }
  | { kind: "stuck"; at: Vec2; heading: number }
  | { kind: "pop"; pop: Pop };

const PLAIN_MISSES = ["WHIFF!", "DIRT NAP!"];
const SPOTTED_BY: Record<SpeciesId, string> = {
  whitetail: "DEER",
  elk: "ELK",
  turkey: "TURKEY",
  rabbit: "RABBIT",
};

function sound(id: HuntSound): HuntEffect {
  return { kind: "sound", sound: id };
}

function haptic(id: HuntHaptic): HuntEffect {
  return { kind: "haptic", haptic: id };
}

function power(state: HuntState): number {
  return currentAim(state)?.power ?? 0;
}

function drawEffects(prev: HuntState, next: HuntState): HuntEffect[] {
  let was = prev.phase;
  let now = next.phase;
  if (was.kind !== "drawing") {
    return now.kind === "drawing" ? [sound("creak")] : [];
  }
  if (now.kind === "flight") {
    return [sound("twang"), sound("whoosh"), haptic("release")];
  }
  if (now.kind !== "drawing") {
    return [];
  }
  let effects: HuntEffect[] = [];
  if (powerSegments(power(next)) > powerSegments(power(prev))) {
    effects.push(sound("creak"), haptic("tick"));
  }
  if (!isFullDraw(was.pull) && isFullDraw(now.pull)) {
    effects.push(sound("full-draw"));
  }
  return effects;
}

function modeOf(state: HuntState, id: number): AnimalMode["kind"] | null {
  return state.animals.find((animal) => animal.id === id)?.mode.kind ?? null;
}

function turned(prev: HuntState, next: HuntState, kind: AnimalMode["kind"]): Animal[] {
  return next.animals.filter(
    (animal) => animal.mode.kind === kind && modeOf(prev, animal.id) !== kind
  );
}

function harvestPop(harvest: Harvest): string {
  return canMount(harvest) ? `${tagName(harvest)}!!` : `${tagName(harvest)}!`;
}

function harvestEffects(
  prev: HuntState,
  next: HuntState,
  harvest: Harvest,
  landing: Vec2
): HuntEffect[] {
  let felled = turned(prev, next, "down")[0] ?? null;
  let at = felled?.pos ?? landing;
  let juice = TUNING.juice;
  let buck = canMount(harvest);
  let pop: Pop = {
    text: harvestPop(harvest),
    at,
    tone: buck ? "buck" : "snack",
    animalId: felled?.id ?? null,
  };
  return [
    sound("hit"),
    ...(buck ? [sound("fanfare"), { kind: "hit-stop" } as const] : []),
    haptic("harvest"),
    { kind: "record", harvest },
    { kind: "shake", px: buck ? juice.shakePx : juice.snackShakePx },
    { kind: "confetti", at, count: buck ? juice.confettiBuck : juice.confettiSnack },
    { kind: "pop", pop },
  ];
}

function missLine(near: boolean, spotters: Animal[], arrowsLeft: number): string {
  if (near) {
    return "SO CLOSE!";
  }
  if (spotters.length > 0) {
    return `THAT ${SPOTTED_BY[spotters[0].species]} SAW YOU.`;
  }
  return PLAIN_MISSES[arrowsLeft % PLAIN_MISSES.length];
}

function landingEffects(prev: HuntState, next: HuntState): HuntEffect[] {
  if (prev.phase.kind !== "flight" || next.phase.kind !== "result") {
    return [];
  }
  let outcome = next.phase.outcome;
  let arrow = prev.phase.arrow;
  if (outcome.kind === "harvest") {
    return harvestEffects(prev, next, outcome.harvest, arrow.to);
  }
  let text = missLine(outcome.near, turned(prev, next, "flee"), next.arrows);
  return [
    sound("thunk"),
    sound("whiff"),
    { kind: "dirt", at: arrow.to },
    { kind: "stuck", at: arrow.to, heading: headingAt(arrow, 1) },
    {
      kind: "pop",
      pop: { text, at: arrow.to, tone: outcome.near ? "near" : "miss", animalId: null },
    },
  ];
}

function animalEffects(prev: HuntState, next: HuntState): HuntEffect[] {
  let bolted = turned(prev, next, "flee");
  let startled = [...bolted, ...turned(prev, next, "alert")];
  let glinted = next.animals.some((animal) => {
    let before = prev.animals.find((each) => each.id === animal.id);
    return (
      isGlinting(animal, next.elapsedMs) &&
      (before === undefined || !isGlinting(before, prev.elapsedMs))
    );
  });
  return [
    ...(startled.length > 0 ? [sound("spook")] : []),
    ...bolted.map((animal): HuntEffect => ({ kind: "dust", at: animal.pos })),
    ...(glinted ? [sound("glint")] : []),
  ];
}

export function huntEffects(prev: HuntState, next: HuntState): HuntEffect[] {
  if (prev === next) {
    return [];
  }
  return [...drawEffects(prev, next), ...landingEffects(prev, next), ...animalEffects(prev, next)];
}
