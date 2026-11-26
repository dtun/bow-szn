import { requireOptionalNativeModule } from "expo";

export type GameCenterStatus = "signed-in" | "signed-out" | "unavailable";

export type GameCenterModule = {
  authenticate(): Promise<GameCenterStatus>;
  submitScore(leaderboardId: string, value: number): Promise<void>;
  showLeaderboards(): Promise<GameCenterStatus>;
};

export const nativeGameCenter = requireOptionalNativeModule<GameCenterModule>("GameCenter");
