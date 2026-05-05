import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, test } from "bun:test";

import {
  articleReferenceCatalog,
  articleReferenceCatalogDetails,
  formatArticleReferenceCatalog,
  runArticleReferenceCatalogCli,
} from "../../../scripts/content/catalog-article-references";

async function withTempRoot<T>(callback: (root: string) => Promise<T>) {
  const root = await mkdtemp(
    path.join(tmpdir(), "tpm-reference-catalog-test-"),
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

describe("article reference migration catalog", () => {
  test("generates one catalog entry for every article", async () =>
    withTempRoot(async (root) => {
      await writeText(
        root,
        "src/content/articles/culture/clean.md",
        "---\ntitle: Clean\n---\n\nPlain prose.\n",
      );
      await writeText(
        root,
        "src/content/articles/culture/linked.md",
        "---\ntitle: Linked\n---\n\nA [link](https://example.com).\n",
      );
      await writeText(
        root,
        "src/content/articles/culture/html.md",
        [
          "---",
          "title: HTML",
          "---",
          "",
          '<p>A <a href="https://example.com">link</a>.</p>',
          "",
        ].join("\n"),
      );

      const catalog = await articleReferenceCatalog({
        articleDir: path.join(root, "src/content/articles"),
        generatedDate: "May 5, 2026",
        rootDir: root,
      });
      const statuses = catalog.articles.map((article) => article.status);

      expect(catalog.articles).toHaveLength(3);
      expect(statuses).toEqual([
        "clean",
        "mechanical-safe",
        "prose-links-only",
      ]);
      expect(formatArticleReferenceCatalog(catalog)).toContain(
        "| `src/content/articles/culture/html.md` | `mechanical-safe` |",
      );
      expect(formatArticleReferenceCatalog(catalog)).toContain(
        "ARTICLE_REFERENCE_MIGRATION_DECISIONS.md",
      );
    }));

  test("captures line-level review details without classifying prose links as citations", () => {
    const details = articleReferenceCatalogDetails(
      [
        "Claim.[^old]",
        "",
        "## References",
        "",
        "[^old]: Source.",
        '<a name="Top"></a>',
        '<a href="https://example.com">Example</a>',
        "Image source: archive",
      ].join("\n"),
    );

    expect(details.footnoteMarkers).toEqual([
      { line: 1, text: "Claim.[^old]" },
    ]);
    expect(details.referenceHeadings).toEqual([
      { line: 3, text: "## References" },
    ]);
    expect(details.footnoteDefinitions).toEqual([
      { line: 5, text: "[^old]: Source." },
    ]);
    expect(details.rawHtmlLinks).toHaveLength(2);
    expect(details.convertibleHtmlLinks).toEqual([
      { line: 7, text: '<a href="https://example.com">Example</a>' },
    ]);
    expect(details.mediaCreditLines).toEqual([
      { line: 8, text: "Image source: archive" },
    ]);
  });

  test("writes the catalog through the CLI", async () =>
    withTempRoot(async (root) => {
      await writeText(
        root,
        "src/content/articles/culture/example.md",
        "---\ntitle: Example\n---\n\nPlain prose.\n",
      );

      const exitCode = await runArticleReferenceCatalogCli(
        ["--write", "--quiet"],
        root,
      );

      expect(exitCode).toBe(0);
    }));
});
