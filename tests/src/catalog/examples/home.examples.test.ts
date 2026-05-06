import { describe, expect, test } from "bun:test";

import { homeCatalogExamples } from "../../../../src/catalog/examples/home.examples";

describe("home catalog examples", () => {
  test("cover homepage blocks with stable component paths", () => {
    const paths = homeCatalogExamples.map((example) => example.componentPath);

    expect(paths).toContain("src/components/articles/FlatArticleList.astro");
    expect(paths).toContain("src/components/articles/FlatArticleTeaser.astro");
    expect(paths).toContain("src/components/blocks/HomeHeroBlock.astro");
    expect(paths).toContain(
      "src/components/blocks/HomeLatestArticleBlock.astro",
    );
    expect(paths).toContain(
      "src/components/blocks/HomeCategoryOverviewBlock.astro",
    );
    expect(paths).toContain("src/components/blocks/HomeCurrentPanel.astro");
    expect(paths).toContain(
      "src/components/blocks/HomeDiscoveryLinksBlock.astro",
    );
    expect(paths).toContain("src/components/blocks/HomeFeaturedCarousel.astro");
    expect(paths).toContain("src/components/blocks/HomeFeaturedSlide.astro");
    expect(paths).toContain("src/components/blocks/HomeMastheadBlock.astro");
    expect(paths).toContain("src/components/blocks/HomeRecentPostsBlock.astro");
    expect(paths).toContain("src/components/blocks/HomeStartHerePanel.astro");
    expect(new Set(paths).size).toBe(paths.length);
  });
});
