import { createRequire } from "node:module";

import { describe, expect, test } from "bun:test";

const require = createRequire(import.meta.url);
require("eslint");
const { createMdxConfigs } = await import("../../../eslint/config/mdx");

describe("MDX ESLint config", () => {
  test("enables MDX processing and code-block linting", () => {
    const configs = createMdxConfigs();

    expect(configs[0]?.files).toEqual(["**/*.mdx"]);
    expect(configs[0]?.settings).toMatchObject({ "mdx/code-blocks": true });
    expect(configs[1]?.files).toEqual(["**/*.mdx/**"]);
    expect(configs[1]?.rules?.["prefer-const"]).toBe("error");
  });
});
