import type { DeerKind } from "./sprites/deer.ts";

export type AntlerShape = { kind: "none" } | { kind: "spike" } | { kind: "rack"; points: number };

const SMALL_RACK_MAX_POINTS = 6;
const MEDIUM_RACK_MAX_POINTS = 9;

export function whitetailKind(antlers: AntlerShape): DeerKind {
  if (antlers.kind === "none") {
    return "doe";
  }
  if (antlers.kind === "spike") {
    return "spike";
  }
  if (antlers.points <= SMALL_RACK_MAX_POINTS) {
    return "buck-small";
  }
  if (antlers.points <= MEDIUM_RACK_MAX_POINTS) {
    return "buck-medium";
  }
  return "buck-large";
}
