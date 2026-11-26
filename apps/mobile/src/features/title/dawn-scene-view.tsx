import { Canvas, Group, Rect } from "@shopify/react-native-skia";
import { useMemo } from "react";
import { StyleSheet } from "react-native";

import { SpriteRects } from "@/art/pixel-sprite";

import { dawnScene } from "./dawn-scene";

type DawnSceneViewProps = {
  cols: number;
  rows: number;
  cell: number;
};

export function DawnSceneView({ cols, rows, cell }: DawnSceneViewProps) {
  let scene = useMemo(() => dawnScene(cols, rows), [cols, rows]);

  return (
    <Canvas testID="dawnScene" style={StyleSheet.absoluteFill}>
      <Group transform={[{ scale: cell }]}>
        {scene.layers.map((layer, layerIndex) => (
          <Group key={layerIndex}>
            {layer.rects.map((shape, index) => (
              <Rect
                key={index}
                x={shape.x}
                y={shape.y}
                width={shape.width}
                height={shape.height}
                color={shape.color}
              />
            ))}
            {layer.sprites.map((placed, index) => (
              <SpriteRects key={index} sprite={placed.sprite} x={placed.x} y={placed.y} scale={1} />
            ))}
          </Group>
        ))}
      </Group>
    </Canvas>
  );
}
