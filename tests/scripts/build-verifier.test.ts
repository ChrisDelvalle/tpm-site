import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, test } from "bun:test";

import {
  type ArticlePublication,
  formatBuildVerificationReport,
  isExternal,
  linkTargets,
  requiredPathsForSource,
  staticReadingPagesForSource,
  verifyBuild,
} from "../../scripts/verify-build";

async function withTempRoot<T>(callback: (root: string) => Promise<T>) {
  const root = await mkdtemp(path.join(tmpdir(), "tpm-build-test-"));

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

function publication(): ArticlePublication {
  return {
    draftSlugs: ["draft-post"],
    publishedArticles: [
      { isMdx: false, slug: "markdown-post" },
      { isMdx: true, slug: "interactive-post" },
    ],
    publishedCategorySlugs: new Set(["history"]),
  };
}

describe("build verifier helpers", () => {
  test("derives required article and category paths from source content", () => {
    expect(requiredPathsForSource(publication(), ["history"])).toContain(
      "articles/markdown-post/index.html",
    );
    expect(requiredPathsForSource(publication(), ["history"])).toContain(
      "articles/interactive-post/index.html",
    );
    expect(requiredPathsForSource(publication(), ["history"])).toContain(
      "categories/history/index.html",
    );
  });

  test("chooses representative static pages without hardcoded migrated slugs", () => {
    expect(staticReadingPagesForSource(publication(), ["history"])).toEqual([
      "index.html",
      "about/index.html",
      "articles/index.html",
      "articles/markdown-post/index.html",
      "categories/history/index.html",
    ]);
  });

  test("extracts href and src link targets from built HTML", () => {
    expect(
      linkTargets(
        '<a href="/articles/example/">Example</a><img src="/_astro/image.webp">',
      ),
    ).toEqual(["/articles/example/", "/_astro/image.webp"]);
  });

  test("recognizes external URLs that should not be checked as local files", () => {
    expect(isExternal("https://example.com")).toBe(true);
    expect(isExternal("//cdn.example.com/image.png")).toBe(true);
    expect(isExternal("mailto:test@example.com")).toBe(true);
    expect(isExternal("/articles/example/")).toBe(false);
  });

  test("formats concise failure output", () => {
    expect(
      formatBuildVerificationReport({
        articlePageCount: 0,
        astroClientScriptCount: 0,
        issues: {
          articleCountIssues: ["expected 1 article page, found 0"],
          brokenLinks: [],
          draftLeaks: [],
          invalidLegacyRedirects: [],
          missingArticleJsonLd: [],
          missingLegacyRedirects: [],
          missingRequired: ["articles/example/index.html"],
          unexpectedClientScripts: [],
          unexpectedDatedPages: [],
        },
      }),
    ).toContain("Build verification failed.");
  });

  test("verifies built output against source articles and categories", async () =>
    withTempRoot(async (root) => {
      await writeText(root, "src/content/categories/history.json", "{}");
      await writeText(
        root,
        "src/content/articles/history/published.md",
        "---\ntitle: Published\n---\n",
      );
      await writeText(
        root,
        "src/content/articles/history/draft.md",
        "---\ntitle: Draft\ndraft: true\n---\n",
      );

      await writeText(
        root,
        "dist/index.html",
        '<a href="/articles/published/">Published</a>',
      );
      await writeText(root, "dist/404.html", "");
      await writeText(root, "dist/about/index.html", "");
      await writeText(root, "dist/articles/index.html", "");
      await writeText(
        root,
        "dist/articles/published/index.html",
        '{"@type":"BlogPosting"}',
      );
      await writeText(root, "dist/categories/index.html", "");
      await writeText(root, "dist/categories/history/index.html", "");
      await writeText(root, "dist/feed.xml", "<feed>published</feed>");
      await writeText(root, "dist/sitemap-index.xml", "<sitemap />");
      await writeText(root, "dist/pagefind/pagefind.js", "");

      const result = await verifyBuild({
        articleDir: path.join(root, "src/content/articles"),
        categoryDir: path.join(root, "src/content/categories"),
        distDir: path.join(root, "dist"),
      });

      expect(result.articlePageCount).toBe(1);
      expect(formatBuildVerificationReport(result)).toContain(
        "Build verification passed",
      );
    }));

  test("allows Astro generated dated redirect fallback pages", async () =>
    withTempRoot(async (root) => {
      await writeText(root, "src/content/categories/history.json", "{}");
      await writeText(
        root,
        "src/content/articles/history/published.md",
        "---\ntitle: Published\n---\n",
      );
      await writeText(
        root,
        "src/content/articles/history/draft.md",
        "---\ntitle: Draft\ndraft: true\n---\n",
      );

      await writeText(root, "dist/index.html", "");
      await writeText(root, "dist/404.html", "");
      await writeText(root, "dist/about/index.html", "");
      await writeText(root, "dist/articles/index.html", "");
      await writeText(
        root,
        "dist/articles/published/index.html",
        '{"@type":"BlogPosting"}',
      );
      await writeText(root, "dist/categories/index.html", "");
      await writeText(root, "dist/categories/history/index.html", "");
      await writeText(root, "dist/feed.xml", "<feed>published</feed>");
      await writeText(root, "dist/sitemap-index.xml", "<sitemap />");
      await writeText(root, "dist/pagefind/pagefind.js", "");
      await writeText(
        root,
        "dist/2022/04/20/draft/index.html",
        '<!doctype html><title>Redirecting to: /articles/draft/</title><meta http-equiv="refresh" content="0;url=/articles/draft/"><meta name="robots" content="noindex"><link rel="canonical" href="https://thephilosophersmeme.com/articles/draft/"><body><a href="/articles/draft/">Redirecting from <code>/2022/04/20/draft/</code> to <code>/articles/draft/</code></a></body>',
      );

      const result = await verifyBuild({
        articleDir: path.join(root, "src/content/articles"),
        categoryDir: path.join(root, "src/content/categories"),
        distDir: path.join(root, "dist"),
        expectedRedirects: {
          "/2022/04/20/draft/": "/articles/draft/",
        },
      });

      expect(result.issues.brokenLinks).toEqual([]);
      expect(result.issues.unexpectedDatedPages).toEqual([]);
    }));

  test("rejects dated pages that are not Astro redirect fallbacks", async () =>
    withTempRoot(async (root) => {
      await writeText(root, "src/content/categories/history.json", "{}");
      await writeText(
        root,
        "src/content/articles/history/published.md",
        "---\ntitle: Published\n---\n",
      );

      await writeText(root, "dist/index.html", "");
      await writeText(root, "dist/404.html", "");
      await writeText(root, "dist/about/index.html", "");
      await writeText(root, "dist/articles/index.html", "");
      await writeText(
        root,
        "dist/articles/published/index.html",
        '{"@type":"BlogPosting"}',
      );
      await writeText(root, "dist/categories/index.html", "");
      await writeText(root, "dist/categories/history/index.html", "");
      await writeText(root, "dist/feed.xml", "<feed>published</feed>");
      await writeText(root, "dist/sitemap-index.xml", "<sitemap />");
      await writeText(root, "dist/pagefind/pagefind.js", "");
      await writeText(
        root,
        "dist/2022/04/20/not-a-redirect/index.html",
        "<html><body>Unexpected page</body></html>",
      );

      const result = await verifyBuild({
        articleDir: path.join(root, "src/content/articles"),
        categoryDir: path.join(root, "src/content/categories"),
        distDir: path.join(root, "dist"),
      });

      expect(result.issues.unexpectedDatedPages).toEqual([
        "2022/04/20/not-a-redirect/index.html",
      ]);
    }));

  test("rejects redirect fallback pages that do not match configured redirects", async () =>
    withTempRoot(async (root) => {
      await writeText(root, "src/content/categories/history.json", "{}");
      await writeText(
        root,
        "src/content/articles/history/published.md",
        "---\ntitle: Published\n---\n",
      );

      await writeText(root, "dist/index.html", "");
      await writeText(root, "dist/404.html", "");
      await writeText(root, "dist/about/index.html", "");
      await writeText(root, "dist/articles/index.html", "");
      await writeText(
        root,
        "dist/articles/published/index.html",
        '{"@type":"BlogPosting"}',
      );
      await writeText(root, "dist/categories/index.html", "");
      await writeText(root, "dist/categories/history/index.html", "");
      await writeText(root, "dist/feed.xml", "<feed>published</feed>");
      await writeText(root, "dist/sitemap-index.xml", "<sitemap />");
      await writeText(root, "dist/pagefind/pagefind.js", "");
      await writeText(
        root,
        "dist/2022/04/20/published/index.html",
        '<!doctype html><title>Redirecting to: /articles/wrong/</title><meta http-equiv="refresh" content="0;url=/articles/wrong/"><meta name="robots" content="noindex"><link rel="canonical" href="https://thephilosophersmeme.com/articles/wrong/"><body><a href="/articles/wrong/">Redirecting from <code>/2022/04/20/published/</code> to <code>/articles/wrong/</code></a></body>',
      );

      const result = await verifyBuild({
        articleDir: path.join(root, "src/content/articles"),
        categoryDir: path.join(root, "src/content/categories"),
        distDir: path.join(root, "dist"),
        expectedRedirects: {
          "/2022/04/20/published/": "/articles/published/",
        },
      });

      expect(result.issues.invalidLegacyRedirects).toEqual([
        "2022/04/20/published/index.html: does not match configured redirect /2022/04/20/published/ -> /articles/published/",
      ]);
    }));

  test("reports configured redirects missing from built output", async () =>
    withTempRoot(async (root) => {
      await writeText(root, "src/content/categories/history.json", "{}");
      await writeText(
        root,
        "src/content/articles/history/published.md",
        "---\ntitle: Published\n---\n",
      );

      await writeText(root, "dist/index.html", "");
      await writeText(root, "dist/404.html", "");
      await writeText(root, "dist/about/index.html", "");
      await writeText(root, "dist/articles/index.html", "");
      await writeText(
        root,
        "dist/articles/published/index.html",
        '{"@type":"BlogPosting"}',
      );
      await writeText(root, "dist/categories/index.html", "");
      await writeText(root, "dist/categories/history/index.html", "");
      await writeText(root, "dist/feed.xml", "<feed>published</feed>");
      await writeText(root, "dist/sitemap-index.xml", "<sitemap />");
      await writeText(root, "dist/pagefind/pagefind.js", "");

      const result = await verifyBuild({
        articleDir: path.join(root, "src/content/articles"),
        categoryDir: path.join(root, "src/content/categories"),
        distDir: path.join(root, "dist"),
        expectedRedirects: {
          "/2022/04/20/published/": "/articles/published/",
        },
      });

      expect(result.issues.missingLegacyRedirects).toEqual([
        "/2022/04/20/published/ -> /articles/published/ (2022/04/20/published/index.html)",
      ]);
    }));
});
