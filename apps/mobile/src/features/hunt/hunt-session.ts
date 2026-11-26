import {
  createHunt,
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
  | { kind: "shake"; px: number; startMs: number };

export type ShownPop = Pop & { startMs: number };

export type Juice = {
  nowMs: number;
  frozenUntilMs: number;
  bursts: Burst[];
  pop: ShownPop | null;
};

export type HuntSession = { hunt: HuntState; juice: Juice };

export type Stepped = { session: HuntSession; effects: HuntEffect[] };

const DISMISS: HuntEvent = { type: "dismiss" };

const LIFE_MS: Record<Burst["kind"], number> = {
  confetti: TUNING.juice.confettiMs,
  dirt: TUNING.juice.puffMs,
  dust: TUNING.juice.dustMs,
  stuck: TUNING.juice.stuckMs,
  shake: TUNING.juice.shakeMs,
};

export function createSession(config: HuntConfig): HuntSession {
  return {
    hunt: createHunt(config),
    juice: { nowMs: 0, frozenUntilMs: 0, bursts: [], pop: null },
  };
}

export function burstAge(juice: Juice, burst: Burst): number {
  return juice.nowMs - burst.startMs;
}

export function burstLife(burst: Burst): number {
  return LIFE_MS[burst.kind];
}

export function isFrozen(juice: Juice): boolean {
  return juice.nowMs < juice.frozenUntilMs;
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
    case "sound":
    case "haptic":
    case "record":
    case "hit-stop":
    case "pop":
      return null;
  }
}

function absorb(juice: Juice, effects: HuntEffect[]): Juice {
  let { nowMs } = juice;
  let frozenUntilMs = effects.some((effect) => effect.kind === "hit-stop")
    ? nowMs + TUNING.juice.hitStopMs
    : juice.frozenUntilMs;
  let afterFreezeMs = Math.max(nowMs, frozenUntilMs);
  let bursts = effects.flatMap((effect) => burstFor(effect, nowMs, afterFreezeMs) ?? []);
  let popped = effects.flatMap((effect) => (effect.kind === "pop" ? [effect.pop] : []));
  return {
    nowMs,
    frozenUntilMs,
    bursts: [...juice.bursts, ...bursts],
    pop: popped.length > 0 ? { ...popped[0], startMs: nowMs } : juice.pop,
  };
}

function apply(session: HuntSession, events: HuntEvent[]): Stepped {
  let hunt = session.hunt;
  let effects: HuntEffect[] = [];
  for (let event of events) {
    let next = huntReducer(hunt, event);
    effects.push(...huntEffects(hunt, next));
    hunt = next;
  }
  return { session: { hunt, juice: absorb(session.juice, effects) }, effects };
}

function then(first: Stepped, events: HuntEvent[]): Stepped {
  let second = apply(first.session, events);
  return { session: second.session, effects: [...first.effects, ...second.effects] };
}

export function isLingering(session: HuntSession): boolean {
  return session.hunt.phase.kind === "result";
}

function hasLingered(session: HuntSession): boolean {
  let pop = session.juice.pop;
  return (
    isLingering(session) &&
    pop !== null &&
    session.juice.nowMs - pop.startMs >= TUNING.juice.resultMs
  );
}

function settle(juice: Juice, dtMs: number): Juice {
  let nowMs = juice.nowMs + dtMs;
  return {
    ...juice,
    nowMs,
    bursts: juice.bursts.filter((burst) => nowMs - burst.startMs < burstLife(burst)),
  };
}

function frame(session: HuntSession, dtMs: number): Stepped {
  let juice = settle(session.juice, dtMs);
  if (isFrozen(juice)) {
    return { session: { ...session, juice }, effects: [] };
  }
  let ticked = apply({ ...session, juice }, [{ type: "tick", dtMs }]);
  return hasLingered(ticked.session) ? then(ticked, [DISMISS]) : ticked;
}

export function stepSession(session: HuntSession, event: HuntEvent): Stepped {
  if (event.type === "tick") {
    return frame(session, event.dtMs);
  }
  if (event.type === "draw-start" && isLingering(session)) {
    return apply(session, [DISMISS, event]);
  }
  return apply(session, [event]);
}
