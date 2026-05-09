import { readFile } from "node:fs/promises";

import { describe, expect, test } from "bun:test";

interface TypeScriptConfig {
  compilerOptions?: Record<string, unknown>;
  extends?: string;
  include?: string[];
}

function isTypeScriptConfig(value: unknown): value is TypeScriptConfig {
  return typeof value === "object" && value !== null;
}

async function readTypeScriptConfig(
  filePath: string,
): Promise<TypeScriptConfig> {
  const parsed: unknown = JSON.parse(await readFile(filePath, "utf8"));

  if (!isTypeScriptConfig(parsed)) {
    throw new TypeError(`${filePath} is not a TypeScript config object.`);
  }

  return parsed;
}

describe("tsconfig", () => {
  test("keeps strict application TypeScript settings enabled", async () => {
    const config = await readTypeScriptConfig("tsconfig.json");

    expect(config.extends).toBe("astro/tsconfigs/strictest");
    expect(config.compilerOptions).toMatchObject({
      allowJs: false,
      exactOptionalPropertyTypes: true,
      noUncheckedIndexedAccess: true,
      noUncheckedSideEffectImports: true,
      strict: true,
      useUnknownInCatchVariables: true,
    });
    expect(config.include).toContain("src/**/*");
  });
});
