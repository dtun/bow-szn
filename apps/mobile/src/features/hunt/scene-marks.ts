import type { Vec2 } from "@bow-szn/core";

import type { ArtId } from "./hunt-art";

export type SpriteMark = {
  kind: "sprite";
  key: string;
  id: ArtId;
  x: number;
  y: number;
  flip: boolean;
  tint: string | null;
  rotate: number;
};

export type RectMark = {
  kind: "rect";
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
};

export type OvalMark = {
  kind: "oval";
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
};

export type Mark = SpriteMark | RectMark | OvalMark;

export type Label = {
  key: string;
  text: string;
  x: number;
  y: number;
  size: number;
  color: string;
  align: "left" | "center" | "right";
  testID?: string;
};

export const INK = "#1b1530";
export const CREAM = "#f4efe1";
export const YELLOW = "#f7d44a";
export const NAVY = "#13214a";
export const RED = "#e23b3b";
export const GREEN = "#5fae3a";
export const DIM = "#5b5772";

export function sprite(
  key: string,
  id: ArtId,
  at: Vec2,
  options: { flip?: boolean; rotate?: number; tint?: string | null } = {}
): SpriteMark {
  return {
    kind: "sprite",
    key,
    id,
    x: Math.round(at.x),
    y: Math.round(at.y),
    flip: options.flip ?? false,
    tint: options.tint ?? null,
    rotate: options.rotate ?? 0,
  };
}

export function rect(
  key: string,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string
): RectMark {
  return { kind: "rect", key, x, y, width, height, color };
}

export function centeredRect(
  key: string,
  center: Vec2,
  width: number,
  height: number,
  color: string
): RectMark {
  return rect(
    key,
    Math.round(center.x - width / 2),
    Math.round(center.y - height / 2),
    width,
    height,
    color
  );
}

export function label(
  key: string,
  text: string,
  at: Vec2,
  size: number,
  color: string,
  align: Label["align"] = "left"
): Label {
  return { key, text, x: Math.round(at.x), y: Math.round(at.y), size, color, align };
}
