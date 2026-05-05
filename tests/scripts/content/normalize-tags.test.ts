import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, test } from "bun:test";

import { normalizeArticleTags } from "../../../scripts/content/normalize-tags";

async function withTempRoot<T>(callback: (root: string) => Promise<T>) {
  const root = await mkdtemp(path.join(tmpdir(), "tpm-tags-test-"));

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

describe("article tag normalizer", () => {
  test("rewrites safe tag case, whitespace, and duplicate issues", async () =>
    withTempRoot(async (root) => {
      const articlePath = "src/content/articles/history/example.md";
      await writeText(
        root,
        articlePath,
        [
          "---",
          "title: Example",
          "tags:",
          "  # Keep this local tag note.",
          "  - Memes",
          "  - memes",
          "  - Digital   Art",
          "---",
          "",
          "Body.",
          "",
        ].join("\n"),
      );

      const result = await normalizeArticleTags({
        articleDir: path.join(root, "src/content/articles"),
        rootDir: root,
        write: true,
      });
      const text = await readFile(path.join(root, articlePath), "utf8");

      expect(result).toMatchObject({
        changedFiles: [articlePath],
        issues: [],
        scannedFiles: 1,
      });
      expect(text).toContain(
        [
          "tags:",
          "  # Keep this local tag note.",
          '  - "memes"',
          '  - "digital art"',
        ].join("\n"),
      );
    }));

  test("reports slash tags without writing files", async () =>
    withTempRoot(async (root) => {
      const articlePath = "src/content/articles/history/example.md";
      await writeText(
        root,
        articlePath,
        ["---", "title: Example", "tags:", '  - "/pol/"', "---", ""].join("\n"),
      );

      const result = await normalizeArticleTags({
        articleDir: path.join(root, "src/content/articles"),
        rootDir: root,
        write: true,
      });
      const text = await readFile(path.join(root, articlePath), "utf8");

      expect(result.issues).toContain(
        'src/content/articles/history/example.md: article tag "/pol/" at index 0 is invalid: tag must not contain "/"',
      );
      expect(text).toContain('  - "/pol/"');
    }));

  test("rewrites unindented YAML tag lists without leaving stale entries", async () =>
    withTempRoot(async (root) => {
      const articlePath = "src/content/articles/history/example.md";
      await writeText(
        root,
        articlePath,
        [
          "---",
          "title: Example",
          "tags:",
          "- Internet Philosophy",
          "- philosophy",
          "legacyPermalink: 2020/01/01/example/",
          "---",
          "",
        ].join("\n"),
      );

      const result = await normalizeArticleTags({
        articleDir: path.join(root, "src/content/articles"),
        rootDir: root,
        write: true,
      });
      const text = await readFile(path.join(root, articlePath), "utf8");

      expect(result.issues).toEqual([]);
      expect(text).toContain(
        ["tags:", '  - "internet philosophy"', '  - "philosophy"'].join("\n"),
      );
      expect(text).not.toContain("- Internet Philosophy");
      expect(text).toContain("legacyPermalink: 2020/01/01/example/");
    }));
});
