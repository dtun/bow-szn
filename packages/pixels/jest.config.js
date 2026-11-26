const base = { preset: "ts-jest", clearMocks: true };

module.exports = {
  projects: [
    {
      ...base,
      displayName: "unit",
      testMatch: ["<rootDir>/src/**/*.test.ts"],
      testPathIgnorePatterns: ["\\.snapshot\\.test\\.ts$"],
    },
    {
      ...base,
      displayName: "snapshot",
      testMatch: ["<rootDir>/src/**/*.snapshot.test.ts"],
    },
  ],
};
