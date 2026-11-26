import ExpoModulesCore
import GameKit

public final class GameCenterModule: Module {
  private var signInStatus: String?
  private var waitingForSignIn: [Promise] = []
  private let leaderboardCloser = LeaderboardCloser()

  public func definition() -> ModuleDefinition {
    Name("GameCenter")

    AsyncFunction("authenticate") { (promise: Promise) in
      self.authenticate(promise)
    }
    .runOnQueue(.main)

    AsyncFunction("submitScore") { (leaderboardId: String, value: Int) in
      let player = GKLocalPlayer.local
      guard player.isAuthenticated else {
        return
      }
      try await GKLeaderboard.submitScore(
        value,
        context: 0,
        player: player,
        leaderboardIDs: [leaderboardId]
      )
    }

    AsyncFunction("showLeaderboards") { () -> String in
      guard GKLocalPlayer.local.isAuthenticated else {
        return "signed-out"
      }
      guard let presenter = self.appContext?.utilities?.currentViewController() else {
        return "unavailable"
      }
      let leaderboards = GKGameCenterViewController(state: .leaderboards)
      leaderboards.gameCenterDelegate = self.leaderboardCloser
      presenter.present(leaderboards, animated: true)
      return "signed-in"
    }
    .runOnQueue(.main)
  }

  private func authenticate(_ promise: Promise) {
    if let signInStatus {
      promise.resolve(signInStatus)
      return
    }
    waitingForSignIn.append(promise)
    guard waitingForSignIn.count == 1 else {
      return
    }
    GKLocalPlayer.local.authenticateHandler = { [weak self] signInSheet, error in
      DispatchQueue.main.async {
        self?.handleSignIn(signInSheet, error)
      }
    }
  }

  private func handleSignIn(_ signInSheet: UIViewController?, _ error: Error?) {
    if let signInSheet {
      appContext?.utilities?.currentViewController()?.present(signInSheet, animated: true)
      return
    }
    let status = statusAfterSignIn(error)
    signInStatus = status
    let waiting = waitingForSignIn
    waitingForSignIn = []
    for promise in waiting {
      promise.resolve(status)
    }
  }

  private func statusAfterSignIn(_ error: Error?) -> String {
    if GKLocalPlayer.local.isAuthenticated {
      return "signed-in"
    }
    switch (error as? GKError)?.code {
    case .gameUnrecognized, .notSupported:
      return "unavailable"
    default:
      return "signed-out"
    }
  }
}

final class LeaderboardCloser: NSObject, GKGameCenterControllerDelegate {
  func gameCenterViewControllerDidFinish(_ gameCenterViewController: GKGameCenterViewController) {
    gameCenterViewController.dismiss(animated: true)
  }
}
