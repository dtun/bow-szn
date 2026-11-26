import { PALETTE } from "@bow-szn/pixels";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { PixelSprite } from "@/art/pixel-sprite";
import { SceneView } from "@/art/scene-view";
import { lightTap } from "@/platform/haptics";
import { playSfx } from "@/platform/sfx";
import { FONT_PIXEL } from "@/ui/theme";

import {
  GO_TAG_ROWS,
  JOURNAL_TAG_ROWS,
  LICENSE_CELL,
  NOTEBOOK,
  TAG_EDGE,
  TAG_LABEL_X,
  TAG_POINT,
  tagLayer,
  type TagSkin,
} from "./license-art";

export type TagTone = "go" | "journal";

type TagLook = {
  skin: TagSkin;
  shadow: string;
  fontSize: number;
  rows: number;
  hole: boolean;
  notebook: boolean;
};

const LOOKS: Record<TagTone, TagLook> = {
  go: {
    skin: { face: "R", edge: "M" },
    shadow: PALETTE.M,
    fontSize: 14,
    rows: GO_TAG_ROWS,
    hole: true,
    notebook: false,
  },
  journal: {
    skin: { face: "B", edge: "U" },
    shadow: PALETTE.U,
    fontSize: 12,
    rows: JOURNAL_TAG_ROWS,
    hole: false,
    notebook: true,
  },
};

const NOTEBOOK_SCALE = 2;

type TearOffTagProps = {
  tone: TagTone;
  label: string;
  testID: string;
  cols: number;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export function TearOffTag({ tone, label, testID, cols, onPress, style }: TearOffTagProps) {
  let look = LOOKS[tone];
  let art = useMemo(
    () => tagLayer(cols, look.rows, look.skin, look.hole),
    [cols, look.rows, look.skin, look.hole]
  );

  function handlePress() {
    lightTap();
    playSfx("ui-select");
    onPress();
  }

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={handlePress}
      style={({ pressed }) => [
        { width: cols * LICENSE_CELL, height: look.rows * LICENSE_CELL },
        style,
        pressed && styles.pressed,
      ]}
    >
      <SceneView layers={[art]} cell={LICENSE_CELL} />
      <View
        pointerEvents="none"
        style={[
          styles.face,
          {
            paddingLeft: (look.hole ? TAG_LABEL_X : TAG_POINT) * LICENSE_CELL,
            height: (look.rows - TAG_EDGE) * LICENSE_CELL,
          },
        ]}
      >
        {look.notebook ? <PixelSprite sprite={NOTEBOOK} scale={NOTEBOOK_SCALE} /> : null}
        <Text
          style={{
            fontFamily: FONT_PIXEL,
            fontSize: look.fontSize,
            color: PALETTE.C,
            textShadowColor: look.shadow,
            textShadowOffset: { width: 2, height: 2 },
            textShadowRadius: 0,
          }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { transform: [{ translateY: LICENSE_CELL }] },
  face: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
});
