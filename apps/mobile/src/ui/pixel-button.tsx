import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from "react-native";

import { lightTap } from "@/platform/haptics";
import { playSfx } from "@/platform/sfx";
import {
  BROWN,
  BROWN_DARK,
  FONT_PIXEL,
  FOREGROUND,
  NAVY,
  PRIMARY,
  PRIMARY_DARK,
  SKY,
} from "@/ui/theme";

export type ButtonTone = "primary" | "brown" | "navy";
export type ButtonSize = "normal" | "small";

type PixelButtonProps = {
  label: string;
  onPress: () => void;
  testID: string;
  tone?: ButtonTone;
  size?: ButtonSize;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
};

const TONES: Record<ButtonTone, { face: string; edge: string }> = {
  primary: { face: PRIMARY, edge: PRIMARY_DARK },
  brown: { face: BROWN, edge: BROWN_DARK },
  navy: { face: NAVY, edge: SKY },
};

const SIZES: Record<ButtonSize, { padding: number; fontSize: number }> = {
  normal: { padding: 14, fontSize: 14 },
  small: { padding: 10, fontSize: 10 },
};

export function PixelButton({
  label,
  onPress,
  testID,
  tone = "primary",
  size = "normal",
  accessibilityLabel,
  accessibilityHint,
  style,
}: PixelButtonProps) {
  let { face, edge } = TONES[tone];
  let { padding, fontSize } = SIZES[size];

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
        styles.button,
        { backgroundColor: face, borderColor: edge, paddingVertical: padding },
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.label, { fontSize }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 20,
    borderWidth: 4,
    borderBottomWidth: 8,
  },
  pressed: { transform: [{ translateY: 4 }], opacity: 0.9 },
  label: { fontFamily: FONT_PIXEL, color: FOREGROUND, textAlign: "center" },
});
