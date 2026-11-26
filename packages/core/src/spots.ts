import type { Spot, SpotId } from "./types";

export const SPOTS: Record<SpotId, Spot> = {
  "cedar-hollow": {
    id: "cedar-hollow",
    name: "CEDAR HOLLOW",
    blurb: "OLD OAKS AND FALLEN ACORNS. DEER SLIP THROUGH AT FIRST LIGHT.",
    difficulty: "easy",
    terrain: "hardwoods",
    species: ["whitetail", "turkey", "rabbit"],
    mapPos: { x: 0.26, y: 0.3 },
  },
  "miller-bottoms": {
    id: "miller-bottoms",
    name: "MILLER BOTTOMS",
    blurb: "OPEN HAYFIELD BY THE CREEK. SHORT SHOTS AND PLENTY OF RABBITS.",
    difficulty: "easy",
    terrain: "meadow",
    species: ["whitetail", "rabbit", "turkey"],
    mapPos: { x: 0.62, y: 0.58 },
  },
  "cattail-marsh": {
    id: "cattail-marsh",
    name: "CATTAIL MARSH",
    blurb: "TALL REEDS AND SOFT GROUND. TURKEYS STRUT THE DRY EDGES.",
    difficulty: "medium",
    terrain: "marsh",
    species: ["rabbit", "turkey", "whitetail"],
    mapPos: { x: 0.34, y: 0.78 },
  },
  "high-ridge": {
    id: "high-ridge",
    name: "HIGH RIDGE",
    blurb: "THIN AIR AND LONG LOOKS. BULLS BUGLE UP HERE IN THE RUT.",
    difficulty: "hard",
    terrain: "ridge",
    species: ["elk", "whitetail"],
    mapPos: { x: 0.78, y: 0.2 },
  },
};
