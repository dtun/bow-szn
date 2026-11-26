import { StyleSheet, Text, View } from "react-native";

import { FONT_PIXEL } from "@/ui/theme";

import { toScreen, type HuntView } from "./hunt-view";
import { NAVY, type Label } from "./scene-marks";

const SPAN = 180;

type SceneLabelsProps = {
  labels: Label[];
  view: HuntView;
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

export function SceneLabels({ labels, view, testID }: SceneLabelsProps) {
  let { scale } = view;
  return (
    <View testID={testID} style={styles.layer}>
      {labels.map((label) => {
        let at = toScreen(view, { x: boxLeft(label), y: label.y });
        let shadow = Math.max(1, (label.size * scale) / 8);
        return (
          <Text
            key={label.key}
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
