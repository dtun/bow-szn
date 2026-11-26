import { SPRITES } from "@bow-szn/pixels";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { PixelSprite } from "@/art/pixel-sprite";
import { PixelButton } from "@/ui/pixel-button";
import { FONT_PIXEL, FOREGROUND, NAVY, PRIMARY } from "@/ui/theme";

import type { HarvestCard } from "./harvest-card";
import { GREEN, YELLOW } from "./scene-marks";

const CARD_W = 150;
const SPRITE_SCALE = 3;
const TITLE = 12;
const NAME = 6;
const LINE = 5;

type HarvestCardPanelProps = {
  card: HarvestCard;
  dropPx: number;
  scale: number;
  onKeepHunting: () => void;
  onMount: (harvestId: string) => void;
};

export function HarvestCardPanel({
  card,
  dropPx,
  scale,
  onKeepHunting,
  onMount,
}: HarvestCardPanelProps) {
  let line = { fontSize: LINE * scale, lineHeight: LINE * scale * 1.7 };

  return (
    <View style={styles.backdrop}>
      <Pressable
        accessibilityLabel="Keep hunting"
        style={StyleSheet.absoluteFill}
        onPress={onKeepHunting}
      />
      <View
        testID="harvestCard"
        style={[
          styles.card,
          {
            width: CARD_W * scale,
            padding: 6 * scale,
            gap: 2 * scale,
            borderWidth: 2 * scale,
            transform: [{ translateY: dropPx * scale }],
          },
        ]}
      >
        <Text style={[styles.text, styles.title, { fontSize: TITLE * scale }]}>{card.title}</Text>
        <PixelSprite sprite={SPRITES[card.sprite]} scale={SPRITE_SCALE * scale} />
        <Text style={[styles.text, { fontSize: NAME * scale, lineHeight: NAME * scale * 1.5 }]}>
          {card.name}
        </Text>
        <Text style={[styles.text, line]}>{card.classLine}</Text>
        <Text style={[styles.text, styles.meat, line]}>{card.meatLine}</Text>
        <Text style={[styles.text, line]}>{card.shotLine}</Text>
        <View style={[styles.buttons, { gap: 3 * scale, marginTop: 3 * scale }]}>
          <PixelButton
            label="KEEP HUNTING"
            testID="keepHuntingBtn"
            tone="navy"
            onPress={onKeepHunting}
          />
          {card.canMount ? (
            <PixelButton
              label="MOUNT IT"
              testID="mountBtn"
              onPress={() => onMount(card.harvestId)}
            />
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(11,15,26,0.35)",
  },
  card: { alignItems: "center", backgroundColor: NAVY, borderColor: YELLOW },
  buttons: { alignSelf: "stretch" },
  text: { fontFamily: FONT_PIXEL, color: FOREGROUND, textAlign: "center" },
  title: {
    color: YELLOW,
    textShadowColor: PRIMARY,
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
  },
  meat: { color: GREEN },
});
