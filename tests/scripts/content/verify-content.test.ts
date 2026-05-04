import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, test } from "bun:test";

import { verifyContent } from "../../scripts/verify-content";

async function withTempRoot<T>(callback: (root: string) => Promise<T>) {
  const root = await mkdtemp(path.join(tmpdir(), "tpm-content-test-"));

  try {
    return await callback(root);
  } finally {
    await rm(root, { force: true, recursive: true });
  }
}

async function writeText(root: string, relativePath: string, text: string) {
  const fullPath = path.join(root, relativePath);
  await mkdir(path.dirname(fullPath), { recursive: true });
  await writeFile(fullPath, text);
}

describe("content verifier", () => {
  test("accepts URL-safe categories and article slugs", async () =>
    withTempRoot(async (root) => {
      await writeText(root, "src/content/categories/history.json", "{}");
      await writeText(
        root,
        "src/content/authors/author.md",
        "---\ndisplayName: Author\naliases:\n  - Author\n---\n",
      );
      await writeText(
        root,
        "src/content/articles/history/example.md",
        "---\ntitle: Example\nauthor: Author\n---\n",
      );

      const result = await verifyContent({
        articleDir: path.join(root, "src/content/articles"),
        authorDir: path.join(root, "src/content/authors"),
        categoryDir: path.join(root, "src/content/categories"),
        rootDir: root,
      });

      expect(result.issues).toEqual([]);
      expect(result.publishedCount).toBe(1);
    }));

  test("reports article authors that lack author metadata aliases", async () =>
    withTempRoot(async (root) => {
      await writeText(root, "src/content/categories/history.json", "{}");
      await writeText(
        root,
        "src/content/authors/known-author.md",
        "---\ndisplayName: Known Author\naliases:\n  - Known Author\n---\n",
      );
      await writeText(
        root,
        "src/content/articles/history/example.md",
        "---\ntitle: Example\nauthor: Unknown Author\n---\n",
      );

      const result = await verifyContent({
        articleDir: path.join(root, "src/content/articles"),
        authorDir: path.join(root, "src/content/authors"),
        categoryDir: path.join(root, "src/content/categories"),
        rootDir: root,
      });

      expect(result.issues).toContain(
        'src/content/articles/history/example.md: author "Unknown Author" does not match src/content/authors/ aliases; add an author profile or approved alias',
      );
    }));
});
