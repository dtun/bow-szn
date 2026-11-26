import { PALETTE, SPRITES } from "@bow-szn/pixels";
import { StyleSheet, Text, View } from "react-native";

import { PixelSprite } from "@/art/pixel-sprite";
import { ACCENT, FONT_PIXEL, NAVY } from "@/ui/theme";

const ICON_SCALE = 4;

type FreezerPanelProps = {
  lb: number;
};

export function FreezerPanel({ lb }: FreezerPanelProps) {
  return (
    <View testID="freezerPanel" style={styles.panel}>
      <PixelSprite sprite={SPRITES["icon-freezer"]} scale={ICON_SCALE} />
      <Text testID="freezerTotal" style={styles.total}>{`FREEZER ${lb} LB`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: NAVY,
    borderWidth: 4,
    borderColor: PALETTE.l,
    borderBottomWidth: 8,
    borderBottomColor: PALETTE.Z,
  },
  total: { fontFamily: FONT_PIXEL, fontSize: 14, color: ACCENT },
});
