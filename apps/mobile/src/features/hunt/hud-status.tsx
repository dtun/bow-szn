import { StyleSheet, View } from "react-native";

import type { Box } from "./hud";
import { toScreen, type HuntView } from "./hunt-view";

type HudStatusProps = {
  testID: string;
  label: string;
  view: HuntView;
  box: Box;
};

export function arrowsLeftLabel(arrows: number): string {
  return arrows === 1 ? "1 arrow left" : `${arrows} arrows left`;
}

export function tagsFilledLabel(tags: number): string {
  return tags === 1 ? "1 tag filled" : `${tags} tags filled`;
}

export function HudStatus({ testID, label, view, box }: HudStatusProps) {
  let at = toScreen(view, box);

  return (
    <View
      testID={testID}
      accessible
      accessibilityRole="text"
      accessibilityLabel={label}
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
