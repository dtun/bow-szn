const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const jestPlugin = require("eslint-plugin-jest");
const prettierConfig = require("eslint-config-prettier");

const bowPlugin = {
  rules: {
    "no-comments": {
      meta: {
        type: "problem",
        schema: [],
        messages: {
          banned: "Comments are banned. Encode the why in names, types, tests, or docs/.",
        },
      },
      create(context) {
        return {
          Program() {
            for (let comment of context.sourceCode.getAllComments()) {
              if (comment.type !== "Shebang") {
                context.report({ loc: comment.loc, messageId: "banned" });
              }
            }
          },
        };
      },
    },
  },
};

const FRAMEWORK_IMPORTS = [
  "react",
  "react/*",
  "react-dom",
  "react-native",
  "react-native-*",
  "react-native-*/*",
  "expo",
  "expo-*",
  "expo-*/*",
  "@expo/*",
  "@shopify/*",
  "@/*",
];

const FEATURE_IMPORT = "**/features/**";

const HOLLOW_ASSERTION =
  "Hollow assertion. Use toBeOnTheScreen(), not.toBeOnTheScreen(), or an exact matcher (toBe/toEqual) on the value the contract promises.";

const SNAPSHOT_ASSERTION =
  "Snapshots belong in *.snapshot.test.{ts,tsx} only. Assert behavior in unit, ui, and integration tests.";

const HOLLOW_MATCHERS = Object.fromEntries(
  ["toBeTruthy", "toBeFalsy", "toBeDefined", "toBeUndefined"].flatMap((matcher) => [
    [matcher, HOLLOW_ASSERTION],
    [`not.${matcher}`, HOLLOW_ASSERTION],
  ])
);

const SNAPSHOT_MATCHERS = Object.fromEntries(
  [
    "toMatchSnapshot",
    "toMatchInlineSnapshot",
    "toThrowErrorMatchingSnapshot",
    "toThrowErrorMatchingInlineSnapshot",
  ].map((matcher) => [matcher, SNAPSHOT_ASSERTION])
);

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    ignores: [
      "**/dist/**",
      "**/.expo/**",
      "**/.expo-export/**",
      "**/expo-env.d.ts",
      "**/ios/**",
      "**/android/**",
    ],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx,mjs,cjs}"],
    plugins: { bow: bowPlugin },
    rules: {
      "bow/no-comments": "error",
      "func-style": ["error", "declaration"],
      "prefer-const": "off",
    },
  },
  {
    files: ["packages/core/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: FRAMEWORK_IMPORTS,
              message:
                "packages/core is pure TypeScript. It imports nothing from React, RN, Expo, Skia, or the app.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["apps/mobile/src/ui/**", "apps/mobile/src/art/**", "apps/mobile/src/platform/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [FEATURE_IMPORT],
              message: "ui, art, and platform sit below features. They never import a feature.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "**/jest.setup.js", "**/jest.*.setup.js"],
    plugins: {
      jest: jestPlugin,
    },
    languageOptions: {
      globals: jestPlugin.environments.globals.globals,
    },
    rules: {
      ...jestPlugin.configs.recommended.rules,
      "jest/no-restricted-matchers": ["error", { ...HOLLOW_MATCHERS, ...SNAPSHOT_MATCHERS }],
    },
  },
  {
    files: ["**/*.snapshot.test.ts", "**/*.snapshot.test.tsx"],
    rules: {
      "jest/no-restricted-matchers": ["error", HOLLOW_MATCHERS],
    },
  },
]);
