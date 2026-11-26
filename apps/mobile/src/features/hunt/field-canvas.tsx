import {
  Canvas,
  Fill,
  FilterMode,
  Group,
  Image,
  MipmapMode,
  Oval,
  Rect,
  type SkImage,
} from "@shopify/react-native-skia";
import { StyleSheet } from "react-native";

import {
  canopyBlocks,
  fieldLayout,
  groundBlocks,
  groundColor,
  skyBlocks,
  type FieldLayout,
} from "./field-layout";
import type { Mark, Scene } from "./hunt-scene";
import type { Bounds } from "./hunt-view";
import { layerImage } from "./sprite-pictures";
import { WorldSprite } from "./world-sprite";

const PIXELATED = { filter: FilterMode.Nearest, mipmap: MipmapMode.None };

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
          outline={mark.outline}
          rotate={mark.rotate}
        />
      );
    case "rect":
      return (
        <Rect x={mark.x} y={mark.y} width={mark.width} height={mark.height} color={mark.color} />
      );
    case "oval":
      return (
        <Oval x={mark.x} y={mark.y} width={mark.width} height={mark.height} color={mark.color} />
      );
  }
}

function LayerView({ image, bounds }: { image: SkImage | null; bounds: Bounds }) {
  if (image === null) {
    return null;
  }
  return (
    <Image
      image={image}
      x={bounds.left}
      y={bounds.top}
      width={bounds.right - bounds.left}
      height={bounds.bottom - bounds.top}
      sampling={PIXELATED}
    />
  );
}

export function FieldCanvas({ scene }: { scene: Scene }) {
  let { bounds, scale } = scene.view;
  let { terrain, seed } = scene.field;
  let key = `${terrain}:${seed}:${bounds.left}:${bounds.top}:${bounds.right}:${bounds.bottom}`;
  let layout: FieldLayout | null = null;
  function laidOut(): FieldLayout {
    layout ??= fieldLayout(terrain, seed, bounds);
    return layout;
  }
  let ground = layerImage("ground", key, bounds, () => groundBlocks(laidOut()));
  let sky = layerImage("sky", key, bounds, () => skyBlocks(laidOut()));
  let canopy = layerImage("canopy", key, bounds, () => canopyBlocks(laidOut()));

  return (
    <Canvas style={StyleSheet.absoluteFill}>
      <Fill color={groundColor(terrain)} />
      <Group transform={[{ scale }, { translateX: -bounds.left }, { translateY: -bounds.top }]}>
        <Group transform={[{ translateX: scene.shake.x }, { translateY: scene.shake.y }]}>
          <LayerView image={ground} bounds={bounds} />
          {scene.ground.map((mark) => (
            <MarkView key={mark.key} mark={mark} />
          ))}
          <LayerView image={sky} bounds={bounds} />
          {scene.sky.map((mark) => (
            <MarkView key={mark.key} mark={mark} />
          ))}
          <LayerView image={canopy} bounds={bounds} />
          {scene.air.map((mark) => (
            <MarkView key={mark.key} mark={mark} />
          ))}
        </Group>
        {scene.hud.marks.map((mark) => (
          <MarkView key={mark.key} mark={mark} />
        ))}
        {scene.power?.marks.map((mark) => (
          <MarkView key={mark.key} mark={mark} />
        ))}
      </Group>
    </Canvas>
  );
}
