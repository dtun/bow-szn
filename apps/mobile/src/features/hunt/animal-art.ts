import { TUNING, type Animal, type Antlers, type SpeciesId, type Vec2 } from "@bow-szn/core";
import {
  ANIMAL_FRAMES,
  FX_FRAMES,
  SPRITES,
  TRANSPARENT,
  whitetailKind,
  type AnimalKind,
  type SpriteId,
} from "@bow-szn/pixels";

export type AnimalPose = { id: SpriteId; rotate: number };

const WALK_FRAME_MS = 220;
const FLEE_FRAME_MS = 90;
const FRAME_STAGGER_MS = 97;
const TIPPED_OVER = Math.PI / 2;

export function animalKind(animal: { species: SpeciesId; antlers: Antlers }): AnimalKind {
  switch (animal.species) {
    case "whitetail":
      return whitetailKind(animal.antlers);
    case "elk":
      return animal.antlers.kind === "rack" ? "elk-bull" : "elk-cow";
    case "turkey":
    case "rabbit":
      return animal.species;
  }
}

function stride(animal: Animal, elapsedMs: number, frameMs: number): 0 | 1 {
  return Math.floor((elapsedMs + animal.id * FRAME_STAGGER_MS) / frameMs) % 2 === 0 ? 0 : 1;
}

export function animalPose(animal: Animal, elapsedMs: number): AnimalPose | null {
  let frames = ANIMAL_FRAMES[animalKind(animal)];
  switch (animal.mode.kind) {
    case "graze":
      return { id: frames.graze, rotate: 0 };
    case "walk":
      return { id: frames.walk[stride(animal, elapsedMs, WALK_FRAME_MS)], rotate: 0 };
    case "alert":
      return { id: frames.walk[0], rotate: 0 };
    case "flee":
      return {
        id: stride(animal, elapsedMs, FLEE_FRAME_MS) === 0 ? frames.flee : frames.walk[1],
        rotate: 0,
      };
    case "down":
      return { id: frames.graze, rotate: animal.facing * TIPPED_OVER };
    case "gone":
      return null;
  }
}

function topPixel(id: SpriteId): Vec2 {
  let rows = SPRITES[id].rows;
  let y = rows.findIndex((row) => [...row].some((cell) => cell !== TRANSPARENT));
  let x = [...rows[y]].findIndex((cell) => cell !== TRANSPARENT);
  return { x, y };
}

export function rackTip(animal: Animal, pose: AnimalPose): Vec2 {
  let sprite = SPRITES[pose.id];
  let top = topPixel(pose.id);
  let half = Math.floor(sprite.w / 2);
  let column = animal.facing === 1 ? top.x - half : half - top.x - 1;
  return { x: Math.round(animal.pos.x) + column, y: Math.round(animal.pos.y) - sprite.h + top.y };
}

export function glintFrame(elapsedMs: number, animal: Animal): SpriteId {
  let juice = TUNING.juice;
  let into = (elapsedMs + animal.id * juice.glintStaggerMs) % juice.glintEveryMs;
  let frames = FX_FRAMES.glint;
  return frames[Math.min(frames.length - 1, Math.floor((into / juice.glintMs) * frames.length))];
}
