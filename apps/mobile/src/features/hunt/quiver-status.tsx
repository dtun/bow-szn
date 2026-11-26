import { StyleSheet, View } from "react-native";

import type { Box } from "./hud";
import { toScreen, type HuntView } from "./hunt-view";

type QuiverStatusProps = {
  view: HuntView;
  box: Box;
  arrows: number;
};

export function arrowsLeftLabel(arrows: number): string {
  return arrows === 1 ? "1 arrow left" : `${arrows} arrows left`;
}

export function QuiverStatus({ view, box, arrows }: QuiverStatusProps) {
  let at = toScreen(view, box);

  return (
    <View
      testID="quiver"
      accessible
      accessibilityRole="text"
      accessibilityLabel={arrowsLeftLabel(arrows)}
      pointerEvents="none"
      style={[
        styles.status,
        { left: at.x, top: at.y, width: box.width * view.scale, height: box.height * view.scale },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  status: { position: "absolute" },
});
