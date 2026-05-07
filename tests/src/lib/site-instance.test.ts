import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, test } from "bun:test";

import { verifyContent } from "../../../scripts/content/verify-content";
import { parseSiteConfig } from "../../../src/lib/site-config";
import {
  projectRelativePath,
  resolveSiteInstancePaths,
} from "../../../src/lib/site-instance";

describe("site instance paths", () => {
  test("resolves the default in-repo site instance", () => {
    const paths = resolveSiteInstancePaths({ cwd: "/repo/platform" });

    expect(paths.root).toBe(path.join("/repo/platform", "site"));
    expect(paths.config.site).toBe(
      path.join("/repo/platform", "site", "config", "site.json"),
    );
    expect(paths.config.redirects).toBe(
      path.join("/repo/platform", "site", "config", "redirects.json"),
    );
    expect(paths.content.articles).toBe(
      path.join("/repo/platform", "site", "content", "articles"),
    );
    expect(paths.assets.shared).toBe(
      path.join("/repo/platform", "site", "assets", "shared"),
    );
    expect(paths.public).toBe(path.join("/repo/platform", "site", "public"));
  });

  test("resolves a sibling external instance root", () => {
    const paths = resolveSiteInstancePaths({
      cwd: "/repo/platform",
      siteInstanceRoot: "../example-site",
    });

    expect(paths.root).toBe(path.join("/repo", "example-site"));
    expect(paths.content.pages).toBe(
      path.join("/repo", "example-site", "content", "pages"),
    );
    expect(paths.unusedAssets).toBe(
      path.join("/repo", "example-site", "unused-assets"),
    );
  });

  test("treats blank instance roots as the default in-repo site", () => {
    const paths = resolveSiteInstancePaths({
      cwd: "/repo/platform",
      siteInstanceRoot: " ",
    });

    expect(paths.root).toBe(path.join("/repo/platform", "site"));
  });

  test("formats project-relative paths for author-facing messages", () => {
    expect(
      projectRelativePath("/repo/platform/site/content", "/repo/platform"),
    ).toBe("site/content");
  });

  test("verifies a non-TPM fixture site instance outside platform and live site roots", async () => {
    const paths = resolveSiteInstancePaths({
      cwd: process.cwd(),
      siteInstanceRoot: "tests/fixtures/site-instance",
    });
    const config = parseSiteConfig(
      JSON.parse(await readFile(paths.config.site, "utf8")),
    );
    const content = await verifyContent({
      articleDir: paths.content.articles,
      authorDir: paths.content.authors,
      categoryDir: paths.content.categories,
      rootDir: process.cwd(),
    });

    expect(paths.root).toBe(
      path.join(process.cwd(), "tests", "fixtures", "site-instance"),
    );
    expect(config.identity.title).toBe("Example Platform Site");
    expect(content.issues).toEqual([]);
  });
});
