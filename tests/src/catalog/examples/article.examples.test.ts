import { describe, expect, test } from "bun:test";

import { articleCatalogExamples } from "../../../../src/catalog/examples/article.examples";

describe("article catalog examples", () => {
  test("cover article components with stable component paths", () => {
    const paths = articleCatalogExamples.map(
      (example) => example.componentPath,
    );

    expect(paths).toContain("src/components/articles/ArticleHeader.astro");
    expect(paths).toContain("src/components/articles/ArticleShareMenu.astro");
    expect(paths).toContain("src/components/articles/ArticleList.astro");
    expect(paths).toContain("src/components/articles/CompactEntryList.astro");
    expect(paths).toContain("src/components/articles/CompactEntryRow.astro");
    expect(paths).toContain("src/components/articles/ArticleEndcap.astro");
    expect(paths).toContain("src/components/articles/NextArticleBlock.astro");
    expect(paths).toContain(
      "src/components/articles/ArticleTableOfContents.astro",
    );
    expect(paths).toContain(
      "src/components/articles/TableOfContentsItem.astro",
    );
    expect(paths).toContain(
      "src/components/articles/TableOfContentsToggle.astro",
    );
    expect(paths).toContain("src/components/blocks/SupportBlock.astro");
    expect(new Set(paths).size).toBe(paths.length);
  });
});
