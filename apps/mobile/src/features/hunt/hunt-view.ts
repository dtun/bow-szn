import { WORLD_H, WORLD_W, type Vec2 } from "@bow-szn/core";

import { worldScale } from "./world-scale";

export type Screen = { width: number; height: number; insetTop: number; insetBottom: number };

export type Bounds = { left: number; top: number; right: number; bottom: number };

export type HuntView = {
  scale: number;
  bounds: Bounds;
  safeTop: number;
  safeBottom: number;
};

export function huntView(screen: Screen): HuntView {
  let scale = worldScale(screen.width, screen.height);
  let width = Math.ceil(screen.width / scale);
  let height = Math.ceil(screen.height / scale);
  let insetTop = Math.ceil(screen.insetTop / scale);
  let insetBottom = Math.ceil(screen.insetBottom / scale);
  let left = Math.ceil((WORLD_W - width) / 2);
  let top = Math.min(0, WORLD_H + insetBottom - height);
  return {
    scale,
    bounds: { left, top, right: left + width, bottom: top + height },
    safeTop: top + insetTop,
    safeBottom: top + height - insetBottom,
  };
}

export function toScreen(view: HuntView, point: Vec2): Vec2 {
  return {
    x: (point.x - view.bounds.left) * view.scale,
    y: (point.y - view.bounds.top) * view.scale,
  };
}
