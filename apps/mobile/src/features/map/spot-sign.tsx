import { SPECIES, type SeasonId, type Spot } from "@bow-szn/core";
import { PALETTE, SPRITES } from "@bow-szn/pixels";
import { StyleSheet, Text, View } from "react-native";

import { PixelSprite } from "@/art/pixel-sprite";
import { FONT_PIXEL } from "@/ui/theme";

type SpotSignProps = {
  spot: Spot;
  season: SeasonId;
};

const PIXEL = 4;
const NAIL_SCALE = 3;
const NAIL_INSET = 6;
const BORDER = PIXEL;
const PADDING = 16;
const MIN_HEIGHT = 196;

function speciesInSeason(spot: Spot, season: SeasonId): string {
  return spot.species
    .filter((id) => SPECIES[id].seasons.includes(season))
    .map((id) => SPECIES[id].name)
    .join(", ");
}

export function SpotSign({ spot, season }: SpotSignProps) {
  return (
    <View testID="spotPanel" style={styles.board}>
      <View pointerEvents="none" style={styles.highlight} />
      <Text testID="spotName" style={styles.name}>
        {spot.name}
      </Text>
      <Text testID="spotBlurb" style={styles.text}>
        {spot.blurb}
      </Text>
      <Text testID="spotSpecies" style={styles.text}>
        {`SPECIES: ${speciesInSeason(spot, season)}`}
      </Text>
      <Text testID="spotDifficulty" style={styles.text}>
        {`DIFFICULTY: ${spot.difficulty.toUpperCase()}`}
      </Text>
      <View pointerEvents="none" style={[styles.nail, { top: NAIL_INSET, left: NAIL_INSET }]}>
        <PixelSprite sprite={SPRITES["sign-nail"]} scale={NAIL_SCALE} />
      </View>
      <View pointerEvents="none" style={[styles.nail, { top: NAIL_INSET, right: NAIL_INSET }]}>
        <PixelSprite sprite={SPRITES["sign-nail"]} scale={NAIL_SCALE} />
      </View>
      <View pointerEvents="none" style={[styles.nail, { bottom: NAIL_INSET, left: NAIL_INSET }]}>
        <PixelSprite sprite={SPRITES["sign-nail"]} scale={NAIL_SCALE} />
      </View>
      <View pointerEvents="none" style={[styles.nail, { bottom: NAIL_INSET, right: NAIL_INSET }]}>
        <PixelSprite sprite={SPRITES["sign-nail"]} scale={NAIL_SCALE} />
      </View>
      <View pointerEvents="none" style={styles.knot}>
        <PixelSprite sprite={SPRITES["sign-knot"]} scale={PIXEL} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    alignSelf: "stretch",
    minHeight: MIN_HEIGHT,
    gap: 8,
    padding: PADDING,
    backgroundColor: PALETTE.B,
    borderWidth: BORDER,
    borderColor: PALETTE.U,
  },
  highlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: PIXEL,
    backgroundColor: PALETTE.b,
  },
  name: {
    fontFamily: FONT_PIXEL,
    fontSize: 14,
    lineHeight: 20,
    color: PALETTE.Y,
    textShadowColor: PALETTE.E,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  text: {
    fontFamily: FONT_PIXEL,
    fontSize: 12,
    lineHeight: 18,
    color: PALETTE.C,
    textShadowColor: PALETTE.E,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  nail: { position: "absolute" },
  knot: { position: "absolute", bottom: 2, alignSelf: "center" },
});
