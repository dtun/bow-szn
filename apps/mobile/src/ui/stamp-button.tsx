import { PALETTE, SPRITES } from "@bow-szn/pixels";
import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { PixelSprite } from "@/art/pixel-sprite";
import { lightTap } from "@/platform/haptics";
import { playSfx } from "@/platform/sfx";
import { FONT_PIXEL } from "@/ui/theme";

type StampButtonProps = {
  label: string;
  value: string;
  onPress: () => void;
  testID: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
};

const FRAME = SPRITES["stamp-frame"];
const PIXEL = 4;
const TILT = "-4deg";
const THUNK_FROM = 1.35;
const THUNK_MS = 140;

export function StampButton({
  label,
  value,
  onPress,
  testID,
  accessibilityLabel,
  accessibilityHint,
  style,
}: StampButtonProps) {
  let size = useRef(new Animated.Value(1)).current;
  let shown = useRef(value);

  useEffect(() => {
    if (shown.current === value) {
      return;
    }
    shown.current = value;
    size.setValue(THUNK_FROM);
    Animated.timing(size, {
      toValue: 1,
      duration: THUNK_MS,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [value, size]);

  function handlePress() {
    lightTap();
    playSfx("ui-select");
    onPress();
  }

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? `${label} ${value}`}
      accessibilityHint={accessibilityHint}
      onPress={handlePress}
      style={style}
    >
      <Animated.View style={[styles.stamp, { transform: [{ rotate: TILT }, { scale: size }] }]}>
        <PixelSprite sprite={FRAME} scale={PIXEL} />
        <View pointerEvents="none" style={styles.ink}>
          <Text style={styles.label}>
            {label}
            {"\n"}
            <Text style={styles.value}>{value}</Text>
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  stamp: { width: FRAME.w * PIXEL, height: FRAME.h * PIXEL },
  ink: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: FONT_PIXEL,
    fontSize: 12,
    lineHeight: 20,
    textAlign: "center",
    color: PALETTE.M,
  },
  value: { fontSize: 16, lineHeight: 20 },
});
