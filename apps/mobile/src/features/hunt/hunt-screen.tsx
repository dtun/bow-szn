import type { HuntConfig } from "@bow-szn/core";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BACKGROUND, FONT_PIXEL, FOREGROUND, NAVY } from "@/ui/theme";

import { FieldCanvas } from "./field-canvas";
import { huntConfigFor, type HuntParams } from "./hunt-config";
import { overPanelFor } from "./hunt-over";
import { HuntOverPanel } from "./hunt-over-panel";
import { sceneFor } from "./hunt-scene";
import { MapButton } from "./map-button";
import { SceneLabels } from "./scene-labels";
import { useHunt } from "./use-hunt";
import { usePullGesture } from "./use-pull-gesture";

const RESULT_SIZE = 16;

function leaveForMap() {
  router.dismissTo("/map");
}

type HuntRunProps = {
  config: HuntConfig;
  onAgain: (seed: number) => void;
};

function HuntRun({ config, onAgain }: HuntRunProps) {
  let { state, dispatch } = useHunt(config);
  let { width, height } = useWindowDimensions();
  let insets = useSafeAreaInsets();
  let scene = sceneFor(state, {
    width,
    height,
    insetTop: insets.top,
    insetBottom: insets.bottom,
  });
  let { scale } = scene.view;
  let pull = usePullGesture(dispatch, scale);
  let over = overPanelFor(state);

  return (
    <>
      <GestureDetector gesture={pull}>
        <View style={styles.fill}>
          <View style={[styles.fill, styles.inert]}>
            <FieldCanvas scene={scene} />
            <SceneLabels labels={scene.labels} view={scene.view} />
            <SceneLabels labels={scene.hud.labels} view={scene.view} />
            {scene.power === null ? null : (
              <SceneLabels labels={scene.power.labels} view={scene.view} testID="powerPanel" />
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
      {over === null ? null : (
        <HuntOverPanel
          panel={over}
          scale={scale}
          onAgain={() => onAgain(state.rng)}
          onMap={leaveForMap}
        />
      )}
      <MapButton view={scene.view} box={scene.hud.mapButton} onPress={leaveForMap} />
    </>
  );
}

export function HuntScreen(params: HuntParams) {
  let [config, setConfig] = useState(() => huntConfigFor(params, Date.now()));

  return (
    <View testID="huntScreen" style={styles.screen}>
      <HuntRun
        key={config.seed}
        config={config}
        onAgain={(seed) => setConfig({ ...config, seed })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BACKGROUND },
  fill: StyleSheet.absoluteFillObject,
  centered: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  inert: { pointerEvents: "none" },
  label: {
    fontFamily: FONT_PIXEL,
    color: FOREGROUND,
    textShadowColor: NAVY,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
});
