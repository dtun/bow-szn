import { HUNTER_SPRITES } from "./sprites/hunter.ts";
import type { HunterSpriteId } from "./sprites/hunter.ts";
import type { Sprite } from "./types.ts";

export type SpriteId = HunterSpriteId;

export const SPRITES: Record<SpriteId, Sprite> = {
  ...HUNTER_SPRITES,
};
