import {
  createHunt,
  hitStopLeftMs,
  huntReducer,
  TUNING,
  type HuntConfig,
  type HuntEvent,
  type HuntState,
  type Vec2,
} from "@bow-szn/core";

import { huntEffects, type HuntEffect, type Pop } from "./hunt-effects";

export type Burst =
  | { kind: "confetti"; at: Vec2; count: number; seed: number; startMs: number }
  | { kind: "dirt"; at: Vec2; startMs: number }
  | { kind: "dust"; at: Vec2; startMs: number }
  | { kind: "stuck"; at: Vec2; heading: number; startMs: number }
  | { kind: "shake"; px: number; startMs: number }
  | { kind: "callout"; animalId: number; text: string; startMs: number };

export type ShownPop = Pop & { startMs: number };

export type Juice = {
  nowMs: number;
  bursts: Burst[];
  pop: ShownPop | null;
};

export type HuntSession = { hunt: HuntState; juice: Juice };

export type Stepped = { session: HuntSession; effects: HuntEffect[] };

const LIFE_MS: Record<Burst["kind"], number> = {
  confetti: TUNING.juice.confettiMs,
  dirt: TUNING.juice.puffMs,
  dust: TUNING.juice.dustMs,
  stuck: TUNING.juice.stuckMs,
  shake: TUNING.juice.shakeMs,
  callout: TUNING.hud.calloutMs,
};

export function createSession(config: HuntConfig): HuntSession {
  return {
    hunt: createHunt(config),
    juice: { nowMs: 0, bursts: [], pop: null },
  };
}

export function burstAge(juice: Juice, burst: Burst): number {
  return juice.nowMs - burst.startMs;
}

export function burstLife(burst: Burst): number {
  return LIFE_MS[burst.kind];
}

function burstFor(effect: HuntEffect, nowMs: number, afterFreezeMs: number): Burst | null {
  switch (effect.kind) {
    case "confetti":
      return {
        kind: "confetti",
        at: effect.at,
        count: effect.count,
        seed: Math.round(nowMs) * 31 + effect.count,
        startMs: afterFreezeMs,
      };
    case "shake":
      return { kind: "shake", px: effect.px, startMs: afterFreezeMs };
    case "dirt":
    case "dust":
      return { kind: effect.kind, at: effect.at, startMs: nowMs };
    case "stuck":
      return { kind: "stuck", at: effect.at, heading: effect.heading, startMs: nowMs };
    case "callout":
      return { kind: "callout", animalId: effect.animalId, text: effect.text, startMs: nowMs };
    case "sound":
    case "haptic":
    case "record":
    case "pop":
      return null;
  }
}

function absorb(juice: Juice, effects: HuntEffect[], hunt: HuntState): Juice {
  let { nowMs } = juice;
  let afterFreezeMs = nowMs + hitStopLeftMs(hunt);
  let bursts = effects.flatMap((effect) => burstFor(effect, nowMs, afterFreezeMs) ?? []);
  let popped = effects.flatMap((effect) => (effect.kind === "pop" ? [effect.pop] : []));
  return {
    nowMs,
    bursts: [...juice.bursts, ...bursts],
    pop: popped.length > 0 ? { ...popped[0], startMs: nowMs } : juice.pop,
  };
}

function apply(session: HuntSession, event: HuntEvent): Stepped {
  let hunt = huntReducer(session.hunt, event);
  let effects = huntEffects(session.hunt, hunt);
  return { session: { hunt, juice: absorb(session.juice, effects, hunt) }, effects };
}

function settle(juice: Juice, dtMs: number): Juice {
  let nowMs = juice.nowMs + dtMs;
  return {
    ...juice,
    nowMs,
    bursts: juice.bursts.filter((burst) => nowMs - burst.startMs < burstLife(burst)),
  };
}

export function stepSession(session: HuntSession, event: HuntEvent): Stepped {
  if (event.type === "tick") {
    return apply({ ...session, juice: settle(session.juice, event.dtMs) }, event);
  }
  return apply(session, event);
}
