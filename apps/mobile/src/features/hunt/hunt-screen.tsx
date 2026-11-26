import { WORLD_H, WORLD_W } from "@bow-szn/core";
import { useState } from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";

import { BACKGROUND, FONT_PIXEL, FOREGROUND, NAVY } from "@/ui/theme";

import { FieldCanvas } from "./field-canvas";
import { huntConfigFor, type HuntParams } from "./hunt-config";
import { sceneFor } from "./hunt-scene";
import { useHunt } from "./use-hunt";
import { usePullGesture } from "./use-pull-gesture";
import { worldScale } from "./world-scale";

const LABEL_SIZE = 8;
const RESULT_SIZE = 16;
const POWER_LABEL_AT = { x: WORLD_W - 84, y: WORLD_H - 16 };

export function HuntScreen(params: HuntParams) {
  let [config] = useState(() => huntConfigFor(params, Date.now()));
  let { state, dispatch } = useHunt(config);
  let { width, height } = useWindowDimensions();
  let scale = worldScale(width, height);
  let scene = sceneFor(state);
  let pull = usePullGesture(dispatch, scale);

  return (
    <View testID="huntScreen" style={styles.screen}>
      <GestureDetector gesture={pull}>
        <View style={styles.letterbox}>
          <View style={[styles.inert, { width: WORLD_W * scale, height: WORLD_H * scale }]}>
            <FieldCanvas scene={scene} scale={scale} />
            {scene.powerLabel === null ? null : (
              <Text
                style={[
                  styles.label,
                  styles.powerLabel,
                  {
                    left: POWER_LABEL_AT.x * scale,
                    top: POWER_LABEL_AT.y * scale,
                    fontSize: LABEL_SIZE * scale,
                  },
                ]}
              >
                {scene.powerLabel}
              </Text>
            )}
            {scene.overLabel === null ? null : (
              <View style={styles.centered}>
                <Text style={[styles.label, { fontSize: LABEL_SIZE * scale }]}>
                  {scene.overLabel}
                </Text>
              </View>
            )}
          </View>
        </View>
      </GestureDetector>
      {scene.resultLabel === null ? null : (
        <Pressable
          testID="shotResult"
          accessibilityRole="button"
          onPress={() => dispatch({ type: "dismiss" })}
          style={styles.centered}
        >
          <Text style={[styles.label, { fontSize: RESULT_SIZE * scale }]}>{scene.resultLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BACKGROUND },
  letterbox: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  centered: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  inert: { pointerEvents: "none" },
  powerLabel: { position: "absolute" },
  label: {
    fontFamily: FONT_PIXEL,
    color: FOREGROUND,
    textShadowColor: NAVY,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
});
