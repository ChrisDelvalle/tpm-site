import { readFile } from "node:fs/promises";

import { describe, expect, test } from "bun:test";

describe("content collection config", () => {
  test("defines conventional announcement, article, category, page, homepage featured, and article-reference fixture collections", async () => {
    const source = await readFile("src/content.config.ts", "utf8");

    expect(source).toContain(
      "const articleReferenceArticleFixtures = defineCollection",
    );
    expect(source).toContain(
      "const articleReferenceProofFixtures = defineCollection",
    );
    expect(source).toContain("const articles = defineCollection");
    expect(source).toContain("const announcements = defineCollection");
    expect(source).toContain("const categories = defineCollection");
    expect(source).toContain("const homeFeatured = defineCollection");
    expect(source).toContain("const pages = defineCollection");
    expect(source).toContain('base: "./src/content/announcements"');
    expect(source).toContain('base: "./src/content/articles"');
    expect(source).toContain('base: "./src/content/home-featured"');
    expect(source).toContain('base: "./src/content/pages"');
    expect(source).toContain(
      'base: "./tests/fixtures/article-reference-articles"',
    );
    expect(source).toContain('base: "./tests/fixtures/article-references"');
    expect(source).toContain("generateId: ({ entry }) => filenameStem(entry)");
    expect(source).toContain('pattern: "**/*.{md,mdx}"');
  });
});
