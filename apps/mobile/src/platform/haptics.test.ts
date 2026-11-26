import * as Haptics from "expo-haptics";

import { lightTap, success } from "./haptics";

test("lightTap gives a light impact", () => {
  lightTap();

  expect(Haptics.impactAsync).toHaveBeenCalledTimes(1);
  expect(Haptics.impactAsync).toHaveBeenCalledWith("light");
});

test("success gives the success notification", () => {
  success();

  expect(Haptics.notificationAsync).toHaveBeenCalledTimes(1);
  expect(Haptics.notificationAsync).toHaveBeenCalledWith("success");
});

test("a device without haptics fails quietly", async () => {
  jest.mocked(Haptics.impactAsync).mockRejectedValueOnce(new Error("no taptic engine"));
  jest.mocked(Haptics.notificationAsync).mockImplementationOnce(() => {
    throw new Error("no taptic engine");
  });

  expect(() => lightTap()).not.toThrow();
  expect(() => success()).not.toThrow();
  await Promise.resolve();
});
