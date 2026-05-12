import { describe, expect, test } from "bun:test";

import { createTailwindConfigs } from "../../../eslint/config/tailwind";

describe("Tailwind ESLint config", () => {
  test("enforces known project visual-direction constraints", () => {
    const [config] = createTailwindConfigs();

    expect(config?.files).toEqual(["src/**/*.{astro,ts,tsx}"]);
    expect(config?.rules?.["better-tailwindcss/no-duplicate-classes"]).toBe(
      "error",
    );
    expect(
      JSON.stringify(
        config?.rules?.["better-tailwindcss/no-restricted-classes"],
      ),
    ).toContain("Gradients are not part of the current visual direction");
  });
});
