import type { Sprite } from "@bow-szn/pixels";

export type SceneRect = { x: number; y: number; width: number; height: number; color: string };
export type SceneSprite = { sprite: Sprite; x: number; y: number };
export type SceneLayer = { rects: SceneRect[]; sprites: SceneSprite[] };
