import type { Difficulty, SeasonId } from "@bow-szn/core";
import { PALETTE } from "@bow-szn/pixels";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { SceneView } from "@/art/scene-view";
import { StampButton } from "@/ui/stamp-button";
import { FONT_PIXEL } from "@/ui/theme";

import { LICENSE_CELL, licenseLayout, type Box } from "./license-art";
import { TearOffTag } from "./tear-off-tag";

type LicenseCardProps = {
  cols: number;
  difficulty: Difficulty;
  season: SeasonId;
  onLevel: () => void;
  onSeason: () => void;
  onGo: () => void;
};

function placed(box: Box) {
  return {
    position: "absolute" as const,
    left: box.x * LICENSE_CELL,
    top: box.y * LICENSE_CELL,
    width: box.width * LICENSE_CELL,
    height: box.height * LICENSE_CELL,
  };
}

export function LicenseCard({
  cols,
  difficulty,
  season,
  onLevel,
  onSeason,
  onGo,
}: LicenseCardProps) {
  let layout = useMemo(() => licenseLayout(cols), [cols]);

  return (
    <View
      style={{ width: layout.cols * LICENSE_CELL, height: layout.rows * LICENSE_CELL }}
      testID="huntingLicense"
    >
      <SceneView layers={[layout.paper]} cell={LICENSE_CELL} />
      <Text style={[styles.title, placed(layout.title)]}>HUNTING LICENSE</Text>
      <StampButton
        label="LEVEL:"
        value={difficulty.toUpperCase()}
        accessibilityLabel={`Level, ${difficulty}`}
        accessibilityHint="Switches to the next level"
        testID="levelBtn"
        onPress={onLevel}
        style={placed(layout.level)}
      />
      <StampButton
        label="SEASON:"
        value={season.toUpperCase()}
        accessibilityLabel={`Season, ${season}`}
        accessibilityHint="Switches to the next season"
        testID="seasonBtn"
        onPress={onSeason}
        style={placed(layout.season)}
      />
      <TearOffTag
        tone="go"
        label="GO HUNTING"
        testID="goHuntingBtn"
        cols={layout.tag.width}
        onPress={onGo}
        style={placed(layout.tag)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: FONT_PIXEL,
    fontSize: 12,
    lineHeight: 4 * LICENSE_CELL,
    color: PALETTE.N,
  },
});
