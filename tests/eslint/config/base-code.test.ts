import { describe, expect, test } from "bun:test";

import { createBaseCodeConfigs } from "../../../eslint/config/base-code";

describe("base code ESLint config", () => {
  test("enforces general safety and documentation rules on code files", () => {
    const configs = createBaseCodeConfigs();
    const ruleConfig = configs.find((config) => config.rules !== undefined);

    expect(configs[0]?.files).toEqual(["**/*.{js,mjs,cjs,ts,tsx}"]);
    expect(ruleConfig?.rules?.["no-eval"]).toBe("error");
    expect(ruleConfig?.rules?.["jsdoc/require-jsdoc"]).toBeDefined();
    expect(ruleConfig?.rules?.["perfectionist/sort-modules"]).toBe("off");
    expect(ruleConfig?.rules?.["sonarjs/cognitive-complexity"]).toEqual([
      "error",
      15,
    ]);
  });
});
