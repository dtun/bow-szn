import { Canvas, Group, Rect } from "@shopify/react-native-skia";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";

import { SpriteRects } from "@/art/pixel-sprite";
import type { SceneLayer } from "@/art/scene";

type SceneViewProps = {
  layers: SceneLayer[];
  cell: number;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

export function SceneView({
  layers,
  cell,
  testID,
  style = StyleSheet.absoluteFill,
}: SceneViewProps) {
  return (
    <Canvas testID={testID} style={style}>
      <Group transform={[{ scale: cell }]}>
        {layers.map((layer, layerIndex) => (
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
