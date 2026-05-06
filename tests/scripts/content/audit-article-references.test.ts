import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, test } from "bun:test";

import {
  auditArticleReferences,
  formatArticleReferenceAudit,
  runArticleReferenceAuditCli,
} from "../../../scripts/content/audit-article-references";

async function withTempRoot<T>(callback: (root: string) => Promise<T>) {
  const root = await mkdtemp(path.join(tmpdir(), "tpm-reference-audit-test-"));

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

describe("article reference corpus audit", () => {
  test("inventories canonical references without requiring manual review", async () =>
    withTempRoot(async (root) => {
      await writeText(
        root,
        "src/content/articles/culture/canonical.md",
        [
          "---",
          "title: Canonical",
          "---",
          "",
          "Claim.[^cite-source] Aside.[^note-context]",
          "",
          "[^note-context]: Explanatory note.",
          "",
          "```tpm-bibtex",
          "@article{source, title = {Source}}",
          "```",
          "",
          "A prose [link](https://example.com) stays only inventoried.",
          "",
        ].join("\n"),
      );

      const result = await auditArticleReferences({
        articleDir: path.join(root, "src/content/articles"),
        rootDir: root,
      });

      expect(result.manualReviewCount).toBe(0);
      expect(result.articles[0]?.patterns).toContain(
        "canonical citation markers: 1",
      );
      expect(result.articles[0]?.patterns).toContain(
        "hidden tpm-bibtex blocks: 1",
      );
      expect(result.articles[0]?.patterns).toContain("markdown links: 1");
    }));

  test("flags legacy citation-like structures for manual review", async () =>
    withTempRoot(async (root) => {
      await writeText(
        root,
        "src/content/articles/culture/legacy.md",
        [
          "---",
          "title: Legacy",
          "---",
          "",
          "Legacy footnote.[^old-source]",
          "",
          "## References",
          "",
          "[^old-source]: Legacy source.",
          "[1] Bibliography-shaped line.",
          '<a href="https://web.archive.org/example">Archive</a>',
          "Source: https://example.com/image",
          "",
          "```bibtex",
          "@article{visible, title = {Visible}}",
          "```",
          "",
        ].join("\n"),
      );

      const result = await auditArticleReferences({
        articleDir: path.join(root, "src/content/articles"),
        rootDir: root,
      });
      const article = result.articles[0];

      expect(result.manualReviewCount).toBe(1);
      expect(article?.manualReviewPatterns).toEqual([
        "noncanonical footnote definitions: 1",
        "noncanonical footnote markers: 1",
        "reference-section headings: 1",
        "visible bibtex fences: 1",
        "raw HTML links: 1",
        "media/source credit lines: 1",
        "bracket-style reference lines: 1",
      ]);
      expect(article?.patterns).toContain("archive links: 2");
      expect(article?.patterns).toContain("raw URLs: 2");
    }));

  test("formats deterministic Markdown and supports quiet CLI mode", async () =>
    withTempRoot(async (root) => {
      await writeText(
        root,
        "src/content/articles/culture/example.md",
        "---\ntitle: Example\n---\n\n## Source List\n",
      );

      const result = await auditArticleReferences({
        articleDir: path.join(root, "src/content/articles"),
        rootDir: root,
      });
      const report = formatArticleReferenceAudit(result);
      const exitCode = await runArticleReferenceAuditCli(["--quiet"], root);

      expect(exitCode).toBe(0);
      expect(report).toContain("| `src/content/articles/culture/example.md` |");
      expect(report).toContain("reference-section headings: 1");
      expect(report).toContain("- articleCount: 1");
    }));

  test("treats common bibliography-like heading variants as manual review", async () =>
    withTempRoot(async (root) => {
      await writeText(
        root,
        "src/content/articles/culture/source-list.md",
        [
          "---",
          "title: Source List",
          "---",
          "",
          "## Reference",
          "## Source",
          "## Source List",
          "## Further Reading",
          "## Works Consulted",
          "## Citations",
          "",
        ].join("\n"),
      );

      const result = await auditArticleReferences({
        articleDir: path.join(root, "src/content/articles"),
        rootDir: root,
      });

      expect(result.manualReviewCount).toBe(1);
      expect(result.articles[0]?.manualReviewPatterns).toEqual([
        "reference-section headings: 6",
      ]);
    }));
});
