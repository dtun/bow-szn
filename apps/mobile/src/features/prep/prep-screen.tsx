import { isPrepDone } from "@bow-szn/core";
import { router } from "expo-router";
import { memo, useEffect, useMemo, useState } from "react";
import { PixelRatio, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { SceneLayer } from "@/art/scene";
import { SceneView } from "@/art/scene-view";
import { lightTap, success } from "@/platform/haptics";
import { usePreferences, type Preferences } from "@/platform/preferences";
import { playSfx } from "@/platform/sfx";
import { SignArrow } from "@/ui/sign-arrow";
import { ACCENT, BACKGROUND, FONT_PIXEL, FOREGROUND, PRIMARY } from "@/ui/theme";

import { stuckArrows } from "./landings";
import { sightCell } from "./prep-layout";
import { prepMessage } from "./prep-message";
import { baleScene, pinScene, SIGHT_COLS, SIGHT_ROWS } from "./sight-scene";
import { usePrep } from "./use-prep";

const SCREEN_MARGIN = 16;
const DIALED_IN_BEAT_MS = 500;
const MESSAGE_COLORS = { none: FOREGROUND, hit: ACCENT, slip: PRIMARY };

function leavePrep() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace("/map");
  }
}

function startHunt({ spot, season, difficulty }: Preferences) {
  router.replace({ pathname: "/hunt", params: { spot, season, difficulty } });
}

const Bale = memo(function Bale({ layers, cell }: { layers: SceneLayer[]; cell: number }) {
  return <SceneView layers={layers} cell={cell} />;
});

export function PrepScreen() {
  let insets = useSafeAreaInsets();
  let { width } = useWindowDimensions();
  let choice = usePreferences();
  let [seed] = useState(() => Date.now());
  let { state, landings, tap } = usePrep(choice.difficulty, seed);

  let cell = sightCell(width, PixelRatio.get());
  let arrows = stuckArrows(landings).length;
  let done = isPrepDone(state);
  let bale = useMemo(
    () => baleScene(done ? null : state.zone, landings),
    [done, state.zone, landings]
  );

  useEffect(() => {
    if (!done) {
      return;
    }
    let timer = setTimeout(() => startHunt(choice), DIALED_IN_BEAT_MS);
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
        accessibilityLabel="Loose an arrow when the pin is in the gold"
        onPressIn={attempt}
        style={StyleSheet.absoluteFill}
      />
      <View
        pointerEvents="none"
        style={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12 }]}
      >
        <Text accessibilityRole="header" style={styles.heading}>
          SIGHT IN
        </Text>
        <View
          testID="prepBale"
          accessible
          accessibilityLabel={`${arrows} ${arrows === 1 ? "arrow" : "arrows"} in the bale`}
          style={{ width: SIGHT_COLS * cell, height: SIGHT_ROWS * cell }}
        >
          <Bale layers={bale} cell={cell} />
          <SceneView layers={pinScene(state.markerPos)} cell={cell} />
        </View>
        <Text
          testID="prepMessage"
          style={[styles.message, { color: MESSAGE_COLORS[done ? "hit" : state.lastTap] }]}
        >
          {prepMessage(state)}
        </Text>
        <Text testID="prepCount" style={styles.count}>
          {`${state.hits}/${state.needed}`}
        </Text>
      </View>
      <View pointerEvents="box-none" style={[styles.topRow, { paddingTop: insets.top + 8 }]}>
        <SignArrow
          label="BACK"
          direction="left"
          accessibilityHint="Returns to the county map"
          testID="prepBackBtn"
          onPress={leavePrep}
        />
        <SignArrow
          label="SKIP"
          direction="right"
          accessibilityHint="Skips sighting in and starts the hunt"
          testID="skipPrepBtn"
          onPress={() => startHunt(choice)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BACKGROUND },
  topRow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SCREEN_MARGIN,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  content: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  heading: { fontFamily: FONT_PIXEL, fontSize: 16, color: ACCENT },
  message: { fontFamily: FONT_PIXEL, fontSize: 14, textAlign: "center" },
  count: { fontFamily: FONT_PIXEL, fontSize: 12, color: FOREGROUND },
});
