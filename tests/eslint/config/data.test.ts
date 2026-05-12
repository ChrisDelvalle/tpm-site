import { describe, expect, test } from "bun:test";

import { createDataConfigs } from "../../../eslint/config/data";

describe("data ESLint config", () => {
  test("loads JSON, YAML, and TOML lint presets", () => {
    const configs = createDataConfigs();

    expect(configs.length).toBeGreaterThan(3);
    expect(
      configs.some((config) => config.plugins?.["jsonc"] !== undefined),
    ).toBe(true);
    expect(
      configs.some((config) => config.plugins?.["yml"] !== undefined),
    ).toBe(true);
    expect(
      configs.some((config) => config.plugins?.["toml"] !== undefined),
    ).toBe(true);
  });
});
