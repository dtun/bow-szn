import type { Vec2 } from "@bow-szn/core";
import { StyleSheet, Text, View } from "react-native";

import { FONT_PIXEL } from "@/ui/theme";

import { toScreen, type HuntView } from "./hunt-view";
import { NAVY, type Label } from "./scene-marks";

const SPAN = 180;
const STILL: Vec2 = { x: 0, y: 0 };

type SceneLabelsProps = {
  labels: Label[];
  view: HuntView;
  shake?: Vec2;
  testID?: string;
};

function boxLeft(label: Label): number {
  switch (label.align) {
    case "left":
      return label.x;
    case "center":
      return label.x - SPAN / 2;
    case "right":
      return label.x - SPAN;
  }
}

export function SceneLabels({ labels, view, shake = STILL, testID }: SceneLabelsProps) {
  let { scale } = view;
  let shift = { transform: [{ translateX: shake.x * scale }, { translateY: shake.y * scale }] };
  return (
    <View testID={testID} style={[styles.layer, shift]}>
      {labels.map((label) => {
        let at = toScreen(view, { x: boxLeft(label), y: label.y });
        let shadow = Math.max(1, (label.size * scale) / 8);
        return (
          <Text
            key={label.key}
            testID={label.testID}
            style={[
              styles.text,
              {
                left: at.x,
                top: at.y,
                width: SPAN * scale,
                fontSize: label.size * scale,
                lineHeight: label.size * scale * 1.2,
                color: label.color,
                textAlign: label.align,
                textShadowOffset: { width: shadow, height: shadow },
              },
            ]}
          >
            {label.text}
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: { ...StyleSheet.absoluteFillObject, pointerEvents: "none" },
  text: {
    position: "absolute",
    fontFamily: FONT_PIXEL,
    textShadowColor: NAVY,
    textShadowRadius: 0,
  },
});
