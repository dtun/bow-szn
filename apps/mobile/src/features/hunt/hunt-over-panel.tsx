import { StyleSheet, Text, View } from "react-native";

import { PixelButton } from "@/ui/pixel-button";
import { FONT_PIXEL, FOREGROUND, NAVY, PRIMARY } from "@/ui/theme";

import type { OverPanel } from "./hunt-over";

const YELLOW = "#f7d44a";
const PANEL_W = 150;
const TITLE_SIZE = 6;
const LINE_SIZE = 5;
const FREEZER_SIZE = 12;

type HuntOverPanelProps = {
  panel: OverPanel;
  scale: number;
  onAgain: () => void;
  onMap: () => void;
};

export function HuntOverPanel({ panel, scale, onAgain, onMap }: HuntOverPanelProps) {
  let line = { fontSize: LINE_SIZE * scale, lineHeight: LINE_SIZE * scale * 1.6 };

  return (
    <View style={styles.backdrop}>
      <View
        testID="huntOverPanel"
        style={[styles.panel, { width: PANEL_W * scale, padding: 6 * scale, gap: 3 * scale }]}
      >
        <Text style={[styles.text, styles.yellow, { fontSize: TITLE_SIZE * scale }]}>
          {panel.title}
        </Text>
        <View>
          {panel.tags.map((tag) => (
            <Text key={tag} style={[styles.text, line]}>
              {tag}
            </Text>
          ))}
        </View>
        <Text style={[styles.text, line]}>FREEZER</Text>
        <Text style={[styles.text, styles.yellow, styles.big, { fontSize: FREEZER_SIZE * scale }]}>
          {`${panel.freezerLb} LB`}
        </Text>
        <View style={[styles.buttons, { gap: 3 * scale }]}>
          <PixelButton label="HUNT AGAIN" testID="huntAgainBtn" onPress={onAgain} />
          <PixelButton label="MAP" testID="overMapBtn" tone="navy" onPress={onMap} />
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
    backgroundColor: "rgba(11,15,26,0.55)",
  },
  panel: {
    alignItems: "center",
    backgroundColor: NAVY,
    borderWidth: 4,
    borderColor: FOREGROUND,
  },
  buttons: { alignSelf: "stretch" },
  text: { fontFamily: FONT_PIXEL, color: FOREGROUND, textAlign: "center" },
  yellow: { color: YELLOW },
  big: { textShadowColor: PRIMARY, textShadowOffset: { width: 3, height: 3 }, textShadowRadius: 0 },
});
