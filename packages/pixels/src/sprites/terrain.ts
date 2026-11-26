import { defineSprites } from "../compose.ts";
import type { Sprite } from "../types.ts";

export type TerrainSpriteId =
  | "tree-canopy"
  | "bush"
  | "grass-tuft-1"
  | "grass-tuft-2"
  | "cattails"
  | "rock-1"
  | "rock-2"
  | "stump";

export const TERRAIN_SPRITES: Record<TerrainSpriteId, Sprite> = defineSprites({
  "tree-canopy": [
    "............GGGGG.......",
    ".....GGGGGGGggGGDDG.....",
    "....GggGGDGggGGDDDFD....",
    "...GggGGDDGgGGDDDDFDD...",
    "...GgGGDDDGGGDDDDDFDDF..",
    "...GGGDDDDGGDDDDDFFDDF..",
    "...GGDDDDDGDDDDDFFFDDD..",
    "..GGDDDDDFFDDDDFFFFDDFF.",
    "...GGGGDFFFGFFFFFDFDFF..",
    "...ggGGDFFGDDDDDDDFFFF..",
    "..GgGGDDFGDDDDDDDFFFFF..",
    "..GGGDDDFDDDDDDDFFFFFDF.",
    "..GGDDDFFDDDDDDFFFFFDDF.",
    "..GDDDFFDDDDDDFFFFFDDFF.",
    "..GGFFFDDDDDDFFFFDDDFFF.",
    "..GGDDDDFDDDFFFFDDDFFFF.",
    "...DDDDDDFFFFFFDDDFFFF..",
    "....DDDDDFFFFDDDDFFFFF..",
    ".....FFDFFFFDDDDFFFFF...",
    "........F..FFDDFFFFF....",
    ".............FFFFF......",
  ],
  bush: [
    "......GGG.....",
    "....GggGGD....",
    "..GGggGGDDFG..",
    ".GgGgGGDDDDDD.",
    ".ggGGGDRDDFDDF",
    "GgGGGDDDDFFDDF",
    "GGGDRDDDFFFRDF",
    "GGDDDDDFFRDDFF",
    ".DDDDDFFFDDFF.",
    "..DDDFFFDDFFF.",
  ],
  "grass-tuft-1": ["G...G.G", "GD.GD.G", "GDGDGDG", "DDDDDDD"],
  "grass-tuft-2": ["G..G..", "GD.GD.", "GDGDGG", "DDDDDD"],
  cattails: [
    "......E.....",
    "..E...UU..E.",
    "..UU..UU..UE",
    "..UU..UU..UU",
    "..UG..UG..UG",
    "..G...G...G.",
    ".GD..GD..GD.",
    ".GD..GD..GD.",
    "..G...G...G.",
    "..G..GG...G.",
    ".GG..GG..GG.",
    "..G...G...G.",
  ],
  "rock-1": [
    "...HHHH...",
    "..HWHHHHh.",
    ".HWHHHHHhh",
    "HHHHHHHhhh",
    "HHHHHHhhhh",
    ".hhhhhhhh.",
    "..hhhhhh..",
  ],
  "rock-2": [
    ".....gggg.....",
    "...ggGHHHHh...",
    "..gHWHHHHHHh..",
    ".HHWHHHHHHHhh.",
    "HHHHHHHHHHhhhh",
    "HHHHHHHHHhhhhh",
    ".hHHHHHhhhhhh.",
    "..hhhhhhhhhh..",
    "...hhhhhhhh...",
  ],
  stump: [
    "...tttttt...",
    "..tTTTTTTt..",
    ".tTTttttTTt.",
    ".tTTtbbtTTt.",
    "..tTTttTTt..",
    "..UUTTTTUU..",
    "..UBUUUUBU..",
    ".UUBUUUUBUU.",
    ".UEEUUUUEEU.",
  ],
});
