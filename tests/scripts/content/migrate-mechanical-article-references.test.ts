import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, test } from "bun:test";

import {
  convertMechanicalArticleReferenceMarkup,
  mechanicalArticleReferenceMigration,
} from "../../../scripts/content/migrate-mechanical-article-references";

async function withTempRoot<T>(callback: (root: string) => Promise<T>) {
  const root = await mkdtemp(
    path.join(tmpdir(), "tpm-mechanical-reference-migration-test-"),
  );

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

describe("mechanical article reference migration", () => {
  test("converts simple HTML links and simple paragraph wrappers", () => {
    const result = convertMechanicalArticleReferenceMarkup(
      [
        '<p>A <a href="https://example.com" target="_blank">link</a>.</p>',
        "<p>Q: line<br />",
        "A: answer</p>",
        '<a name="Top"></a>',
      ].join("\n"),
    );

    expect(result.source).toBe(
      [
        "A [link](https://example.com).",
        "",
        "Q: line  ",
        "A: answer",
        '<a name="Top"></a>',
      ].join("\n"),
    );
    expect(result.replacements).toBe(3);
  });

  test("converts inline simple links without touching named anchors", () => {
    const result = convertMechanicalArticleReferenceMarkup(
      'A <a href="https://example.com">link</a> and <a name="Top"></a>.',
    );

    expect(result.source).toBe(
      'A [link](https://example.com) and <a name="Top"></a>.',
    );
    expect(result.replacements).toBe(1);
  });

  test("supports dry-run and write modes across article files", async () =>
    withTempRoot(async (root) => {
      await writeText(
        root,
        "src/content/articles/culture/example.md",
        '---\ntitle: Example\n---\n\nA <a href="https://example.com">link</a>.\n',
      );

      const dryRun = await mechanicalArticleReferenceMigration({
        articleDir: path.join(root, "src/content/articles"),
        rootDir: root,
        write: false,
      });
      const unchanged = await readFile(
        path.join(root, "src/content/articles/culture/example.md"),
        "utf8",
      );
      const written = await mechanicalArticleReferenceMigration({
        articleDir: path.join(root, "src/content/articles"),
        rootDir: root,
        write: true,
      });
      const changed = await readFile(
        path.join(root, "src/content/articles/culture/example.md"),
        "utf8",
      );

      expect(dryRun.replacementCount).toBe(1);
      expect(unchanged).toContain("<a href=");
      expect(written.changes).toEqual([
        {
          file: "src/content/articles/culture/example.md",
          replacements: 1,
        },
      ]);
      expect(changed).toContain("[link](https://example.com)");
    }));
});
