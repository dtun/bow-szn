import { SPOTS } from "@bow-szn/core";
import { router } from "expo-router";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { nextSeason, updatePreferences, usePreferences } from "@/platform/preferences";
import { SignArrow } from "@/ui/sign-arrow";
import { StampButton } from "@/ui/stamp-button";
import { ACCENT, BACKGROUND, FONT_PIXEL } from "@/ui/theme";

import { COUNTY_COLS, COUNTY_ROWS, countyCell } from "./county-map";
import { CountyMapView } from "./county-map-view";
import { SpotSign } from "./spot-sign";

const SCREEN_MARGIN = 16;
const CHROME_HEIGHT = 336;
const STAMP_INSET = 8;

function leaveMap() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace("/");
  }
}

export function MapScreen() {
  let insets = useSafeAreaInsets();
  let { width, height } = useWindowDimensions();
  let { spot: selected, season } = usePreferences();
  let spot = SPOTS[selected];
  let cell = countyCell(
    width - SCREEN_MARGIN * 2,
    height - insets.top - insets.bottom - CHROME_HEIGHT
  );

  return (
    <View
      testID="mapScreen"
      style={[styles.screen, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12 }]}
    >
      <Text accessibilityRole="header" style={styles.heading}>
        PINE KNOB COUNTY
      </Text>
      <View style={{ width: COUNTY_COLS * cell, height: COUNTY_ROWS * cell }}>
        <CountyMapView
          cell={cell}
          selected={selected}
          onSelect={(next) => updatePreferences({ spot: next })}
        />
        <StampButton
          label="SEASON:"
          value={season.toUpperCase()}
          accessibilityLabel={`Season, ${season}`}
          accessibilityHint="Switches to the next season"
          testID="mapSeasonBtn"
          onPress={() => updatePreferences({ season: nextSeason(season) })}
          style={styles.stamp}
        />
      </View>
      <SpotSign spot={spot} season={season} />
      <View style={styles.signs}>
        <SignArrow label="BACK" direction="left" testID="mapBackBtn" onPress={leaveMap} />
        <SignArrow
          label="HUNT!"
          direction="right"
          emphasis="primary"
          testID="huntBtn"
          onPress={() => router.push("/prep")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    gap: 10,
    paddingHorizontal: SCREEN_MARGIN,
    backgroundColor: BACKGROUND,
  },
  heading: { fontFamily: FONT_PIXEL, fontSize: 14, color: ACCENT },
  stamp: { position: "absolute", right: STAMP_INSET, bottom: STAMP_INSET },
  signs: {
    alignSelf: "stretch",
    marginTop: "auto",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
});
