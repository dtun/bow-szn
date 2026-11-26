import { SPECIES, SPOTS, type Harvest } from "@bow-szn/core";
import { StyleSheet, View } from "react-native";

import { PixelSprite } from "@/art/pixel-sprite";
import { PixelButton } from "@/ui/pixel-button";

import { BrassPlate } from "./brass-plate";
import { mountSprite } from "./mount-sprite";

const MOUNT_SCALE = 5;

function points(harvest: Harvest): number {
  return harvest.antlers.kind === "rack" ? harvest.antlers.points : 0;
}

function spokenLabel(harvest: Harvest): string {
  let species = SPECIES[harvest.species].name.toLowerCase();
  return `Mounted ${points(harvest)} point ${species} from ${SPOTS[harvest.spot].name.toLowerCase()}`;
}

type MountCardProps = {
  harvest: Harvest;
  onShare: () => void;
};

export function MountCard({ harvest, onShare }: MountCardProps) {
  return (
    <View testID={`mountCard-${harvest.id}`} style={styles.mount}>
      <View accessible accessibilityRole="image" accessibilityLabel={spokenLabel(harvest)}>
        <PixelSprite sprite={mountSprite(harvest)} scale={MOUNT_SCALE} />
      </View>
      <BrassPlate harvest={harvest} />
      <PixelButton
        label="SHARE"
        testID={`shareMountBtn-${harvest.id}`}
        accessibilityLabel={`Share the ${points(harvest)} point ${SPECIES[harvest.species].name.toLowerCase()} mount`}
        accessibilityHint="Opens the share sheet with a trophy card"
        onPress={onShare}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mount: { alignItems: "center", gap: 12, paddingVertical: 16 },
});
