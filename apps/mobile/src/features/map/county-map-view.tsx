import { SPOTS, type SpotId } from "@bow-szn/core";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { PixelSprite } from "@/art/pixel-sprite";
import { SceneView } from "@/art/scene-view";
import { lightTap } from "@/platform/haptics";
import { playSfx } from "@/platform/sfx";
import { FONT_PIXEL, FOREGROUND, NAVY } from "@/ui/theme";

import { COUNTY_COLS, COUNTY_ROWS, countyMap, TOWNS } from "./county-map";
import { FLAG_IDLE, FLAG_PICKED } from "./spot-flag";

const FLAG_TOUCH = { width: 44, height: 48 };
const TOWN_LABEL_WIDTH = 100;
const TOWN_LABEL_DROP_CELLS = 5;

type CountyMapViewProps = {
  cell: number;
  selected: SpotId;
  onSelect: (spot: SpotId) => void;
};

export function CountyMapView({ cell, selected, onSelect }: CountyMapViewProps) {
  let layers = useMemo(countyMap, []);
  let flagScale = Math.max(2, Math.round(cell / 3));

  function pick(spot: SpotId) {
    lightTap();
    playSfx("ui-select");
    onSelect(spot);
  }

  return (
    <View
      testID="countyMap"
      style={{ width: COUNTY_COLS * cell, height: COUNTY_ROWS * cell, borderColor: NAVY }}
    >
      <SceneView layers={layers} cell={cell} />
      {TOWNS.map((town) => (
        <Text
          key={town.name}
          pointerEvents="none"
          style={[
            styles.town,
            {
              left: `${town.at.x * 100}%`,
              top: `${town.at.y * 100}%`,
              marginTop: cell * TOWN_LABEL_DROP_CELLS,
            },
          ]}
        >
          {town.name}
        </Text>
      ))}
      {(Object.keys(SPOTS) as SpotId[]).map((id) => {
        let spot = SPOTS[id];
        let isSelected = id === selected;
        return (
          <Pressable
            key={id}
            testID={`spotFlag-${id}`}
            accessibilityRole="button"
            accessibilityLabel={`${spot.name}, ${spot.difficulty}`}
            accessibilityHint="Selects this hunting spot"
            accessibilityState={{ selected: isSelected }}
            onPress={() => pick(id)}
            style={[
              styles.flagTouch,
              {
                left: `${spot.mapPos.x * 100}%`,
                top: `${spot.mapPos.y * 100}%`,
              },
            ]}
          >
            <View pointerEvents="none" style={{ marginLeft: FLAG_TOUCH.width / 2 - flagScale / 2 }}>
              <PixelSprite sprite={isSelected ? FLAG_PICKED : FLAG_IDLE} scale={flagScale} />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  town: {
    position: "absolute",
    width: TOWN_LABEL_WIDTH,
    marginLeft: -TOWN_LABEL_WIDTH / 2,
    textAlign: "center",
    fontFamily: FONT_PIXEL,
    fontSize: 8,
    color: FOREGROUND,
    textShadowColor: NAVY,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  flagTouch: {
    position: "absolute",
    width: FLAG_TOUCH.width,
    height: FLAG_TOUCH.height,
    marginLeft: -FLAG_TOUCH.width / 2,
    marginTop: -FLAG_TOUCH.height + 4,
    justifyContent: "flex-end",
    alignItems: "flex-start",
  },
});
