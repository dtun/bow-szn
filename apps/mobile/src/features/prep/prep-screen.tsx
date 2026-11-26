import { isPrepDone, type PrepState } from "@bow-szn/core";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SceneView } from "@/art/scene-view";
import { lightTap, success } from "@/platform/haptics";
import { usePreferences, type Preferences } from "@/platform/preferences";
import { playSfx } from "@/platform/sfx";
import { PixelButton } from "@/ui/pixel-button";
import { ACCENT, BACKGROUND, FONT_PIXEL, FOREGROUND, PRIMARY } from "@/ui/theme";

import { BAR_ROWS, BENCH_ROWS, benchScene, prepBarScene } from "./prep-scene";
import { usePrep } from "./use-prep";

const SCREEN_MARGIN = 16;
const CELLS_ACROSS = 60;
const MIN_CELL = 3;
const WAXED_BEAT_MS = 500;

function startHunt({ spot, season, difficulty }: Preferences) {
  router.replace({ pathname: "/hunt", params: { spot, season, difficulty } });
}

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
  let choice = usePreferences();
  let [seed] = useState(() => Date.now());
  let { state, tap } = usePrep(choice.difficulty, seed);

  let cell = Math.max(MIN_CELL, Math.floor(width / CELLS_ACROSS));
  let cols = Math.floor(width / cell);
  let bench = useMemo(
    () => benchScene(cols, state.hits, state.needed),
    [cols, state.hits, state.needed]
  );
  let barCols = cols - 2 * Math.ceil(SCREEN_MARGIN / cell);
  let bar = prepBarScene(state, barCols);

  let done = isPrepDone(state);

  useEffect(() => {
    if (!done) {
      return;
    }
    let timer = setTimeout(() => startHunt(choice), WAXED_BEAT_MS);
    return () => clearTimeout(timer);
  }, [done, choice]);

  function attempt() {
    if (done) {
      return;
    }
    lightTap();
    let next = tap();
    playSfx(next.lastTap === "slip" ? "tap-slip" : "tap-hit");
    if (isPrepDone(next)) {
      success();
    }
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
      <View pointerEvents="box-none" style={[styles.skipRow, { paddingTop: insets.top + 8 }]}>
        <PixelButton
          label="SKIP"
          accessibilityHint="Skips waxing the string and starts the hunt"
          testID="skipPrepBtn"
          tone="navy"
          size="small"
          onPress={() => startHunt(choice)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BACKGROUND },
  skipRow: {
    position: "absolute",
    top: 0,
    right: 0,
    paddingRight: SCREEN_MARGIN,
    alignItems: "flex-end",
  },
  content: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  heading: { fontFamily: FONT_PIXEL, fontSize: 16, color: ACCENT },
  message: { fontFamily: FONT_PIXEL, fontSize: 14, color: FOREGROUND, textAlign: "center" },
  count: { fontFamily: FONT_PIXEL, fontSize: 14, color: PRIMARY },
});
