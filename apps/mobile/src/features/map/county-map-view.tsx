import { SPOTS, type SpotId } from "@bow-szn/core";
import { PALETTE, SPRITES } from "@bow-szn/pixels";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { PixelSprite } from "@/art/pixel-sprite";
import { SceneView } from "@/art/scene-view";
import { lightTap } from "@/platform/haptics";
import { playSfx } from "@/platform/sfx";
import { FONT_PIXEL } from "@/ui/theme";

import { COUNTY_COLS, COUNTY_ROWS, countyMap, TOWN_LABEL_TOP_CELLS, TOWNS } from "./county-map";

const PIN = SPRITES.pushpin;
const PIN_PICKED = SPRITES["pushpin-picked"];
const RING = SPRITES["pencil-ring"];
const MIN_PIN_SCALE = 4;
const TOWN_LABEL_WIDTH = 140;

type CountyMapViewProps = {
  cell: number;
  selected: SpotId;
  onSelect: (spot: SpotId) => void;
};

export function CountyMapView({ cell, selected, onSelect }: CountyMapViewProps) {
  let layers = useMemo(countyMap, []);
  let scale = Math.max(MIN_PIN_SCALE, cell);
  let footY = PIN.h * scale;
  let touch = {
    width: RING.w * scale,
    height: footY + Math.ceil((RING.h * scale) / 2),
  };

  function pick(spot: SpotId) {
    lightTap();
    playSfx("ui-select");
    onSelect(spot);
  }

  return (
    <View testID="countyMap" style={{ width: COUNTY_COLS * cell, height: COUNTY_ROWS * cell }}>
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
              marginTop: cell * TOWN_LABEL_TOP_CELLS,
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
            style={{
              position: "absolute",
              left: `${spot.mapPos.x * 100}%`,
              top: `${spot.mapPos.y * 100}%`,
              width: touch.width,
              height: touch.height,
              marginLeft: -touch.width / 2,
              marginTop: -footY,
            }}
          >
            {isSelected && (
              <View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  left: 0,
                  top: footY - Math.round((RING.h * scale) / 2),
                }}
              >
                <PixelSprite sprite={RING} scale={scale} testID={`spotRing-${id}`} />
              </View>
            )}
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                left: (touch.width - PIN.w * scale) / 2,
                top: 0,
              }}
            >
              <PixelSprite sprite={isSelected ? PIN_PICKED : PIN} scale={scale} />
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
    fontSize: 12,
    color: PALETTE.E,
  },
});
