import { describe, expect, test } from "vitest";

import ArticleHeader from "../../../../src/components/articles/ArticleHeader.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("ArticleHeader", () => {
  test("renders article title, category, metadata, and description without tags", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(ArticleHeader, {
      props: {
        author: "Seong-Young Her",
        category: {
          href: "/categories/history/",
          title: "History",
        },
        citation: {
          articleId: "article-title",
          canonicalUrl: "https://example.com/articles/article-title/",
          formats: [
            {
              id: "bibtex",
              label: "BibTeX",
              text: "@online{article-title}",
            },
          ],
          title: "Article Title",
        },
        date: new Date("2022-04-06T23:58:10.000Z"),
        description: "Article description.",
        formattedDate: "April 6, 2022",
        title: "Article Title",
      },
    });

    expect(view).toContain("<h1");
    expect(view).toContain("Article Title");
    expect(view).toContain("/categories/history/");
    expect(view).toContain('data-astro-prefetch="hover"');
    expect(view).toContain("Cite this article");
    expect(view).toContain("Article description.");
    expect(view).not.toContain("Article tags");
  });
});
