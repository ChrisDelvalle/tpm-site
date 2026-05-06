import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, spyOn, test } from "bun:test";

import {
  announcementPublicationStats,
  type ArticlePublication,
  articlePublicationStats,
  collectionPublicationStats,
  formatBuildVerificationReport,
  isExternal,
  linkTargets,
  requiredPathsForSource,
  runBuildVerificationCli,
  staticReadingPagesForSource,
  verifyBuild,
} from "../../../scripts/build/verify-build";

function publication(): ArticlePublication {
  return {
    draftSlugs: ["draft-post"],
    publishedArticles: [
      { isMdx: false, slug: "markdown-post" },
      { isMdx: true, slug: "interactive-post" },
    ],
    publishedCategorySlugs: new Set(["history"]),
    publishedTagSegments: new Set(["meme history"]),
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

const astroPrefetchRuntimeFixture =
  'document.querySelector("a")?.dataset.astroPrefetch; document.createElement("link").relList?.supports?.("prefetch"); const option = { ignoreSlowConnection: true }; navigator.connection; option.ignoreSlowConnection;';
const oxcNormalizedAstroPrefetchRuntimeFixture =
  "document.querySelector(`a`)?.dataset.astroPrefetch; document.createElement(`link`).relList?.supports?.(`prefetch`); const option = { ignoreSlowConnection: true }; navigator.connection; option.ignoreSlowConnection;";

describe("build verifier helpers", () => {
  test("derives required article, collection, and category paths from source content", () => {
    expect(requiredPathsForSource(publication(), ["history"])).toContain(
      "announcements/index.html",
    );
    expect(
      requiredPathsForSource(publication(), ["history"], ["site-news"]),
    ).toContain("announcements/site-news/index.html");
    expect(requiredPathsForSource(publication(), ["history"])).toContain(
      "articles/markdown-post/index.html",
    );
    expect(requiredPathsForSource(publication(), ["history"])).toContain(
      "articles/interactive-post/index.html",
    );
    expect(requiredPathsForSource(publication(), ["history"])).toContain(
      "articles/all/index.html",
    );
    expect(requiredPathsForSource(publication(), ["history"])).toContain(
      "categories/history/index.html",
    );
    expect(requiredPathsForSource(publication(), ["history"])).toContain(
      "collections/index.html",
    );
    expect(
      requiredPathsForSource(publication(), ["history"], [], ["featured"]),
    ).toContain("collections/featured/index.html");
    expect(requiredPathsForSource(publication(), ["history"])).toContain(
      "tags/meme history/index.html",
    );
  });

  test("sorts source article publication stats deterministically", async () =>
    withTempRoot(async (root) => {
      await writeText(
        root,
        "src/content/articles/history/z-post.md",
        "---\ntitle: Z\ntags:\n  - Meme History\n---\n",
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
      expect(Array.from(result.publishedTagSegments)).toEqual(["meme history"]);
    }));

  test("sorts source announcement publication stats deterministically", async () =>
    withTempRoot(async (root) => {
      await writeText(
        root,
        "src/content/announcements/z-news.md",
        "---\ntitle: Z\n---\n",
      );
      await writeText(
        root,
        "src/content/announcements/a-news.md",
        "---\ntitle: A\n---\n",
      );
      await writeText(
        root,
        "src/content/announcements/draft-news.md",
        "---\ntitle: Draft\ndraft: true\n---\n",
      );

      const result = await announcementPublicationStats(
        path.join(root, "src/content/announcements"),
      );

      expect(result.publishedSlugs).toEqual(["a-news", "z-news"]);
      expect(result.draftSlugs).toEqual(["draft-news"]);
    }));

  test("sorts source collection publication stats deterministically", async () =>
    withTempRoot(async (root) => {
      await writeText(
        root,
        "src/content/collections/z-list.md",
        "---\ntitle: Z\n---\n",
      );
      await writeText(
        root,
        "src/content/collections/a-list.md",
        "---\ntitle: A\n---\n",
      );
      await writeText(
        root,
        "src/content/collections/draft-list.md",
        "---\ntitle: Draft\ndraft: true\n---\n",
      );

      const result = await collectionPublicationStats(
        path.join(root, "src/content/collections"),
      );

      expect(result.publishedSlugs).toEqual(["a-list", "z-list"]);
      expect(result.draftSlugs).toEqual(["draft-list"]);
    }));

  test("chooses representative static pages without hardcoded migrated slugs", () => {
    expect(staticReadingPagesForSource(publication(), ["history"])).toEqual([
      "index.html",
      "about/index.html",
      "announcements/index.html",
      "articles/index.html",
      "articles/all/index.html",
      "bibliography/index.html",
      "collections/index.html",
      "tags/index.html",
      "articles/markdown-post/index.html",
      "categories/history/index.html",
      "tags/meme history/index.html",
    ]);
    expect(
      staticReadingPagesForSource(publication(), ["history"], ["site-news"]),
    ).toContain("announcements/site-news/index.html");
    expect(
      staticReadingPagesForSource(publication(), ["history"], [], ["featured"]),
    ).toContain("collections/featured/index.html");
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
          sourceMaps: [],
          unexpectedHydrationBoundaries: [],
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
        sourceMaps: ["_astro/index.js.map"],
        unexpectedHydrationBoundaries: ["articles/post/index.html"],
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
    expect(report).toContain("Unexpected source maps:");
    expect(report).toContain("Unexpected hydration boundaries:");
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
      await writeText(root, "dist/announcements/index.html", "");
      await writeText(root, "dist/articles/index.html", "");
      await writeText(root, "dist/articles/all/index.html", "");
      await writeText(root, "dist/bibliography/index.html", "");
      await writeText(
        root,
        "dist/articles/published/index.html",
        '{"@type":"BlogPosting"}',
      );
      await writeText(root, "dist/categories/index.html", "");
      await writeText(root, "dist/collections/index.html", "");
      await writeText(root, "dist/tags/index.html", "");
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
      await writeText(root, "dist/announcements/index.html", "");
      await writeText(root, "dist/articles/index.html", "");
      await writeText(root, "dist/articles/all/index.html", "");
      await writeText(root, "dist/bibliography/index.html", "");
      await writeText(
        root,
        "dist/articles/published/index.html",
        '{"@type":"BlogPosting"}',
      );
      await writeText(root, "dist/categories/index.html", "");
      await writeText(root, "dist/collections/index.html", "");
      await writeText(root, "dist/tags/index.html", "");
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
          await writeText(root, "dist/announcements/index.html", "");
          await writeText(root, "dist/articles/index.html", "");
          await writeText(root, "dist/articles/all/index.html", "");
          await writeText(root, "dist/bibliography/index.html", "");
          await writeText(
            root,
            "dist/articles/published/index.html",
            '{"@type":"BlogPosting"}',
          );
          await writeText(root, "dist/categories/index.html", "");
          await writeText(root, "dist/collections/index.html", "");
          await writeText(root, "dist/tags/index.html", "");
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
        "src/content/announcements/hidden-announcement.md",
        "---\ntitle: Draft Announcement\ndraft: true\n---\n",
      );

      await writeText(
        root,
        "dist/index.html",
        '<script src="/_astro/index.js"></script><script type="module" src="/_astro/page.Abc123.js"></script><script type="module" src="/_astro/page.Wrapper123.js"></script><script type="module" src="/_astro/page.NotPrefetch.js"></script><script type="module" src="/_astro/ArticleImageInspectorScript.astro_astro_type_script_index_0_lang.Abc123.js"></script><script type="module" src="/_astro/AnchoredRoot.astro_astro_type_script_index_0_lang.Abc123.js"></script><astro-island></astro-island><a href="/missing/">Missing</a><a href="relative">Relative</a>',
      );
      await writeText(root, "dist/_astro/index.js", "");
      await writeText(
        root,
        "dist/_astro/page.Abc123.js",
        astroPrefetchRuntimeFixture,
      );
      await writeText(
        root,
        "dist/_astro/page.Wrapper123.js",
        'import{i}from"./_astro_prefetch.Abc123.js";i();',
      );
      await writeText(
        root,
        "dist/_astro/_astro_prefetch.Abc123.js",
        oxcNormalizedAstroPrefetchRuntimeFixture,
      );
      await writeText(root, "dist/_astro/page.NotPrefetch.js", "alert(1);");
      await writeText(
        root,
        "dist/_astro/ArticleImageInspectorScript.astro_astro_type_script_index_0_lang.Abc123.js",
        "",
      );
      await writeText(
        root,
        "dist/_astro/AnchoredRoot.astro_astro_type_script_index_0_lang.Abc123.js",
        "",
      );
      await writeText(root, "dist/_astro/index.js.map", "");
      await writeText(root, "dist/404.html", "");
      await writeText(root, "dist/about/index.html", "");
      await writeText(root, "dist/announcements/index.html", "");
      await writeText(root, "dist/articles/index.html", "");
      await writeText(root, "dist/articles/all/index.html", "");
      await writeText(root, "dist/bibliography/index.html", "");
      await writeText(
        root,
        "dist/articles/published/index.html",
        '<script type="module" src="/_astro/ArticleImageInspectorScript.astro_astro_type_script_index_0_lang.Abc123.js"></script><a href="#local">Article without JSON-LD</a>',
      );
      await writeText(root, "dist/articles/extra/index.html", "");
      await writeText(root, "dist/categories/index.html", "");
      await writeText(root, "dist/collections/index.html", "");
      await writeText(root, "dist/tags/index.html", "");
      await writeText(root, "dist/feed.xml", "<feed>draft</feed>");
      await writeText(
        root,
        "dist/sitemap-index.xml",
        "<sitemap>hidden-announcement</sitemap>",
      );
      await writeText(root, "dist/pagefind/pagefind.js", "");

      const result = await verifyBuild({
        announcementDir: path.join(root, "src/content/announcements"),
        articleDir: path.join(root, "src/content/articles"),
        categoryDir: path.join(root, "src/content/categories"),
        distDir: path.join(root, "dist"),
      });

      expect(result.issues.articleCountIssues).toEqual([
        "expected 1 article pages from published source content, found 2",
      ]);
      expect(result.issues.brokenLinks).toEqual(["index.html -> /missing/"]);
      expect(result.issues.draftLeaks).toEqual([
        "feed.xml -> draft",
        "sitemap-index.xml -> hidden-announcement",
      ]);
      expect(result.issues.missingArticleJsonLd).toEqual([
        "articles/extra/index.html",
        "articles/published/index.html",
      ]);
      expect(result.issues.missingRequired).toContain(
        "categories/history/index.html",
      );
      expect(result.issues.sourceMaps).toEqual(["_astro/index.js.map"]);
      expect(result.issues.unexpectedHydrationBoundaries).toEqual([
        "index.html",
      ]);
      expect(result.issues.unexpectedClientScripts).toEqual([
        "index.html -> /_astro/index.js, /_astro/page.NotPrefetch.js, /_astro/ArticleImageInspectorScript.astro_astro_type_script_index_0_lang.Abc123.js",
      ]);
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
          await writeText(root, "dist/articles/all/index.html", "");
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
      await writeText(root, "dist/announcements/index.html", "");
      await writeText(root, "dist/articles", "not a directory");
      await writeText(root, "dist/bibliography/index.html", "");
      await writeText(root, "dist/categories/index.html", "");
      await writeText(root, "dist/collections/index.html", "");
      await writeText(root, "dist/tags/index.html", "");
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
      await writeText(root, "dist/announcements/index.html", "");
      await writeText(root, "dist/articles/index.html", "");
      await writeText(root, "dist/articles/all/index.html", "");
      await writeText(root, "dist/bibliography/index.html", "");
      await writeText(
        root,
        "dist/articles/published/index.html",
        '{"@type":"BlogPosting"}',
      );
      await writeText(root, "dist/categories/index.html", "");
      await writeText(root, "dist/collections/index.html", "");
      await writeText(root, "dist/tags/index.html", "");
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
      await writeText(root, "dist/announcements/index.html", "");
      await writeText(root, "dist/articles/index.html", "");
      await writeText(root, "dist/articles/all/index.html", "");
      await writeText(root, "dist/bibliography/index.html", "");
      await writeText(
        root,
        "dist/articles/published/index.html",
        '{"@type":"BlogPosting"}',
      );
      await writeText(root, "dist/categories/index.html", "");
      await writeText(root, "dist/collections/index.html", "");
      await writeText(root, "dist/tags/index.html", "");
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
      await writeText(root, "dist/announcements/index.html", "");
      await writeText(root, "dist/articles/index.html", "");
      await writeText(root, "dist/articles/all/index.html", "");
      await writeText(root, "dist/bibliography/index.html", "");
      await writeText(
        root,
        "dist/articles/published/index.html",
        '{"@type":"BlogPosting"}',
      );
      await writeText(root, "dist/categories/index.html", "");
      await writeText(root, "dist/collections/index.html", "");
      await writeText(root, "dist/tags/index.html", "");
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
      await writeText(root, "dist/announcements/index.html", "");
      await writeText(root, "dist/articles/index.html", "");
      await writeText(root, "dist/articles/all/index.html", "");
      await writeText(root, "dist/bibliography/index.html", "");
      await writeText(
        root,
        "dist/articles/published/index.html",
        '{"@type":"BlogPosting"}',
      );
      await writeText(root, "dist/categories/index.html", "");
      await writeText(root, "dist/collections/index.html", "");
      await writeText(root, "dist/tags/index.html", "");
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
      await writeText(root, "dist/announcements/index.html", "");
      await writeText(root, "dist/articles/index.html", "");
      await writeText(root, "dist/articles/all/index.html", "");
      await writeText(root, "dist/bibliography/index.html", "");
      await writeText(
        root,
        "dist/articles/published/index.html",
        '{"@type":"BlogPosting"}',
      );
      await writeText(root, "dist/categories/index.html", "");
      await writeText(root, "dist/collections/index.html", "");
      await writeText(root, "dist/tags/index.html", "");
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
