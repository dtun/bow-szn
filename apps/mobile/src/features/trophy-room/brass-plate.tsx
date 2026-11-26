import { PALETTE } from "@bow-szn/pixels";
import type { Harvest } from "@bow-szn/core";
import { StyleSheet, Text, View } from "react-native";

import { FONT_PIXEL } from "@/ui/theme";

import { plateLines } from "./plate-lines";

type BrassPlateProps = {
  harvest: Harvest;
};

export function BrassPlate({ harvest }: BrassPlateProps) {
  let lines = plateLines(harvest);

  return (
    <View testID={`brassPlate-${harvest.id}`} style={styles.plate}>
      <Text style={styles.record}>{lines.record}</Text>
      <Text style={styles.line}>{lines.score}</Text>
      <Text style={styles.line}>{lines.spot}</Text>
      <Text style={styles.line}>{lines.when}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  plate: {
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: PALETTE.Y,
    borderWidth: 4,
    borderColor: PALETTE.y,
    borderBottomWidth: 8,
  },
  record: { fontFamily: FONT_PIXEL, fontSize: 10, color: PALETTE.E },
  line: { fontFamily: FONT_PIXEL, fontSize: 8, color: PALETTE.E },
});
