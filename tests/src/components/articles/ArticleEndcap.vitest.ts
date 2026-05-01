import { describe, expect, test } from "vitest";

import ArticleEndcap from "../../../../src/components/articles/ArticleEndcap.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";
import { articleItems } from "./article-fixture";

describe("ArticleEndcap", () => {
  test("composes category discovery, related discovery, and support CTA", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(ArticleEndcap, {
      props: {
        categoryHref: "/categories/history/",
        categoryTitle: "History",
        idPrefix: "test-endcap",
        moreInCategory: articleItems,
        related: articleItems.slice(0, 1),
      },
    });

    expect(view).toContain("More in History");
    expect(view).toContain("Related Articles");
    expect(view).toContain("Support The Philosopher&#39;s Meme");
    expect(view).toContain('aria-label="Article support and discovery"');
    expect(view).toContain("test-endcap-support-heading");

    const supportIndex = view.indexOf("test-endcap-support-heading");
    const moreIndex = view.indexOf("test-endcap-more-in-category-heading");
    const relatedIndex = view.indexOf("test-endcap-related-articles-heading");

    expect(supportIndex).toBeGreaterThan(-1);
    expect(moreIndex).toBeGreaterThan(supportIndex);
    expect(relatedIndex).toBeGreaterThan(moreIndex);
  });
});
