import type { ReactNode } from "react";
import { View, type ViewProps } from "react-native";

function Passthrough({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

export function Canvas({ children, ...props }: ViewProps & { children?: ReactNode }) {
  return <View {...props}>{children}</View>;
}

export let Group = Passthrough;
export let Fill = Passthrough;
export let Rect = Passthrough;
export let RoundedRect = Passthrough;
export let Circle = Passthrough;
export let Oval = Passthrough;
export let Line = Passthrough;
export let Path = Passthrough;
export let Image = Passthrough;
export let Text = Passthrough;
export let Picture = Passthrough;

export function useImage() {
  return null;
}

export function useFont() {
  return null;
}

export function createPicture() {
  return {};
}
