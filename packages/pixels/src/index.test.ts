describe("main entry", () => {
  it("loads without touching zlib, which only the png entry may use", async () => {
    await jest.isolateModulesAsync(async () => {
      jest.doMock("node:zlib", () => {
        throw new Error("node:zlib was loaded by the main entry");
      });

      await expect(import("./index.ts")).resolves.toHaveProperty("rasterize");
    });
  });
});
