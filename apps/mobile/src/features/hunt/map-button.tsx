import { Pressable, StyleSheet, Text } from "react-native";

import { lightTap } from "@/platform/haptics";
import { playSfx } from "@/platform/sfx";
import { FONT_PIXEL, FOREGROUND, NAVY } from "@/ui/theme";

import type { Box } from "./hud";
import { toScreen, type HuntView } from "./hunt-view";

const TEXT = 4;
const REACH = 10;

type MapButtonProps = {
  view: HuntView;
  box: Box;
  onPress: () => void;
};

export function MapButton({ view, box, onPress }: MapButtonProps) {
  let at = toScreen(view, box);
  let { scale } = view;

  function leave() {
    lightTap();
    playSfx("ui-select");
    onPress();
  }

  return (
    <Pressable
      testID="mapBtn"
      accessibilityRole="button"
      hitSlop={REACH}
      onPress={leave}
      style={({ pressed }) => [
        styles.button,
        {
          left: at.x,
          top: at.y,
          width: box.width * scale,
          height: box.height * scale,
          borderWidth: scale,
        },
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, { fontSize: TEXT * scale }]}>MAP</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: NAVY,
    borderColor: FOREGROUND,
  },
  pressed: { opacity: 0.7 },
  label: { fontFamily: FONT_PIXEL, color: FOREGROUND },
});
