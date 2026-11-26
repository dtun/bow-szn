import { isPrepDone, type PrepState } from "@bow-szn/core";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SceneView } from "@/art/scene-view";
import { lightTap } from "@/platform/haptics";
import { usePreferences } from "@/platform/preferences";
import { playSfx } from "@/platform/sfx";
import { ACCENT, BACKGROUND, FONT_PIXEL, FOREGROUND, PRIMARY } from "@/ui/theme";

import { BAR_ROWS, BENCH_ROWS, benchScene, prepBarScene } from "./prep-scene";
import { usePrep } from "./use-prep";

const SCREEN_MARGIN = 16;
const CELLS_ACROSS = 60;
const MIN_CELL = 3;

function messageFor(state: PrepState): string {
  if (isPrepDone(state)) {
    return "WAXED UP!";
  }
  switch (state.lastTap) {
    case "slip":
      return "SLIPPED!";
    case "hit":
      return "NICE! AGAIN!";
    case "none":
      return "TAP IN THE GREEN!";
  }
}

export function PrepScreen() {
  let insets = useSafeAreaInsets();
  let { width } = useWindowDimensions();
  let { difficulty } = usePreferences();
  let [seed] = useState(() => Date.now());
  let { state, tap } = usePrep(difficulty, seed);

  let cell = Math.max(MIN_CELL, Math.floor(width / CELLS_ACROSS));
  let cols = Math.floor(width / cell);
  let bench = useMemo(
    () => benchScene(cols, state.hits, state.needed),
    [cols, state.hits, state.needed]
  );
  let barCols = cols - 2 * Math.ceil(SCREEN_MARGIN / cell);
  let bar = prepBarScene(state, barCols);

  function attempt() {
    lightTap();
    let next = tap();
    playSfx(next.lastTap === "slip" ? "tap-slip" : "tap-hit");
  }

  return (
    <View testID="prepScreen" style={styles.screen}>
      <Pressable
        testID="prepTapArea"
        accessibilityRole="button"
        accessibilityLabel="Tap when the marker is in the green zone"
        onPressIn={attempt}
        style={StyleSheet.absoluteFill}
      />
      <View
        pointerEvents="none"
        style={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12 }]}
      >
        <Text accessibilityRole="header" style={styles.heading}>
          WAX THE STRING
        </Text>
        <SceneView
          layers={bench}
          cell={cell}
          style={{ width: cols * cell, height: BENCH_ROWS * cell }}
        />
        <SceneView
          layers={bar}
          cell={cell}
          style={{ width: barCols * cell, height: BAR_ROWS * cell }}
        />
        <Text testID="prepMessage" style={styles.message}>
          {messageFor(state)}
        </Text>
        <Text testID="prepCount" style={styles.count}>
          {`(${state.hits}/${state.needed})`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BACKGROUND },
  content: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  heading: { fontFamily: FONT_PIXEL, fontSize: 16, color: ACCENT },
  message: { fontFamily: FONT_PIXEL, fontSize: 14, color: FOREGROUND, textAlign: "center" },
  count: { fontFamily: FONT_PIXEL, fontSize: 14, color: PRIMARY },
});
