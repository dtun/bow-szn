import { StyleSheet, Text, View } from "react-native";

import { FONT_PIXEL, FOREGROUND, NAVY } from "@/ui/theme";

import type { HarvestCard } from "./harvest-card";
import { toScreen, type HuntView } from "./hunt-view";
import { GREEN, YELLOW } from "./scene-marks";

const BELOW_HUD = 28;
const EDGE = 3;
const HEIGHT = 20;
const TEXT = 6;

type HarvestBannerProps = {
  card: HarvestCard;
  view: HuntView;
};

export function HarvestBanner({ card, view }: HarvestBannerProps) {
  let { scale, bounds } = view;
  let at = toScreen(view, { x: bounds.left + EDGE, y: view.safeTop + BELOW_HUD });
  let text = { fontSize: TEXT * scale };

  return (
    <View
      testID="harvestBanner"
      style={[
        styles.banner,
        {
          left: at.x,
          top: at.y,
          width: (bounds.right - bounds.left - EDGE * 2) * scale,
          height: HEIGHT * scale,
          paddingHorizontal: 4 * scale,
          borderWidth: scale,
        },
      ]}
    >
      <View style={styles.row}>
        <Text style={[styles.text, styles.title, text]}>{card.title}</Text>
        <Text style={[styles.text, styles.meat, text]}>{card.meatLine}</Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.text, text]}>{card.classLine}</Text>
        <Text style={[styles.text, text]}>{card.shotLine}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    justifyContent: "space-evenly",
    backgroundColor: NAVY,
    borderColor: FOREGROUND,
    pointerEvents: "none",
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  text: { fontFamily: FONT_PIXEL, color: FOREGROUND },
  title: { color: YELLOW },
  meat: { color: GREEN },
});
