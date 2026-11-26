import { Canvas, Rect } from "@shopify/react-native-skia";
import { useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";

import { plankRects } from "./wall-planks";

type PlankRectsProps = {
  width: number;
  height: number;
};

export function PlankRects({ width, height }: PlankRectsProps) {
  let rects = useMemo(() => plankRects(width, height), [width, height]);

  return (
    <>
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
    </>
  );
}

export function WoodWall() {
  let { width, height } = useWindowDimensions();

  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
      <PlankRects width={width} height={height} />
    </Canvas>
  );
}
