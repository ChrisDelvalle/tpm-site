import path from "node:path";

import { describe, expect, test } from "bun:test";

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
    expect(projectRelativePath("/repo/platform/site/content", "/repo/platform"))
      .toBe("site/content");
  });
});
