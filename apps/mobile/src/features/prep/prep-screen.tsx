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
import {
  HEADING_HEIGHT,
  PLATE_HEIGHT,
  PLATE_MAX_WIDTH,
  PLATE_MIN_MARGIN,
  prepLayout,
} from "./prep-layout";
import { prepMessage } from "./prep-message";
import { baleScene, pinScene, sightBackdrop, SIGHT_COLS, SIGHT_ROWS } from "./sight-scene";
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

const StillScene = memo(function StillScene({
  layers,
  cell,
}: {
  layers: SceneLayer[];
  cell: number;
}) {
  return <SceneView layers={layers} cell={cell} />;
});

export function PrepScreen() {
  let insets = useSafeAreaInsets();
  let { width, height } = useWindowDimensions();
  let choice = usePreferences();
  let [seed] = useState(() => Date.now());
  let { state, landings, tap } = usePrep(choice.difficulty, seed);

  let { top: insetTop, bottom: insetBottom } = insets;
  let layout = useMemo(
    () => prepLayout({ width, height, insetTop, insetBottom }, PixelRatio.get()),
    [width, height, insetTop, insetBottom]
  );
  let { cell } = layout;
  let backdrop = useMemo(
    () => sightBackdrop(layout.cols, layout.rows, layout.horizonRow, layout.groundRow),
    [layout.cols, layout.rows, layout.horizonRow, layout.groundRow]
  );
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

  let plateWidth = Math.min(PLATE_MAX_WIDTH, width - PLATE_MIN_MARGIN * 2);

  return (
    <View testID="prepScreen" style={styles.screen}>
      <StillScene layers={backdrop} cell={cell} />
      <Pressable
        testID="prepTapArea"
        accessibilityRole="button"
        accessibilityLabel="Loose an arrow when the pin is in the gold"
        onPressIn={attempt}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={[styles.centered, { top: layout.headingTop }]}>
          <View style={styles.headingPlate}>
            <Text accessibilityRole="header" style={styles.heading}>
              SIGHT IN
            </Text>
          </View>
        </View>
        <View
          testID="prepBale"
          accessible
          accessibilityLabel={`${arrows} ${arrows === 1 ? "arrow" : "arrows"} in the bale`}
          style={{
            position: "absolute",
            left: layout.baleLeft,
            top: layout.baleTop,
            width: SIGHT_COLS * cell,
            height: SIGHT_ROWS * cell,
          }}
        >
          <StillScene layers={bale} cell={cell} />
          <SceneView layers={pinScene(state.markerPos)} cell={cell} />
        </View>
        <View style={[styles.centered, { top: layout.plateTop }]}>
          <View style={[styles.plate, { width: plateWidth }]}>
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
        </View>
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
  centered: { position: "absolute", left: 0, right: 0, alignItems: "center" },
  headingPlate: {
    height: HEADING_HEIGHT,
    paddingHorizontal: 14,
    justifyContent: "center",
    backgroundColor: BACKGROUND,
    borderWidth: 3,
    borderColor: ACCENT,
  },
  heading: { fontFamily: FONT_PIXEL, fontSize: 16, color: ACCENT },
  plate: {
    height: PLATE_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: BACKGROUND,
    borderWidth: 3,
    borderColor: ACCENT,
  },
  message: { fontFamily: FONT_PIXEL, fontSize: 16, textAlign: "center" },
  count: { fontFamily: FONT_PIXEL, fontSize: 14, color: FOREGROUND },
});
