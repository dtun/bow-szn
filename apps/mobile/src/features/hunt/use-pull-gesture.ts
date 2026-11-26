import type { HuntEvent } from "@bow-szn/core";
import { useMemo, type Dispatch } from "react";
import { Gesture, type PanGestureHandlerEventPayload } from "react-native-gesture-handler";

type Drag = Pick<PanGestureHandlerEventPayload, "translationX" | "translationY">;

export function usePullGesture(dispatch: Dispatch<HuntEvent>, scale: number) {
  return useMemo(() => {
    function drawBack(drag: Drag) {
      dispatch({
        type: "draw-move",
        pull: { x: drag.translationX / scale, y: drag.translationY / scale },
      });
    }

    return Gesture.Pan()
      .runOnJS(true)
      .withTestId("huntPan")
      .onBegin(() => dispatch({ type: "draw-start" }))
      .onStart(drawBack)
      .onUpdate(drawBack)
      .onFinalize((_event, success) => dispatch({ type: success ? "release" : "cancel" }));
  }, [dispatch, scale]);
}
