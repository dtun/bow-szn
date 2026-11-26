import { SPECIES, SPOTS, type SeasonId, type Spot } from "@bow-szn/core";
import { router } from "expo-router";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { updatePreferences, usePreferences } from "@/platform/preferences";
import { PixelButton } from "@/ui/pixel-button";
import { ACCENT, BACKGROUND, FONT_PIXEL, FOREGROUND, NAVY, SKY } from "@/ui/theme";

import { countyCell } from "./county-map";
import { CountyMapView } from "./county-map-view";

const SCREEN_MARGIN = 16;
const CHROME_HEIGHT = 360;

function speciesInSeason(spot: Spot, season: SeasonId): string {
  return spot.species
    .filter((id) => SPECIES[id].seasons.includes(season))
    .map((id) => SPECIES[id].name)
    .join(", ");
}

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
      <View testID="spotPanel" style={styles.panel}>
        <Text testID="spotName" style={styles.spotName}>
          {spot.name}
        </Text>
        <Text testID="spotBlurb" style={styles.panelText}>
          {spot.blurb}
        </Text>
        <Text testID="spotSpecies" style={styles.panelText}>
          {`SPECIES: ${speciesInSeason(spot, season)}`}
        </Text>
        <Text testID="spotDifficulty" style={styles.panelText}>
          {`DIFFICULTY: ${spot.difficulty.toUpperCase()}`}
        </Text>
      </View>
      <View style={styles.buttons}>
        <PixelButton
          label="BACK"
          testID="mapBackBtn"
          tone="navy"
          size="small"
          onPress={leaveMap}
          style={styles.back}
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
  panel: {
    alignSelf: "stretch",
    gap: 6,
    padding: 12,
    backgroundColor: NAVY,
    borderWidth: 4,
    borderColor: SKY,
  },
  spotName: { fontFamily: FONT_PIXEL, fontSize: 12, color: ACCENT },
  panelText: { fontFamily: FONT_PIXEL, fontSize: 8, lineHeight: 12, color: FOREGROUND },
  buttons: { alignSelf: "stretch", flexDirection: "row", gap: 10 },
  back: { flex: 1 },
});
