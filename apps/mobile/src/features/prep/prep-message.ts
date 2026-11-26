import { isPrepDone, type PrepState } from "@bow-szn/core";

const HIT_MESSAGES = ["CLEAN SHOT!", "GROUPED!"];

export function prepMessage(state: PrepState): string {
  if (isPrepDone(state)) {
    return "DIALED IN!";
  }
  switch (state.lastTap) {
    case "slip":
      return "FLIER!";
    case "hit":
      return HIT_MESSAGES[Math.min(state.hits, HIT_MESSAGES.length) - 1];
    case "none":
      return "TAP TO LOOSE!";
  }
}
