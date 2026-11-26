import { PALETTE, SPRITES } from "@bow-szn/pixels";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { PixelSprite } from "@/art/pixel-sprite";
import { lightTap } from "@/platform/haptics";
import { playSfx } from "@/platform/sfx";
import { FONT_PIXEL } from "@/ui/theme";

export type SignDirection = "left" | "right";
export type SignEmphasis = "plain" | "primary";

type SignArrowProps = {
  label: string;
  direction: SignDirection;
  onPress: () => void;
  testID: string;
  emphasis?: SignEmphasis;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
};

const PIXEL = 4;
const BOARD_HEIGHT = SPRITES["sign-point-left"].h * PIXEL;

const POINTS = {
  left: SPRITES["sign-point-left"],
  right: SPRITES["sign-point-right"],
};

const LABELS: Record<SignEmphasis, { fontSize: number; color: string }> = {
  plain: { fontSize: 12, color: PALETTE.C },
  primary: { fontSize: 14, color: PALETTE.Y },
};

export function SignArrow({
  label,
  direction,
  onPress,
  testID,
  emphasis = "plain",
  accessibilityLabel,
  accessibilityHint,
  style,
}: SignArrowProps) {
  function handlePress() {
    lightTap();
    playSfx("ui-select");
    onPress();
  }

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.sign,
        { flexDirection: direction === "left" ? "row" : "row-reverse" },
        pressed && styles.pressed,
        style,
      ]}
    >
      <PixelSprite sprite={POINTS[direction]} scale={PIXEL} />
      <View style={[styles.board, direction === "left" ? styles.flatRight : styles.flatLeft]}>
        <View pointerEvents="none" style={styles.highlight} />
        <Text style={[styles.label, LABELS[emphasis]]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sign: { alignSelf: "flex-start" },
  pressed: { transform: [{ translateY: PIXEL }], opacity: 0.9 },
  board: {
    height: BOARD_HEIGHT,
    justifyContent: "center",
    paddingHorizontal: 12,
    backgroundColor: PALETTE.B,
    borderTopWidth: PIXEL,
    borderBottomWidth: PIXEL,
    borderColor: PALETTE.U,
  },
  flatLeft: { borderLeftWidth: PIXEL },
  flatRight: { borderRightWidth: PIXEL },
  highlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: PIXEL,
    backgroundColor: PALETTE.b,
  },
  label: {
    fontFamily: FONT_PIXEL,
    textAlign: "center",
    textShadowColor: PALETTE.E,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
});
