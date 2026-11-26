const SNAPSHOT_TESTS = "\\.snapshot\\.test\\.tsx?$";
const INTEGRATION_TESTS = "\\.integration\\.test\\.tsx$";

function project(displayName, testMatch, testPathIgnorePatterns = [], setupFiles = []) {
  return {
    displayName,
    preset: "jest-expo",
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js", ...setupFiles],
    clearMocks: true,
    testMatch,
    testPathIgnorePatterns: ["/node_modules/", ...testPathIgnorePatterns],
  };
}

module.exports = {
  projects: [
    project("unit", ["<rootDir>/src/**/*.test.ts"], [SNAPSHOT_TESTS]),
    project("ui", ["<rootDir>/src/**/*.test.tsx"], [INTEGRATION_TESTS, SNAPSHOT_TESTS]),
    project(
      "integration",
      ["<rootDir>/src/**/*.integration.test.tsx"],
      [],
      ["<rootDir>/jest.integration.setup.js"]
    ),
    project("snapshot", ["<rootDir>/src/**/*.snapshot.test.{ts,tsx}"]),
  ],
};
