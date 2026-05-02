import { describe, expect, test } from "bun:test";

import { authorCatalogExamples } from "../../../../src/catalog/examples/author.examples";

describe("author catalog examples", () => {
  test("cover author components with stable component paths", () => {
    const paths = authorCatalogExamples.map((example) => example.componentPath);

    expect(paths).toContain("src/components/authors/AuthorLink.astro");
    expect(paths).toContain("src/components/authors/AuthorByline.astro");
    expect(paths).toContain("src/components/authors/AuthorProfileHeader.astro");
    expect(paths).toContain("src/components/authors/AuthorPage.astro");
    expect(paths).toContain("src/components/authors/AuthorsIndexPage.astro");
    expect(new Set(paths).size).toBe(paths.length);
  });
});
