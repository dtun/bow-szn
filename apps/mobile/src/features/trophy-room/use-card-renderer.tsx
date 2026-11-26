import type { Harvest } from "@bow-szn/core";
import { PressStart2P_400Regular } from "@expo-google-fonts/press-start-2p";
import { drawAsImage, useFont } from "@shopify/react-native-skia";
import { useCallback } from "react";

import { TrophyCard } from "./trophy-card";
import { CARD_PX, FONT_UNITS } from "./trophy-card-layout";

export type CardRenderer = (harvest: Harvest) => Promise<Uint8Array>;

export function useCardRenderer(): CardRenderer {
  let font = useFont(PressStart2P_400Regular, FONT_UNITS);

  return useCallback(
    async function renderCard(harvest: Harvest): Promise<Uint8Array> {
      if (font === null) {
        throw new Error("The trophy card font is not loaded yet.");
      }
      let image = await drawAsImage(<TrophyCard harvest={harvest} font={font} />, CARD_PX);
      return image.encodeToBytes();
    },
    [font]
  );
}
