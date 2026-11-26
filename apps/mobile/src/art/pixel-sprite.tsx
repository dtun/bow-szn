import type { Sprite } from "@bow-szn/pixels";
import { Canvas, Group, Rect } from "@shopify/react-native-skia";
import { useMemo } from "react";

import { spriteRuns } from "@/art/sprite-runs";

type SpriteRectsProps = {
  sprite: Sprite;
  scale: number;
  x?: number;
  y?: number;
};

export function SpriteRects({ sprite, scale, x = 0, y = 0 }: SpriteRectsProps) {
  let runs = useMemo(() => spriteRuns(sprite), [sprite]);

  return (
    <Group>
      {runs.map((run) => (
        <Rect
          key={`${run.x},${run.y}`}
          x={x + run.x * scale}
          y={y + run.y * scale}
          width={run.width * scale}
          height={scale}
          color={run.color}
        />
      ))}
    </Group>
  );
}

type PixelSpriteProps = {
  sprite: Sprite;
  scale: number;
  testID?: string;
};

export function PixelSprite({ sprite, scale, testID }: PixelSpriteProps) {
  return (
    <Canvas testID={testID} style={{ width: sprite.w * scale, height: sprite.h * scale }}>
      <SpriteRects sprite={sprite} scale={scale} />
    </Canvas>
  );
}
