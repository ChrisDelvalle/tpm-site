import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, spyOn, test } from "bun:test";

import {
  type ArticlePublication,
  articlePublicationStats,
  formatBuildVerificationReport,
  isExternal,
  linkTargets,
  requiredPathsForSource,
  runBuildVerificationCli,
  staticReadingPagesForSource,
  verifyBuild,
} from "../../scripts/verify-build";

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

  test("sorts source article publication stats deterministically", async () =>
    withTempRoot(async (root) => {
      await writeText(
        root,
        "src/content/articles/history/z-post.md",
        "---\ntitle: Z\n---\n",
      );
      await writeText(
        root,
        "src/content/articles/history/a-post.md",
        "---\ntitle: A\n---\n",
      );

      const result = await articlePublicationStats(
        path.join(root, "src/content/articles"),
      );

      expect(result.publishedArticles.map((article) => article.slug)).toEqual([
        "a-post",
        "z-post",
      ]);
    }));

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
          catalogLeaks: [],
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

  test("formats each build verification issue section", () => {
    const report = formatBuildVerificationReport({
      articlePageCount: 2,
      astroClientScriptCount: 1,
      issues: {
        articleCountIssues: ["expected 1 article page, found 2"],
        brokenLinks: ["index.html -> /missing/"],
        catalogLeaks: ["catalog/"],
        draftLeaks: ["feed.xml -> draft-post"],
        invalidLegacyRedirects: ["2022/01/01/post/index.html: invalid"],
        missingArticleJsonLd: ["articles/post/index.html"],
        missingLegacyRedirects: ["/2022/01/01/post/ -> /articles/post/"],
        missingRequired: ["feed.xml"],
        unexpectedClientScripts: ["index.html"],
        unexpectedDatedPages: ["2022/01/01/post/index.html"],
      },
    });

    expect(report).toContain("Missing:");
    expect(report).toContain("Missing legacy redirects:");
    expect(report).toContain("Invalid legacy redirects:");
    expect(report).toContain("Broken links:");
    expect(report).toContain("Unexpected component catalog output:");
    expect(report).toContain("Article count mismatch:");
    expect(report).toContain("Unexpected static-page client scripts:");
    expect(report).toContain("Unexpected generated dated pages:");
    expect(report).toContain("Draft content leaked into generated metadata:");
    expect(report).toContain("Missing article JSON-LD:");
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

  test("fails normal build verification when private catalog output is present", async () =>
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
      await writeText(root, "dist/catalog/index.html", "catalog");

      const result = await verifyBuild({
        articleDir: path.join(root, "src/content/articles"),
        categoryDir: path.join(root, "src/content/categories"),
        distDir: path.join(root, "dist"),
      });

      expect(result.issues.catalogLeaks).toEqual(["catalog/"]);
    }));

  test.serial(
    "prints a quiet success from the command-line workflow",
    async () =>
      withTempRoot(async (root) => {
        const log = spyOn(console, "log").mockImplementation(() => undefined);

        try {
          await writeText(root, "astro.config.ts", "export default {};\n");
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

          const exitCode = await runBuildVerificationCli(["--quiet"], root);

          expect(exitCode).toBe(0);
          expect(log.mock.calls).toHaveLength(0);

          const loggedExitCode = await runBuildVerificationCli([], root);

          expect(loggedExitCode).toBe(0);
          expect(String(log.mock.calls[0]?.[0])).toContain(
            "Build verification passed",
          );
        } finally {
          log.mockRestore();
        }
      }),
  );

  test("reports generated output regressions without hardcoded article counts", async () =>
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
        '<script src="/_astro/index.js"></script><a href="/missing/">Missing</a><a href="relative">Relative</a>',
      );
      await writeText(root, "dist/_astro/index.js", "");
      await writeText(root, "dist/404.html", "");
      await writeText(root, "dist/about/index.html", "");
      await writeText(root, "dist/articles/index.html", "");
      await writeText(
        root,
        "dist/articles/published/index.html",
        '<a href="#local">Article without JSON-LD</a>',
      );
      await writeText(root, "dist/articles/extra/index.html", "");
      await writeText(root, "dist/categories/index.html", "");
      await writeText(root, "dist/feed.xml", "<feed>draft</feed>");
      await writeText(root, "dist/sitemap-index.xml", "<sitemap />");
      await writeText(root, "dist/pagefind/pagefind.js", "");

      const result = await verifyBuild({
        articleDir: path.join(root, "src/content/articles"),
        categoryDir: path.join(root, "src/content/categories"),
        distDir: path.join(root, "dist"),
      });

      expect(result.issues.articleCountIssues).toEqual([
        "expected 1 article pages from published source content, found 2",
      ]);
      expect(result.issues.brokenLinks).toEqual(["index.html -> /missing/"]);
      expect(result.issues.draftLeaks).toEqual(["feed.xml -> draft"]);
      expect(result.issues.missingArticleJsonLd).toEqual([
        "articles/extra/index.html",
        "articles/published/index.html",
      ]);
      expect(result.issues.missingRequired).toContain(
        "categories/history/index.html",
      );
      expect(result.issues.unexpectedClientScripts).toEqual(["index.html"]);
    }));

  test.serial(
    "prints build verification failures from the command-line workflow",
    async () =>
      withTempRoot(async (root) => {
        const error = spyOn(console, "error").mockImplementation(
          () => undefined,
        );

        try {
          await writeText(root, "astro.config.ts", "export default {};\n");
          await writeText(root, "src/content/categories/history.json", "{}");
          await writeText(
            root,
            "src/content/articles/history/published.md",
            "---\ntitle: Published\n---\n",
          );
          await writeText(root, "dist/index.html", "");
          await writeText(root, "dist/articles/index.html", "");
          await writeText(root, "dist/articles/published/index.html", "");

          const exitCode = await runBuildVerificationCli(["--quiet"], root);

          expect(exitCode).toBe(1);
          expect(String(error.mock.calls[0]?.[0])).toContain(
            "Build verification failed",
          );
        } finally {
          error.mockRestore();
        }
      }),
  );

  test("reports when the articles output path is not a directory", async () =>
    withTempRoot(async (root) => {
      await writeText(root, "src/content/categories/history.json", "{}");
      await writeText(root, "src/content/articles/.keep", "");
      await writeText(root, "dist/index.html", "");
      await writeText(root, "dist/404.html", "");
      await writeText(root, "dist/about/index.html", "");
      await writeText(root, "dist/articles", "not a directory");
      await writeText(root, "dist/categories/index.html", "");
      await writeText(root, "dist/categories/history/index.html", "");
      await writeText(root, "dist/feed.xml", "<feed />");
      await writeText(root, "dist/sitemap-index.xml", "<sitemap />");
      await writeText(root, "dist/pagefind/pagefind.js", "");

      const result = await verifyBuild({
        articleDir: path.join(root, "src/content/articles"),
        categoryDir: path.join(root, "src/content/categories"),
        distDir: path.join(root, "dist"),
      });

      expect(result.issues.missingRequired).toContain("articles/");
    }));

  test("rejects redirect fallback pages without matching configured redirects", async () =>
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
        '<!doctype html><title>Redirecting to: /articles/published/</title><meta http-equiv="refresh" content="0;url=/articles/published/"><meta name="robots" content="noindex"><link rel="canonical" href="https://thephilosophersmeme.com/articles/published/"><body><a href="/articles/published/">Redirecting from <code>/2022/04/20/published/</code> to <code>/articles/published/</code></a></body>',
      );

      const result = await verifyBuild({
        articleDir: path.join(root, "src/content/articles"),
        categoryDir: path.join(root, "src/content/categories"),
        distDir: path.join(root, "dist"),
      });

      expect(result.issues.invalidLegacyRedirects).toEqual([
        "2022/04/20/published/index.html: no matching redirect in astro.config.ts for /2022/04/20/published/",
      ]);
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
