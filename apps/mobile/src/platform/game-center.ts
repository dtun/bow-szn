import { LEADERBOARDS, type LeaderboardScores } from "@bow-szn/core";

import {
  nativeGameCenter,
  type GameCenterModule,
  type GameCenterStatus,
} from "../../modules/game-center";

export type { GameCenterStatus };

export type GameCenter = {
  authenticate(): Promise<GameCenterStatus>;
  submitScores(scores: LeaderboardScores): Promise<void>;
  showLeaderboards(): Promise<GameCenterStatus>;
};

function unavailable(): GameCenterStatus {
  return "unavailable";
}

function ignore(): void {}

const NO_GAME_CENTER: GameCenter = {
  async authenticate() {
    return "unavailable";
  },
  async submitScores() {},
  async showLeaderboards() {
    return "unavailable";
  },
};

export function createDeviceGameCenter(
  native: GameCenterModule | null = nativeGameCenter
): GameCenter {
  if (native === null) {
    return NO_GAME_CENTER;
  }
  return {
    authenticate() {
      return native.authenticate().catch(unavailable);
    },
    async submitScores(scores) {
      let posts = Object.values(LEADERBOARDS).flatMap((id) => {
        let value = scores[id];
        return value === undefined ? [] : [native.submitScore(id, value).catch(ignore)];
      });
      await Promise.all(posts);
    },
    showLeaderboards() {
      return native.showLeaderboards().catch(unavailable);
    },
  };
}

export const deviceGameCenter = createDeviceGameCenter();

export type GameCenterCall =
  | { kind: "authenticate" }
  | { kind: "submit"; scores: LeaderboardScores }
  | { kind: "show" };

export type FakeGameCenter = GameCenter & { calls: GameCenterCall[] };

export function createFakeGameCenter(status: GameCenterStatus = "signed-in"): FakeGameCenter {
  let calls: GameCenterCall[] = [];
  return {
    calls,
    async authenticate() {
      calls.push({ kind: "authenticate" });
      return status;
    },
    async submitScores(scores) {
      calls.push({ kind: "submit", scores });
    },
    async showLeaderboards() {
      calls.push({ kind: "show" });
      return status;
    },
  };
}
