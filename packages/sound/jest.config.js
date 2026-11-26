const SNAPSHOT_TESTS = "\\.snapshot\\.test\\.ts$";

function project(displayName, testMatch, testPathIgnorePatterns = []) {
  return {
    displayName,
    preset: "ts-jest",
    clearMocks: true,
    testMatch,
    testPathIgnorePatterns: ["/node_modules/", ...testPathIgnorePatterns],
  };
}

module.exports = {
  projects: [
    project("unit", ["<rootDir>/src/**/*.test.ts"], [SNAPSHOT_TESTS]),
    project("snapshot", ["<rootDir>/src/**/*.snapshot.test.ts"]),
  ],
};
