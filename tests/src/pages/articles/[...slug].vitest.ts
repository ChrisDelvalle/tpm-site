import { describe, expect, test } from "vitest";

import { getArticles } from "../../../../src/lib/content";
import ArticlePage from "../../../../src/pages/articles/[...slug].astro";
import {
  createAstroTestContainer,
  testSiteUrl,
} from "../../../helpers/astro-container";

describe("article page", () => {
  test("renders article content through the article layout", async () => {
    const [article] = await getArticles();

    if (article === undefined) {
      throw new Error("Expected at least one article fixture from content.");
    }

    const container = await createAstroTestContainer();
    const view = await container.renderToString(ArticlePage, {
      props: { article },
      request: new Request(`${testSiteUrl}/articles/${article.id}/`),
    });

    expect(view).toContain(article.data.title);
    expect(view).toContain("Article tags");
    expect(view).toContain("Support The Philosopher&#39;s Meme");
  });
});
