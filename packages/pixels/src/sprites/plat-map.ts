import { defineSprites } from "../compose.ts";
import type { Sprite } from "../types.ts";

export type PlatMapSpriteId = "pushpin" | "pushpin-picked" | "pencil-ring";

function pin(outline: string, body: string, shine: string): string[] {
  return [
    `..${outline.repeat(3)}..`,
    `.${outline}${body.repeat(3)}${outline}.`,
    `${outline}${body}${shine}${body.repeat(3)}${outline}`,
    `${outline}${body}${shine}${body.repeat(3)}${outline}`,
    `${outline}${body.repeat(5)}${outline}`,
    `.${outline}${body.repeat(3)}${outline}.`,
    `..${outline.repeat(3)}..`,
    "...H...",
    "...H...",
    "...h...",
    "...h...",
  ];
}

export const PLAT_MAP_SPRITES: Record<PlatMapSpriteId, Sprite> = defineSprites({
  pushpin: pin("N", "n", "l"),
  "pushpin-picked": pin("M", "R", "V"),
  "pencil-ring": [
    "....hhhhhhh....",
    "..hh.......hh..",
    ".h...........h.",
    "h.............h",
    ".h...........hh",
    "..hh.......hh..",
    "....hhhhhhh....",
  ],
});
