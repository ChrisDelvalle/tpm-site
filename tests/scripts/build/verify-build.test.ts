import { describe, expect, test } from "bun:test";

import {
  formatBuildVerificationReport,
  isExternal,
  linkTargets,
  requiredPathsForSource,
} from "../../../scripts/build/verify-build";

describe("build verifier", () => {
  test("derives required built paths from source publication state", () => {
    expect(
      requiredPathsForSource(
        {
          draftSlugs: [],
          publishedArticles: [{ isMdx: false, slug: "post" }],
          publishedCategorySlugs: new Set(["history"]),
          publishedTagSegments: new Set(["meme history"]),
        },
        ["history"],
        ["site-news"],
      ),
    ).toContain("announcements/site-news/index.html");
    expect(
      requiredPathsForSource(
        {
          draftSlugs: [],
          publishedArticles: [{ isMdx: false, slug: "post" }],
          publishedCategorySlugs: new Set(["history"]),
          publishedTagSegments: new Set(["meme history"]),
        },
        ["history"],
      ),
    ).toContain("articles/post/index.html");
  });

  test("extracts local link targets and ignores external URLs", () => {
    expect(linkTargets('<a href="/articles/post/">Post</a>')).toEqual([
      "/articles/post/",
    ]);
    expect(isExternal("https://example.com")).toBe(true);
    expect(isExternal("/articles/post/")).toBe(false);
    expect(
      formatBuildVerificationReport({
        articlePageCount: 1,
        astroClientScriptCount: 0,
        issues: {
          articleCountIssues: [],
          brokenLinks: [],
          catalogLeaks: [],
          draftLeaks: [],
          invalidLegacyRedirects: [],
          missingArticleJsonLd: [],
          missingLegacyRedirects: [],
          missingRequired: [],
          sourceMaps: [],
          unexpectedHydrationBoundaries: [],
          unexpectedClientScripts: [],
          unexpectedDatedPages: [],
        },
      }),
    ).toContain("Build verification passed");
  });
});
