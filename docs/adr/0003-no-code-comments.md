# ADR-0003: No code comments

- **Status:** Accepted
- **Date:** 2026-11-26

## Context

A comment is a claim that nothing checks. The compiler ignores it, the tests ignore it, and it drifts from the code it describes the first time someone edits one without the other. Comments also invite a lazy habit: explaining unclear code instead of making it clear.

Intent can be carried by things that are checked. Names say what a value is. Types say what is allowed. Tests say what must stay true. Prose that outlives a single line belongs in `docs/`, where it is reviewed as prose.

## Decision

Source files contain no comments.

- `eslint.config.js` defines an inline plugin rule, `bow/no-comments`, and turns it on as an error for every `**/*.{js,jsx,ts,tsx,mjs,cjs}` file, config files included. The message reads "Comments are banned. Encode the why in names, types, tests, or docs/."
- The rule also bans `eslint-disable`, `@ts-ignore`, and `@ts-expect-error` directives, because they are comments. Fix the code instead of silencing the tool.
- A shebang line is not a comment. Generated files are exempt by being ignored: `expo-env.d.ts`, the `.expo/` folder, and the native `ios/` and `android/` output.
- When a why is worth keeping, encode it. Rename the value so the reason shows. Narrow the type so the wrong state cannot exist. Add a test that fails when the reason stops holding. If it is a decision rather than a fact about one line, write an ADR.
- Config that is not code (YAML workflows, `.gitignore`, `.prettierignore`) carries no comments either, for consistency.

## Consequences

- Reviewers stop reading comments as if they were verified. What remains in the code is what runs.
- Hard-to-name code gets refactored instead of annotated, which costs more up front.
- A tool that needs a suppression cannot get one. The fix is in the code or in the lint configuration, reviewed like any other change.
- `lint-staged` runs `eslint --fix` on staged files, so a commit that adds a comment fails before it lands.
