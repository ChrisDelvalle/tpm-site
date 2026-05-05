import { describe, expect, test } from "vitest";

import ArticleCitationMenu from "../../../../src/components/articles/ArticleCitationMenu.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("ArticleCitationMenu", () => {
  test("renders selectable generated citations with copy buttons", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(ArticleCitationMenu, {
      props: {
        citation: {
          articleId: "article-title",
          canonicalUrl: "https://example.com/articles/article-title/",
          formats: [
            {
              id: "bibtex",
              label: "BibTeX",
              text: "@online{article-title}",
            },
            {
              id: "mla",
              label: "MLA",
              text: '"Article Title." The Philosopher\'s Meme.',
            },
          ],
          title: "Article Title",
        },
      },
    });

    expect(view).toContain("Cite this article");
    expect(view).toContain("lucide-quote");
    expect(view).toContain("lucide-copy");
    expect(view).toContain("data-article-citation-menu");
    expect(view).toContain("data-article-citation-text");
    expect(view).toContain("@online{article-title}");
    expect(view).toMatch(
      /data-article-citation-text[^>]*>@online\{article-title\}<\/textarea>/u,
    );
    expect(view).toContain("Copy BibTeX citation");
    expect(view).toContain("Copy MLA citation");
  });
});
