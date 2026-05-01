import { describe, expect, test } from "vitest";

import ArticleJsonLd from "../../../../src/components/seo/ArticleJsonLd.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";
import { articleEntry, categorySummary } from "../../../helpers/content";

describe("ArticleJsonLd", () => {
  test("renders BlogPosting JSON-LD for article metadata", async () => {
    const article = articleEntry({
      data: {
        author: "Seong-Young Her",
        description: "Article description.",
        title: "Article Title",
      },
      id: "article-title",
    });
    const container = await createAstroTestContainer();
    const view = await container.renderToString(ArticleJsonLd, {
      props: {
        article,
        category: categorySummary({ articles: [article] }),
      },
    });

    expect(view).toContain('type="application/ld+json"');
    expect(view).toContain('"@type":"BlogPosting"');
    expect(view).toContain('"headline":"Article Title"');
  });
});
