import { SPRITES } from "@bow-szn/pixels";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, useWindowDimensions, View, type LayoutChangeEvent } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PixelSprite } from "@/art/pixel-sprite";
import { preloadSfx } from "@/platform/sfx";
import { PixelButton } from "@/ui/pixel-button";
import { BACKGROUND, FONT_PIXEL, FOREGROUND, PRIMARY, PRIMARY_DARK } from "@/ui/theme";

import { DawnSceneView } from "./dawn-scene-view";

const LOGO = SPRITES["logo-wordmark"];
const SCENE_CELLS_ACROSS = 90;
const MIN_CELL = 3;
const SCREEN_MARGIN = 16;

type Size = { width: number; height: number };

export function TitleScreen() {
  let insets = useSafeAreaInsets();
  let { width } = useWindowDimensions();
  let [sceneSize, setSceneSize] = useState<Size | null>(null);

  useEffect(() => {
    preloadSfx();
  }, []);

  function measureScene(event: LayoutChangeEvent) {
    setSceneSize(event.nativeEvent.layout);
  }

  let logoScale = Math.max(2, Math.floor((width - SCREEN_MARGIN * 2) / LOGO.w));
  let cell = sceneSize ? Math.max(MIN_CELL, Math.floor(sceneSize.width / SCENE_CELLS_ACROSS)) : 0;

  return (
    <View testID="titleScreen" style={styles.screen}>
      <View testID="titleScene" style={styles.scene} onLayout={measureScene}>
        {sceneSize ? (
          <DawnSceneView
            cols={Math.ceil(sceneSize.width / cell)}
            rows={Math.ceil(sceneSize.height / cell)}
            cell={cell}
          />
        ) : null}
        <View style={[styles.brand, { paddingTop: insets.top + 20 }]}>
          <View accessible accessibilityRole="header" accessibilityLabel="BOW SEASON">
            <PixelSprite sprite={LOGO} scale={logoScale} testID="titleLogo" />
          </View>
          <View style={styles.ribbon}>
            <Text style={styles.ribbonText}>PIXEL HUNTING CLUB</Text>
          </View>
        </View>
      </View>
      <View style={[styles.menu, { paddingBottom: insets.bottom + 16 }]}>
        <PixelButton
          label="GO HUNTING"
          testID="goHuntingBtn"
          onPress={() => router.push("/hunt")}
          style={styles.wide}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BACKGROUND },
  scene: { flex: 1, overflow: "hidden" },
  brand: { alignItems: "center", gap: 14 },
  ribbon: {
    backgroundColor: PRIMARY,
    borderBottomWidth: 4,
    borderColor: PRIMARY_DARK,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  ribbonText: { fontFamily: FONT_PIXEL, fontSize: 10, color: FOREGROUND },
  menu: { paddingHorizontal: SCREEN_MARGIN, paddingTop: 16, gap: 12 },
  wide: { alignSelf: "stretch" },
});
