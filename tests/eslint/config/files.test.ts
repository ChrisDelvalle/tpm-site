import { describe, expect, test } from "bun:test";

import { componentFiles, typedFiles } from "../../../eslint/config/files";

describe("ESLint file scopes", () => {
  test("include source, scripts, configs, tests, and declarations", () => {
    expect(typedFiles).toContain("src/**/*.{ts,tsx}");
    expect(typedFiles).toContain("scripts/**/*.ts");
    expect(typedFiles).toContain("types/**/*.d.ts");
  });

  test("separates component files from general typed files", () => {
    expect(componentFiles).toContain("src/**/*.astro");
    expect(componentFiles).toContain("src/components/**/*.{ts,tsx}");
  });
});
