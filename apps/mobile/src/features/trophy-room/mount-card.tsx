import { SPECIES, SPOTS, type Harvest } from "@bow-szn/core";
import { StyleSheet, View } from "react-native";

import { PixelSprite } from "@/art/pixel-sprite";

import { BrassPlate } from "./brass-plate";
import { mountSprite } from "./mount-sprite";

const MOUNT_SCALE = 5;

function spokenLabel(harvest: Harvest): string {
  let points = harvest.antlers.kind === "rack" ? harvest.antlers.points : 0;
  let species = SPECIES[harvest.species].name.toLowerCase();
  return `Mounted ${points} point ${species} from ${SPOTS[harvest.spot].name.toLowerCase()}`;
}

type MountCardProps = {
  harvest: Harvest;
};

export function MountCard({ harvest }: MountCardProps) {
  return (
    <View testID={`mountCard-${harvest.id}`} style={styles.mount}>
      <View accessible accessibilityRole="image" accessibilityLabel={spokenLabel(harvest)}>
        <PixelSprite sprite={mountSprite(harvest)} scale={MOUNT_SCALE} />
      </View>
      <BrassPlate harvest={harvest} />
    </View>
  );
}

const styles = StyleSheet.create({
  mount: { alignItems: "center", gap: 12, paddingVertical: 16 },
});
