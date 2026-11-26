import { WORLD_W } from "@bow-szn/core";
import { Canvas, Rect } from "@shopify/react-native-skia";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { PixelButton } from "@/ui/pixel-button";
import { ACCENT, BACKGROUND, FONT_PIXEL, FOREGROUND } from "@/ui/theme";

const BAR_H = 8;

export function TitleScreen() {
  return (
    <View testID="titleScreen" style={styles.screen}>
      <Text style={styles.title}>BOW SEASON</Text>
      <Canvas style={styles.bar}>
        <Rect x={0} y={0} width={WORLD_W} height={BAR_H} color={ACCENT} />
      </Canvas>
      <PixelButton label="GO HUNTING" testID="goHuntingBtn" onPress={() => router.push("/hunt")} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    backgroundColor: BACKGROUND,
  },
  title: { fontFamily: FONT_PIXEL, fontSize: 24, color: FOREGROUND },
  bar: { width: WORLD_W, height: BAR_H },
});
