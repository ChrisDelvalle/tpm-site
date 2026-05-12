import playwright from "eslint-plugin-playwright";
import testingLibrary from "eslint-plugin-testing-library";
import type { ConfigWithExtends } from "typescript-eslint";

import { rulesAsErrors } from "./shared";

/**
 * Creates test-runner lint configs for component tests and Playwright.
 *
 * @returns Flat config blocks for test files and browser automation.
 */
export function createTestConfigs(): readonly ConfigWithExtends[] {
  return [
    {
      files: [
        "tests/**/*.{test,spec}.tsx",
        "tests/components/**/*.{test,spec}.{ts,tsx}",
      ],
      plugins: {
        "testing-library": testingLibrary,
      },
      rules: rulesAsErrors(testingLibrary.configs["flat/react"].rules),
    },
    {
      files: ["tests/{a11y,e2e}/**/*.ts", "playwright.config.ts"],
      ...playwright.configs["flat/recommended"],
      rules: rulesAsErrors(playwright.configs["flat/recommended"].rules),
    },
  ];
}
