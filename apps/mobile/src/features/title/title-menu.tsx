import { SPOTS } from "@bow-szn/core";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  nextDifficulty,
  nextSeason,
  updatePreferences,
  usePreferences,
} from "@/platform/preferences";
import { PixelButton } from "@/ui/pixel-button";
import { FONT_PIXEL, FOREGROUND } from "@/ui/theme";

const SCREEN_MARGIN = 16;

export function TitleMenu() {
  let insets = useSafeAreaInsets();
  let { difficulty, season, spot } = usePreferences();

  return (
    <View style={[styles.menu, { paddingBottom: insets.bottom + 16 }]}>
      <PixelButton
        label="GO HUNTING"
        testID="goHuntingBtn"
        onPress={() => router.push("/map")}
        style={styles.wide}
      />
      <PixelButton
        label={`LEVEL: ${difficulty.toUpperCase()}`}
        accessibilityLabel={`Level, ${difficulty}`}
        accessibilityHint="Switches to the next level"
        testID="levelBtn"
        tone="navy"
        onPress={() => updatePreferences({ difficulty: nextDifficulty(difficulty) })}
        style={styles.wide}
      />
      <PixelButton
        label={`SEASON: ${season.toUpperCase()}`}
        accessibilityLabel={`Season, ${season}`}
        accessibilityHint="Switches to the next season"
        testID="seasonBtn"
        tone="brown"
        onPress={() => updatePreferences({ season: nextSeason(season) })}
        style={styles.wide}
      />
      <PixelButton
        label="JOURNAL"
        testID="journalBtn"
        tone="navy"
        onPress={() => router.push("/journal")}
        style={styles.wide}
      />
      <Text testID="lastHuntLabel" style={styles.footer}>
        {`${SPOTS[spot].name} - ${season.toUpperCase()}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  menu: { paddingHorizontal: SCREEN_MARGIN, paddingTop: 16, gap: 12 },
  wide: { alignSelf: "stretch" },
  footer: {
    fontFamily: FONT_PIXEL,
    fontSize: 8,
    color: FOREGROUND,
    textAlign: "center",
    opacity: 0.7,
  },
});
