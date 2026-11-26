import { SPECIES, SPOTS, type Harvest, type SpeciesId } from "@bow-szn/core";
import { StyleSheet, Text, View } from "react-native";

import { PixelButton } from "@/ui/pixel-button";
import { ACCENT, FONT_PIXEL, FOREGROUND, NAVY, SKY } from "@/ui/theme";

import { entryTitle, formatClock } from "./harvest-text";

type HarvestListProps = {
  species: SpeciesId;
  harvests: Harvest[];
  mountedIds: string[];
  onClose: () => void;
};

export function HarvestList({ species, harvests, mountedIds, onClose }: HarvestListProps) {
  let newestFirst = harvests.filter((harvest) => harvest.species === species).reverse();

  return (
    <View testID="harvestList" style={styles.list}>
      <Text accessibilityRole="header" style={styles.heading}>
        {`${SPECIES[species].name} HARVESTS`}
      </Text>
      {newestFirst.map((harvest) => (
        <View key={harvest.id} testID={`journalEntry-${harvest.id}`} style={styles.entry}>
          <Text style={styles.title}>
            {mountedIds.includes(harvest.id)
              ? `${entryTitle(harvest)} - MOUNTED`
              : entryTitle(harvest)}
          </Text>
          <Text
            style={styles.line}
          >{`${SPOTS[harvest.spot].name} - ${harvest.season.toUpperCase()}`}</Text>
          <Text
            style={styles.line}
          >{`${formatClock(harvest.clockMin)} - ${harvest.shotYards} YDS`}</Text>
          <Text style={styles.line}>{`${harvest.weightLb} LB - ${harvest.meatLb} LB MEAT`}</Text>
        </View>
      ))}
      <PixelButton
        label="ALL SPECIES"
        testID="harvestListCloseBtn"
        tone="navy"
        accessibilityLabel="Back to all species"
        onPress={onClose}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
  heading: { fontFamily: FONT_PIXEL, fontSize: 12, color: FOREGROUND },
  entry: {
    gap: 6,
    padding: 12,
    backgroundColor: NAVY,
    borderWidth: 4,
    borderColor: SKY,
    borderBottomWidth: 8,
  },
  title: { fontFamily: FONT_PIXEL, fontSize: 10, color: ACCENT },
  line: { fontFamily: FONT_PIXEL, fontSize: 8, color: FOREGROUND },
});
