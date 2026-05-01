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
    expect(view).toContain("test-endcap-support-heading");
  });
});
