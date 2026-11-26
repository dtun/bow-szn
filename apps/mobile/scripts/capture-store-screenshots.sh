#!/usr/bin/env bash
set -euo pipefail

udid="${1:?usage: capture-store-screenshots.sh <udid> [metro-url]}"
metro_url="${2:-exp://127.0.0.1:8081}"
store_dir="store/screenshots/iphone-6.9"
run_dir="$(mktemp -d)"
trap 'xcrun simctl terminate "$udid" host.exp.Exponent >/dev/null 2>&1 || true' EXIT

node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --import ./scripts/extensionless-ts.mjs \
  scripts/store-swipe.ts > e2e/hunt-the-buck.generated.yaml

./scripts/prepare-simulator.sh "$udid"
rm -rf "$(xcrun simctl get_app_container "$udid" host.exp.Exponent data)"/Documents/ExponentExperienceData/*/*/SQLite
xcrun simctl status_bar "$udid" override --time 9:41 --batteryState charged --batteryLevel 100 \
  --wifiBars 3 --cellularBars 4

JAVA_HOME="${JAVA_HOME:-$(brew --prefix openjdk)}" MAESTRO_CLI_NO_ANALYTICS=1 \
  MAESTRO_DRIVER_STARTUP_TIMEOUT="${MAESTRO_DRIVER_STARTUP_TIMEOUT:-180000}" \
  maestro --device "$udid" test -e "METRO_URL=$metro_url" --test-output-dir "$run_dir" \
  e2e/store-screenshots.yaml

mkdir -p "$store_dir"
find "$run_dir" -path "*/takeScreenshot/*.png" -exec cp {} "$store_dir"/ \;
rm -rf "$run_dir"
file "$store_dir"/*.png
