import { describe, expect, test } from "bun:test";

import {
  configsAsErrors,
  isUndefined,
  requiredConfig,
  rulesAsErrors,
  ruleSettingAsError,
} from "../../../eslint/config/shared";

describe("shared ESLint config helpers", () => {
  test("preserves disabled rules while promoting enabled rules to errors", () => {
    expect(ruleSettingAsError("off")).toBe("off");
    expect(ruleSettingAsError(0)).toBe(0);
    expect(ruleSettingAsError("warn")).toBe("error");
    expect(ruleSettingAsError(["warn", { option: true }])).toEqual([
      "error",
      { option: true },
    ]);
    expect(rulesAsErrors({ one: "warn", two: "off" })).toEqual({
      one: "error",
      two: "off",
    });
  });

  test("normalizes config arrays and fails clearly for missing presets", () => {
    expect(configsAsErrors([{ rules: { one: "warn" } }])).toEqual([
      { rules: { one: "error" } },
    ]);
    expect(requiredConfig({ ok: true }, "demo")).toEqual({ ok: true });
    expect(() => requiredConfig(undefined, "missing/demo")).toThrow(
      "Missing ESLint shared config: missing/demo.",
    );
    expect(isUndefined(undefined)).toBe(true);
  });
});
