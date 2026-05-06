import { readFile } from "node:fs/promises";

import { describe, expect, test } from "bun:test";

describe("global article print styles", () => {
  test("declares the PDF rendering contract selectors", async () => {
    const css = await readFile("src/styles/global.css", "utf8");

    expect(css).toContain("@media print");
    expect(css).toContain("@page");
    expect(css).toContain("[data-site-header]");
    expect(css).toContain("[data-pdf-exclude]");
    expect(css).toContain("[data-article-pdf-disclaimer]");
    expect(css).toContain('[data-article-toc-placement="inline"]');
    expect(css).toContain("[data-article-image-inspect-affordance]");
    expect(css).toContain("[data-article-embed-fallback]");
    expect(css).toContain("[data-article-image-fallback]");
    expect(css).toContain("[data-article-references]");
  });
});
