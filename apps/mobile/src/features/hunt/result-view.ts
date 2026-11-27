import { holdsTheCard, TUNING, type HuntState } from "@bow-szn/core";

import { harvestCardFor, type HarvestCard } from "./harvest-card";
import type { Juice } from "./hunt-session";

export type ResultView =
  | { kind: "none" }
  | { kind: "banner"; card: HarvestCard }
  | { kind: "card"; card: HarvestCard; dropPx: number };

const CARD_DROP_PX = 180;
const OVERSHOOT = 1.70158;

function easeOutBack(progress: number): number {
  let back = progress - 1;
  return 1 + (OVERSHOOT + 1) * back ** 3 + OVERSHOOT * back ** 2;
}

export function cardShown(hunt: HuntState, juice: Juice): boolean {
  let age = juice.pop === null ? Infinity : juice.nowMs - juice.pop.startMs;
  return holdsTheCard(hunt) && age >= TUNING.juice.cardDelayMs;
}

export function resultFor(hunt: HuntState, juice: Juice): ResultView {
  if (hunt.phase.kind !== "result" || hunt.phase.outcome.kind !== "harvest") {
    return { kind: "none" };
  }
  let card = harvestCardFor(hunt.phase.outcome.harvest);
  if (!holdsTheCard(hunt)) {
    return { kind: "banner", card };
  }
  if (!cardShown(hunt, juice)) {
    return { kind: "none" };
  }
  let age = juice.pop === null ? Infinity : juice.nowMs - juice.pop.startMs;
  let progress = Math.min(1, (age - TUNING.juice.cardDelayMs) / TUNING.juice.cardSlamMs);
  return { kind: "card", card, dropPx: Math.round((easeOutBack(progress) - 1) * CARD_DROP_PX) };
}
