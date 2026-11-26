import { SPECIES, type PersonalBest, type SpeciesId } from "@bow-szn/core";
import { PALETTE } from "@bow-szn/pixels";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { PixelSprite } from "@/art/pixel-sprite";
import { ACCENT, FONT_PIXEL, FOREGROUND, NAVY, SKY } from "@/ui/theme";

import { speciesScale, speciesSprite } from "./species-art";

const ART_BOX_HEIGHT = 72;

function hasAntlers(species: SpeciesId): boolean {
  return SPECIES[species].headgear.kind === "antlered";
}

function statLines(species: SpeciesId, best: PersonalBest): string[] {
  let lines = [`HARVESTED ${best.count}`, `HEAVIEST ${best.bestWeightLb} LB`];
  if (hasAntlers(species)) {
    lines.push(best.bestPoints > 0 ? `BEST RACK ${best.bestPoints} PTS` : "NO RACK YET");
  }
  return lines;
}

function spokenLabel(species: SpeciesId, best: PersonalBest | null): string {
  let name = SPECIES[species].name.toLowerCase();
  if (best === null) {
    return `${name}, locked. Harvest one to unlock it.`;
  }
  let label = `${name}. ${best.count} harvested. Heaviest ${best.bestWeightLb} pounds.`;
  if (hasAntlers(species)) {
    label += best.bestPoints > 0 ? ` Best rack ${best.bestPoints} points.` : " No rack yet.";
  }
  return label;
}

type SpeciesCardProps = {
  species: SpeciesId;
  best: PersonalBest | null;
  onPress: () => void;
};

export function SpeciesCard({ species, best, onPress }: SpeciesCardProps) {
  let locked = best === null;

  return (
    <Pressable
      testID={`speciesCard-${species}`}
      accessibilityRole="button"
      accessibilityLabel={spokenLabel(species, best)}
      accessibilityHint={locked ? undefined : "Shows each harvest of this species"}
      accessibilityState={{ disabled: locked }}
      disabled={locked}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.art}>
        <PixelSprite sprite={speciesSprite(species, !locked)} scale={speciesScale(species)} />
      </View>
      <Text style={[styles.name, locked && styles.dim]}>
        {locked ? "?????" : SPECIES[species].name}
      </Text>
      {best === null ? (
        <Text style={styles.dim}>LOCKED</Text>
      ) : (
        statLines(species, best).map((line) => (
          <Text key={line} style={styles.line}>
            {line}
          </Text>
        ))
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexGrow: 1,
    flexBasis: "45%",
    gap: 6,
    padding: 12,
    backgroundColor: NAVY,
    borderWidth: 4,
    borderColor: SKY,
    borderBottomWidth: 8,
  },
  pressed: { opacity: 0.85 },
  art: { height: ART_BOX_HEIGHT, alignItems: "center", justifyContent: "flex-end" },
  name: { fontFamily: FONT_PIXEL, fontSize: 10, color: FOREGROUND, marginTop: 4 },
  line: { fontFamily: FONT_PIXEL, fontSize: 8, color: ACCENT },
  dim: { fontFamily: FONT_PIXEL, fontSize: 8, color: PALETTE.h },
});
