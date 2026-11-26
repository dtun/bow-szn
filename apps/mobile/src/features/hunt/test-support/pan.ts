import { act } from "@testing-library/react-native";
import { DeviceEventEmitter, Dimensions } from "react-native";
import { State } from "react-native-gesture-handler";
import { fireGestureHandler, getByGestureTestId } from "react-native-gesture-handler/jest-utils";

import { worldScale } from "../world-scale";

function screenPixelsFor(worldPx: number): number {
  let window = Dimensions.get("window");
  return worldPx * worldScale(window.width, window.height);
}

export function dragBackAndLetGo(pullWorldPx: number) {
  act(() => {
    fireGestureHandler(getByGestureTestId("huntPan"), [
      { state: State.BEGAN },
      { state: State.ACTIVE, translationX: 0, translationY: screenPixelsFor(pullWorldPx) },
      { state: State.END },
    ]);
  });
}

export function dragBackAndLoseTheTouch(pullWorldPx: number) {
  act(() => {
    fireGestureHandler(getByGestureTestId("huntPan"), [
      { state: State.BEGAN },
      { state: State.ACTIVE, translationX: 0, translationY: screenPixelsFor(pullWorldPx) },
      { state: State.CANCELLED },
    ]);
  });
}

export function holdBack(pullWorldPx: number) {
  let { handlerTag } = getByGestureTestId("huntPan");
  let translationY = screenPixelsFor(pullWorldPx);
  act(() => {
    DeviceEventEmitter.emit("onGestureHandlerStateChange", {
      handlerTag,
      oldState: State.UNDETERMINED,
      state: State.BEGAN,
    });
    DeviceEventEmitter.emit("onGestureHandlerStateChange", {
      handlerTag,
      oldState: State.BEGAN,
      state: State.ACTIVE,
      translationX: 0,
      translationY,
    });
    DeviceEventEmitter.emit("onGestureHandlerEvent", {
      handlerTag,
      state: State.ACTIVE,
      translationX: 0,
      translationY,
    });
  });
}

export function letGo() {
  let { handlerTag } = getByGestureTestId("huntPan");
  act(() => {
    DeviceEventEmitter.emit("onGestureHandlerStateChange", {
      handlerTag,
      oldState: State.ACTIVE,
      state: State.END,
    });
  });
}
