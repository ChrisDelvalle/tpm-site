import { describe, expect, test } from "bun:test";

import { createTestConfigs } from "../../../eslint/config/tests";

describe("test ESLint config", () => {
  test("separates component testing-library rules from Playwright rules", () => {
    const configs = createTestConfigs();

    expect(configs[0]?.files).toContain("tests/**/*.{test,spec}.tsx");
    expect(configs[1]?.files).toContain("tests/{a11y,e2e}/**/*.ts");
    expect(configs[1]?.files).toContain("playwright.config.ts");
  });
});
