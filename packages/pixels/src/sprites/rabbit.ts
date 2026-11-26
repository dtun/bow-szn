import { defineSprites } from "../compose.ts";
import type { Sprite } from "../types.ts";

export type RabbitPose = "walk-1" | "walk-2" | "graze" | "flee" | "down";
export type RabbitSpriteId = `rabbit-${RabbitPose}`;

export const RABBIT_SPRITES: Record<RabbitSpriteId, Sprite> = defineSprites({
  "rabbit-walk-1": [
    ".........b.b..",
    ".........bVb..",
    ".........bbb..",
    "...bbbbbbbbKV.",
    "..CBBBBBBbbb..",
    "..CBBBBBBbb...",
    "...bBBLLLb....",
    "...bbb.bb.....",
  ],
  "rabbit-walk-2": [
    ".........b.b..",
    ".........bVb..",
    ".........bbb..",
    "...bbbbbbbbKV.",
    "..CBBBBBBbbb..",
    "..CBBBBBBbb...",
    "...bBBLLLb....",
    "..bbb...bb....",
  ],
  "rabbit-graze": [
    "...bbbbbbb....",
    "..CBBBBBBbbb..",
    "..CBBBBBBbbbb.",
    "...bBBLLLb.KV.",
    "...bbb.bb.....",
  ],
  "rabbit-flee": [
    "...........b.b",
    "...........bVb",
    "..bbbbbbbbbbbb",
    "CCBBBBBBBBBbKV",
    "CBBBBBBBBBbbb.",
    "..bBBLLLLb....",
    ".bb......bb...",
    "bb........bb..",
  ],
  "rabbit-down": [
    ".b..b.....b...",
    ".b..b...b.bb..",
    "CLLLLLLLLbbbb.",
    "CBBBBBBBBBBBKV",
    ".bbbbbbbbbbbb.",
  ],
});
