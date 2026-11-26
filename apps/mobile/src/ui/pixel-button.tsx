import { Pressable, StyleSheet, Text } from "react-native";

import { FONT_PIXEL, FOREGROUND, NAVY, PRIMARY } from "@/ui/theme";

type PixelButtonProps = {
  label: string;
  onPress: () => void;
  testID: string;
};

export function PixelButton({ label, onPress, testID }: PixelButtonProps) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: PRIMARY,
    borderWidth: 4,
    borderColor: NAVY,
  },
  pressed: { transform: [{ translateY: 2 }], opacity: 0.85 },
  label: { fontFamily: FONT_PIXEL, fontSize: 14, color: FOREGROUND, textAlign: "center" },
});
