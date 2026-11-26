import type { SpriteId } from "./registry.ts";
import type { DeerKind } from "./sprites/deer.ts";
import type { ElkKind } from "./sprites/elk.ts";

export const HUNTER_FRAMES: { idle: SpriteId; draw: SpriteId } = {
  idle: "hunter-idle",
  draw: "hunter-draw",
};

export const FX_FRAMES: {
  dirtPuff: readonly [SpriteId, SpriteId, SpriteId];
  glint: readonly [SpriteId, SpriteId, SpriteId];
  confetti: readonly SpriteId[];
} = {
  dirtPuff: ["dirt-puff-1", "dirt-puff-2", "dirt-puff-3"],
  glint: ["glint-1", "glint-2", "glint-3"],
  confetti: ["confetti-red", "confetti-yellow", "confetti-blue", "confetti-cream"],
};

export type AnimalKind = DeerKind | ElkKind | "turkey" | "rabbit";

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
  turkey: poseFrames("turkey"),
  rabbit: poseFrames("rabbit"),
};
