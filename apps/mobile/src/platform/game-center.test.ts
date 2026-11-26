import type { GameCenterModule, GameCenterStatus } from "../../modules/game-center";

import { createDeviceGameCenter } from "./game-center";

function nativeSaying(status: GameCenterStatus) {
  let posted: [string, number][] = [];
  let native: GameCenterModule = {
    async authenticate() {
      return status;
    },
    async submitScore(leaderboardId, value) {
      posted.push([leaderboardId, value]);
    },
    async showLeaderboards() {
      return status;
    },
  };
  return { native, posted };
}

async function failing(): Promise<never> {
  throw new Error("the native call failed");
}

test("where the native module is missing, as in Jest and Expo Go, Game Center is unavailable", async () => {
  let gameCenter = createDeviceGameCenter();

  await expect(gameCenter.authenticate()).resolves.toBe("unavailable");
  await expect(gameCenter.showLeaderboards()).resolves.toBe("unavailable");
  await gameCenter.submitScores({ "bowseason.freezer_total": 90 });
});

test("passes the player's sign-in status through", async () => {
  let gameCenter = createDeviceGameCenter(nativeSaying("signed-out").native);

  await expect(gameCenter.authenticate()).resolves.toBe("signed-out");
  await expect(gameCenter.showLeaderboards()).resolves.toBe("signed-out");
});

test("posts each earned score to its own board", async () => {
  let { native, posted } = nativeSaying("signed-in");

  await createDeviceGameCenter(native).submitScores({
    "bowseason.best_buck": 120,
    "bowseason.freezer_total": 90,
  });

  expect(posted).toEqual([
    ["bowseason.best_buck", 120],
    ["bowseason.freezer_total", 90],
  ]);
});

test("leaves a board the journal has not earned alone", async () => {
  let { native, posted } = nativeSaying("signed-in");

  await createDeviceGameCenter(native).submitScores({ "bowseason.freezer_total": 12 });

  expect(posted).toEqual([["bowseason.freezer_total", 12]]);
});

test("a failed post never reaches the game and the other board still gets its score", async () => {
  let { native, posted } = nativeSaying("signed-in");
  let gameCenter = createDeviceGameCenter({
    ...native,
    async submitScore(leaderboardId, value) {
      if (leaderboardId === "bowseason.best_buck") {
        return failing();
      }
      return native.submitScore(leaderboardId, value);
    },
  });

  await gameCenter.submitScores({ "bowseason.best_buck": 120, "bowseason.freezer_total": 90 });

  expect(posted).toEqual([["bowseason.freezer_total", 90]]);
});

test("a native error while signing in or opening the boards reads as unavailable", async () => {
  let gameCenter = createDeviceGameCenter({
    ...nativeSaying("signed-in").native,
    authenticate: failing,
    showLeaderboards: failing,
  });

  await expect(gameCenter.authenticate()).resolves.toBe("unavailable");
  await expect(gameCenter.showLeaderboards()).resolves.toBe("unavailable");
});
