#!/usr/bin/env bash
set -euo pipefail

udid="${1:-booted}"

if [ "$udid" != "booted" ]; then
  xcrun simctl boot "$udid" 2>/dev/null || true
  xcrun simctl bootstatus "$udid" -b >/dev/null
fi

xcrun simctl spawn "$udid" defaults write host.exp.Exponent EXDevMenuShowFloatingActionButton -bool NO
xcrun simctl spawn "$udid" defaults write host.exp.Exponent EXDevMenuIsOnboardingFinished -bool YES
xcrun simctl terminate "$udid" host.exp.Exponent 2>/dev/null || true

echo "Expo Go on $udid: no Tools button, no onboarding sheet"
