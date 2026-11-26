jest.mock("react-native-worklets", () => require("react-native-worklets/lib/module/mock"));

require("react-native-reanimated").setUpTests();
require("react-native-gesture-handler/jestSetup");

jest.mock("@shopify/react-native-skia");
jest.mock("expo-haptics");
jest.mock("expo-audio");
jest.mock("expo-sqlite/kv-store");

beforeEach(() => {
  require("expo-sqlite/kv-store").default.clearSync();
});
jest.mock(
  "react-native-safe-area-context",
  () => require("react-native-safe-area-context/jest/mock").default
);
