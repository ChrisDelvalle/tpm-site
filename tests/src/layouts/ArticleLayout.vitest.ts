import { describe, expect, test } from "vitest";

import ArticleLayout from "../../../src/layouts/ArticleLayout.astro";
import { getArticles } from "../../../src/lib/content";
import {
  createAstroTestContainer,
  testSiteUrl,
} from "../../helpers/astro-container";

describe("ArticleLayout", () => {
  test("renders article metadata and slotted prose content", async () => {
    const [article] = await getArticles();

    if (article === undefined) {
      throw new Error("Expected at least one article fixture from content.");
    }

    const container = await createAstroTestContainer();
    const view = await container.renderToString(ArticleLayout, {
      props: { article },
      request: new Request(`${testSiteUrl}/articles/${article.id}/`),
      slots: {
        default: "<p>Rendered article body.</p>",
      },
    });

    expect(view).toContain(article.data.title);
    expect(view).toContain("Rendered article body.");
    expect(view).toContain("application/ld+json");
  });
});
