import { defineSprites } from "../compose.ts";
import type { Sprite } from "../types.ts";

export type PlatMapSpriteId =
  | "pushpin"
  | "pushpin-picked"
  | "pencil-ring"
  | "pencil-clump"
  | "pencil-tree"
  | "pencil-peak"
  | "pencil-reeds"
  | "pencil-house";

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
  "pencil-clump": [
    "....hhhhh....",
    "..hhHH.HHhh..",
    ".hH.H.H.H.hh.",
    "hH.H.H.H.H.Hh",
    "h.H.H.H.H.H.h",
    ".hhH.H.H.Hhh.",
    "...hhhhhhh...",
    "......h......",
    "......h......",
  ],
  "pencil-tree": ["..hhh..", ".hH.Hh.", "hH.H.Hh", "h.H.H.h", ".hhhhh.", "...h...", "...h..."],
  "pencil-peak": [
    ".....h.....",
    "....h.h....",
    "...h.H.h...",
    "..h.H.H.h..",
    ".h.H.H.H.h.",
    "hhhhhhhhhhh",
  ],
  "pencil-reeds": [
    "....t....",
    ".t..t..t.",
    ".t..n..t.",
    ".n..n..n.",
    ".n.n.n.n.",
    "nn.n.n.nn",
    "n.nnnnn.n",
  ],
  "pencil-house": ["...h...", "..hHh..", ".h.H.h.", "hhhhhhh", "h.hhh.h", "h.h.h.h", "hhhhhhh"],
});
