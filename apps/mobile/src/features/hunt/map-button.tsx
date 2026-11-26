import { StyleSheet, View } from "react-native";

import { PixelButton } from "@/ui/pixel-button";

import { toScreen, type HuntView } from "./hunt-view";

const MARGIN = 2;

type MapButtonProps = {
  view: HuntView;
  onPress: () => void;
};

export function MapButton({ view, onPress }: MapButtonProps) {
  let at = toScreen(view, { x: Math.max(view.bounds.left, 0) + MARGIN, y: view.safeTop + MARGIN });

  return (
    <View style={[styles.corner, { left: at.x, top: at.y }]}>
      <PixelButton label="MAP" testID="mapBtn" tone="navy" size="small" onPress={onPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  corner: { position: "absolute" },
});
