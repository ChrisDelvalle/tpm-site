import { readFile } from "node:fs/promises";

import { describe, expect, test } from "bun:test";

describe("ESLint plugin module declarations", () => {
  test("declares the untyped ESLint plugins used by the config", async () => {
    const source = await readFile("types/eslint-plugin-modules.d.ts", "utf8");

    expect(source).toContain('declare module "eslint-plugin-array-func"');
    expect(source).toContain(
      'declare module "eslint-plugin-validate-jsx-nesting"',
    );
    expect(source).toContain("PluginWithConfigs");
  });
});
