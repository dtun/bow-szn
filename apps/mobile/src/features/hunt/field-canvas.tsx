import { Canvas, Group, Picture, Rect } from "@shopify/react-native-skia";
import { StyleSheet } from "react-native";

import { fieldBlocks, fieldLayout } from "./field-layout";
import type { Mark, Scene } from "./hunt-scene";
import { cachedPicture } from "./sprite-pictures";
import { WorldSprite } from "./world-sprite";

type FieldCanvasProps = {
  scene: Scene;
  scale: number;
};

function MarkView({ mark }: { mark: Mark }) {
  switch (mark.kind) {
    case "sprite":
      return (
        <WorldSprite
          id={mark.id}
          x={mark.x}
          y={mark.y}
          flip={mark.flip}
          tint={mark.tint}
          rotate={mark.rotate}
        />
      );
    case "rect":
      return (
        <Rect x={mark.x} y={mark.y} width={mark.width} height={mark.height} color={mark.color} />
      );
  }
}

export function FieldCanvas({ scene, scale }: FieldCanvasProps) {
  let { terrain, seed } = scene.field;
  let field = cachedPicture(`field:${terrain}:${seed}`, () =>
    fieldBlocks(fieldLayout(terrain, seed))
  );

  return (
    <Canvas style={StyleSheet.absoluteFill}>
      <Group transform={[{ scale }]}>
        <Picture picture={field} />
        {scene.marks.map((mark) => (
          <MarkView key={mark.key} mark={mark} />
        ))}
      </Group>
    </Canvas>
  );
}
