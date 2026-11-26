import { router } from "expo-router";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  nextDifficulty,
  nextSeason,
  updatePreferences,
  usePreferences,
} from "@/platform/preferences";

import { MENU_GAP, MENU_MARGIN, licenseCols } from "./license-art";
import { LicenseCard } from "./license-card";
import { TearOffTag } from "./tear-off-tag";

export function TitleMenu() {
  let insets = useSafeAreaInsets();
  let { width } = useWindowDimensions();
  let { difficulty, season } = usePreferences();
  let cols = licenseCols(width);

  return (
    <View style={[styles.menu, { paddingBottom: insets.bottom + MENU_MARGIN }]}>
      <LicenseCard
        cols={cols}
        difficulty={difficulty}
        season={season}
        onLevel={() => updatePreferences({ difficulty: nextDifficulty(difficulty) })}
        onSeason={() => updatePreferences({ season: nextSeason(season) })}
        onGo={() => router.push("/map")}
      />
      <TearOffTag
        tone="journal"
        label="JOURNAL"
        testID="journalBtn"
        cols={cols}
        onPress={() => router.push("/journal")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  menu: {
    alignItems: "center",
    gap: MENU_GAP,
    paddingHorizontal: MENU_MARGIN,
    paddingTop: MENU_MARGIN,
  },
});
