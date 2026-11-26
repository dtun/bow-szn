jest.mock("react-native-worklets", () => require("react-native-worklets/lib/module/mock"));

require("react-native-reanimated").setUpTests();

jest.mock("@shopify/react-native-skia");
jest.mock("expo-haptics");
