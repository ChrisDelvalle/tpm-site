import { describe, expect, test } from "bun:test";

import config from "../../prettier.config";

describe("Prettier config", () => {
  test("keeps Astro and Tailwind formatting plugins enabled", () => {
    expect(config.plugins).toEqual([
      "prettier-plugin-astro",
      "prettier-plugin-tailwindcss",
    ]);
    expect(config.singleQuote).toBe(false);
    expect(config.trailingComma).toBe("all");
  });
});
