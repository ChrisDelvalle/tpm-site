import { readFile } from "node:fs/promises";

import { describe, expect, test } from "bun:test";

describe("content collection config", () => {
  test("defines conventional article, category, and page collections", async () => {
    const source = await readFile("src/content.config.ts", "utf8");

    expect(source).toContain("const articles = defineCollection");
    expect(source).toContain("const categories = defineCollection");
    expect(source).toContain("const pages = defineCollection");
    expect(source).toContain('base: "./src/content/articles"');
    expect(source).toContain('base: "./src/content/pages"');
    expect(source).toContain("generateId: ({ entry }) => filenameStem(entry)");
    expect(source).toContain('pattern: "**/*.{md,mdx}"');
  });
});
