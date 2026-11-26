import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

import { ACCENT, FONT_PIXEL, FOREGROUND, NAVY } from "@/ui/theme";

export const TOAST_MS = 3000;

type PixelToastProps = {
  testID: string;
  message: string;
  onDone: () => void;
};

export function PixelToast({ testID, message, onDone }: PixelToastProps) {
  useEffect(() => {
    let timer = setTimeout(onDone, TOAST_MS);
    return () => clearTimeout(timer);
  }, [message, onDone]);

  return (
    <View
      testID={testID}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={styles.toast}
    >
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 32,
    padding: 14,
    backgroundColor: NAVY,
    borderWidth: 4,
    borderColor: ACCENT,
    borderBottomWidth: 8,
  },
  message: {
    fontFamily: FONT_PIXEL,
    fontSize: 12,
    lineHeight: 20,
    textAlign: "center",
    color: FOREGROUND,
  },
});
