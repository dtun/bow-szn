jest.mock("react-native-worklets", () => require("react-native-worklets/lib/module/mock"));

require("react-native-reanimated").setUpTests();
require("react-native-gesture-handler/jestSetup");

jest.mock("@shopify/react-native-skia");
jest.mock("expo-haptics");
