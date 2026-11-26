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

type PixelButtonProps = {
  label: string;
  onPress: () => void;
  testID: string;
  tone?: ButtonTone;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
};

const TONES: Record<ButtonTone, { face: string; edge: string }> = {
  primary: { face: PRIMARY, edge: PRIMARY_DARK },
  brown: { face: BROWN, edge: BROWN_DARK },
  navy: { face: NAVY, edge: SKY },
};

export function PixelButton({
  label,
  onPress,
  testID,
  tone = "primary",
  accessibilityLabel,
  accessibilityHint,
  style,
}: PixelButtonProps) {
  let { face, edge } = TONES[tone];

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
        { backgroundColor: face, borderColor: edge },
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 4,
    borderBottomWidth: 8,
  },
  pressed: { transform: [{ translateY: 4 }], opacity: 0.9 },
  label: { fontFamily: FONT_PIXEL, fontSize: 14, color: FOREGROUND, textAlign: "center" },
});
