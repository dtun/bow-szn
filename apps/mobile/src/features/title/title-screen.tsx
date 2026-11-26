import { SPRITES } from "@bow-szn/pixels";
import { useEffect, useState } from "react";
import { StyleSheet, Text, useWindowDimensions, View, type LayoutChangeEvent } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PixelSprite } from "@/art/pixel-sprite";
import { preloadSfx } from "@/platform/sfx";
import { BACKGROUND, FONT_PIXEL, FOREGROUND } from "@/ui/theme";

import { DawnSceneView } from "./dawn-scene-view";
import { TitleMenu } from "./title-menu";
import { sceneGrid, type Size } from "./title-layout";

const LOGO = SPRITES["logo-wordmark"];
const SCREEN_MARGIN = 16;

export function TitleScreen() {
  let insets = useSafeAreaInsets();
  let { width } = useWindowDimensions();
  let [sceneSize, setSceneSize] = useState<Size | null>(null);
  let [brandBottom, setBrandBottom] = useState(0);
  let [seed] = useState(() => Date.now());

  useEffect(() => {
    preloadSfx();
  }, []);

  function measureScene(event: LayoutChangeEvent) {
    setSceneSize(event.nativeEvent.layout);
  }

  function measureBrand(event: LayoutChangeEvent) {
    let { y, height } = event.nativeEvent.layout;
    setBrandBottom(y + height);
  }

  let logoScale = Math.max(2, Math.floor((width - SCREEN_MARGIN * 2) / LOGO.w));
  let grid = sceneSize ? sceneGrid(sceneSize) : null;

  return (
    <View testID="titleScreen" style={styles.screen}>
      <View testID="titleScene" style={styles.scene} onLayout={measureScene}>
        {grid ? (
          <DawnSceneView
            cols={grid.cols}
            rows={grid.rows}
            cell={grid.cell}
            seed={seed}
            skyTopRow={Math.ceil(brandBottom / grid.cell)}
          />
        ) : null}
        <View
          testID="titleBrand"
          style={[styles.brand, { paddingTop: insets.top + 20 }]}
          onLayout={measureBrand}
        >
          <View accessible accessibilityRole="header" accessibilityLabel="BOW SEASON">
            <PixelSprite sprite={LOGO} scale={logoScale} testID="titleLogo" />
          </View>
          <Text style={styles.tagline}>8-BIT BOW HUNTING</Text>
        </View>
      </View>
      <TitleMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BACKGROUND },
  scene: { flex: 1, overflow: "hidden" },
  brand: { alignItems: "center", gap: 14 },
  tagline: {
    fontFamily: FONT_PIXEL,
    fontSize: 12,
    color: FOREGROUND,
    textShadowColor: BACKGROUND,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
});
