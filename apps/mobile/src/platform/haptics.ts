import * as Haptics from "expo-haptics";

async function fire(effect: () => Promise<void>): Promise<void> {
  try {
    await effect();
  } catch {
    return;
  }
}

export function lightTap(): void {
  void fire(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

export function mediumTap(): void {
  void fire(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
}

export function success(): void {
  void fire(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}
