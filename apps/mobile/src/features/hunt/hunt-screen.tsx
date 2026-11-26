import type { HuntConfig } from "@bow-szn/core";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useJournal } from "@/features/journal";
import { preloadSfx } from "@/platform/sfx";
import { BACKGROUND } from "@/ui/theme";

import { FieldCanvas } from "./field-canvas";
import { HarvestBanner } from "./harvest-banner";
import { HarvestCardPanel } from "./harvest-card-panel";
import { huntConfigFor, type HuntParams } from "./hunt-config";
import { deviceIo, fireEffects } from "./hunt-io";
import { overPanelFor } from "./hunt-over";
import { HuntOverPanel } from "./hunt-over-panel";
import { sceneFor } from "./hunt-scene";
import { MapButton } from "./map-button";
import { QuiverStatus } from "./quiver-status";
import { SceneLabels } from "./scene-labels";
import { useHunt } from "./use-hunt";
import { usePullGesture } from "./use-pull-gesture";

function leaveForMap() {
  router.dismissTo("/map");
}

type HuntRunProps = {
  config: HuntConfig;
  onAgain: (seed: number) => void;
};

function HuntRun({ config, onAgain }: HuntRunProps) {
  let journal = useJournal();
  let { state, juice, dispatch } = useHunt(config, (effects) =>
    fireEffects(effects, deviceIo(journal.record))
  );
  let { width, height } = useWindowDimensions();
  let insets = useSafeAreaInsets();
  let scene = sceneFor(state, juice, {
    width,
    height,
    insetTop: insets.top,
    insetBottom: insets.bottom,
  });
  let { scale } = scene.view;
  let pull = usePullGesture(dispatch, scale);
  let over = overPanelFor(state);

  return (
    <>
      <GestureDetector gesture={pull}>
        <View style={styles.fill}>
          <View style={[styles.fill, styles.inert]}>
            <FieldCanvas scene={scene} />
            <SceneLabels labels={scene.labels} view={scene.view} shake={scene.shake} />
            <SceneLabels labels={scene.hud.labels} view={scene.view} />
            {scene.power === null ? null : (
              <SceneLabels labels={scene.power.labels} view={scene.view} testID="powerPanel" />
            )}
          </View>
        </View>
      </GestureDetector>
      {scene.result.kind === "banner" ? (
        <HarvestBanner card={scene.result.card} view={scene.view} />
      ) : null}
      {scene.result.kind === "card" ? (
        <HarvestCardPanel
          card={scene.result.card}
          dropPx={scene.result.dropPx}
          scale={scale}
          onKeepHunting={() => dispatch({ type: "dismiss" })}
          onMount={(harvestId) => {
            journal.mount(harvestId);
            dispatch({ type: "dismiss" });
          }}
        />
      ) : null}
      {over === null ? null : (
        <HuntOverPanel
          panel={over}
          scale={scale}
          onAgain={() => onAgain(state.rng)}
          onMap={leaveForMap}
        />
      )}
      <QuiverStatus view={scene.view} box={scene.hud.quiver} arrows={state.arrows} />
      <MapButton view={scene.view} box={scene.hud.mapButton} onPress={leaveForMap} />
    </>
  );
}

export function HuntScreen(params: HuntParams) {
  let [config, setConfig] = useState(() => huntConfigFor(params, Date.now()));

  useEffect(() => {
    preloadSfx();
  }, []);

  return (
    <View testID="huntScreen" style={styles.screen}>
      <HuntRun
        key={config.seed}
        config={config}
        onAgain={(seed) => setConfig({ ...config, seed })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BACKGROUND },
  fill: StyleSheet.absoluteFillObject,
  inert: { pointerEvents: "none" },
});
