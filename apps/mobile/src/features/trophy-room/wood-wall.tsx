import { Canvas, Rect } from "@shopify/react-native-skia";
import { useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";

import { plankRects } from "./wall-planks";

export function WoodWall() {
  let { width, height } = useWindowDimensions();
  let rects = useMemo(() => plankRects(width, height), [width, height]);

  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
      {rects.map((rect) => (
        <Rect
          key={rect.key}
          x={rect.x}
          y={rect.y}
          width={rect.width}
          height={rect.height}
          color={rect.color}
        />
      ))}
    </Canvas>
  );
}
