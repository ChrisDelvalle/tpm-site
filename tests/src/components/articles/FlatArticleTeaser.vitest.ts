import { describe, expect, test } from "vitest";

import FlatArticleTeaser from "../../../../src/components/articles/FlatArticleTeaser.astro";
import {
  createAstroTestContainer,
  testSiteUrl,
} from "../../../helpers/astro-container";

describe("FlatArticleTeaser", () => {
  test("renders a compact article link with category, date, and author metadata", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(FlatArticleTeaser, {
      props: {
        item: {
          author: "Author",
          category: { href: "/categories/culture/", title: "Culture" },
          date: "May 5, 2026",
          href: "/articles/first/",
          title: "First Article",
        },
      },
      request: new Request(`${testSiteUrl}/`),
    });

    expect(view).toContain("data-flat-article-teaser");
    expect(view).toContain("First Article");
    expect(view).toContain("/articles/first/");
    expect(view).toContain("Culture");
    expect(view).toContain("May 5, 2026");
    expect(view).toContain("Author");
  });

  test("omits the metadata row when no metadata is available", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(FlatArticleTeaser, {
      props: {
        item: {
          href: "/articles/plain/",
          title: "Plain Article",
        },
      },
      request: new Request(`${testSiteUrl}/`),
    });

    expect(view).toContain("Plain Article");
    expect(view).not.toContain("data-flat-article-teaser-meta");
  });
});
