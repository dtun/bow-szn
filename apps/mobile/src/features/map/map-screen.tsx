import { SPOTS } from "@bow-szn/core";
import { router } from "expo-router";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { nextSeason, updatePreferences, usePreferences } from "@/platform/preferences";
import { PixelButton } from "@/ui/pixel-button";
import { ACCENT, BACKGROUND, FONT_PIXEL } from "@/ui/theme";

import { countyCell } from "./county-map";
import { CountyMapView } from "./county-map-view";
import { SpotSign } from "./spot-sign";

const SCREEN_MARGIN = 16;
const CHROME_HEIGHT = 360;

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
      <CountyMapView
        cell={cell}
        selected={selected}
        onSelect={(next) => updatePreferences({ spot: next })}
      />
      <SpotSign spot={spot} season={season} />
      <View style={styles.buttons}>
        <PixelButton
          label="BACK"
          testID="mapBackBtn"
          tone="navy"
          size="small"
          onPress={leaveMap}
          style={styles.back}
        />
        <PixelButton
          label={`SEASON: ${season.toUpperCase()}`}
          accessibilityLabel={`Season, ${season}`}
          accessibilityHint="Switches to the next season"
          testID="mapSeasonBtn"
          tone="brown"
          size="small"
          onPress={() => updatePreferences({ season: nextSeason(season) })}
          style={styles.season}
        />
      </View>
      <PixelButton
        label="HUNT!"
        testID="huntBtn"
        onPress={() => router.push("/prep")}
        style={styles.hunt}
      />
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
  buttons: { alignSelf: "stretch", flexDirection: "row", gap: 10 },
  back: { flex: 1 },
  season: { flex: 2 },
  hunt: { alignSelf: "stretch" },
});
