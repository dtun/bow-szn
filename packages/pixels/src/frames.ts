import type { SpriteId } from "./registry.ts";
import type { DeerKind } from "./sprites/deer.ts";
import type { ElkKind } from "./sprites/elk.ts";

export const HUNTER_FRAMES: { idle: SpriteId; draw: SpriteId } = {
  idle: "hunter-idle",
  draw: "hunter-draw",
};

export type AnimalKind = DeerKind | ElkKind;

export type AnimalFrames = {
  walk: readonly [SpriteId, SpriteId];
  graze: SpriteId;
  flee: SpriteId;
};

function poseFrames(kind: AnimalKind): AnimalFrames {
  return {
    walk: [`${kind}-walk-1`, `${kind}-walk-2`],
    graze: `${kind}-graze`,
    flee: `${kind}-flee`,
  };
}

export const ANIMAL_FRAMES: Record<AnimalKind, AnimalFrames> = {
  doe: poseFrames("doe"),
  spike: poseFrames("spike"),
  "buck-small": poseFrames("buck-small"),
  "buck-medium": poseFrames("buck-medium"),
  "buck-large": poseFrames("buck-large"),
  "elk-cow": poseFrames("elk-cow"),
  "elk-bull": poseFrames("elk-bull"),
};
