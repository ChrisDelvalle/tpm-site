import { describe, expect, test } from "bun:test";

import type { ArticleEntry } from "../../../src/lib/routes";
import { absoluteUrl, articleBlogPostingJsonLd } from "../../../src/lib/seo";

function article(data: Partial<ArticleEntry["data"]> = {}): ArticleEntry {
  return {
    collection: "articles",
    data: {
      author: "Author",
      date: new Date("2022-01-01T00:00:00Z"),
      description: "Description",
      draft: false,
      tags: [],
      title: "Title",
      ...data,
    },
    id: "title",
  };
}

describe("SEO helpers", () => {
  test("normalizes relative, protocol-relative, and scheme URLs", () => {
    expect(absoluteUrl("articles/post/", "https://example.com/")).toBe(
      "https://example.com/articles/post/",
    );
    expect(absoluteUrl("//cdn.example.com/a.png", "https://example.com")).toBe(
      "//cdn.example.com/a.png",
    );
    expect(absoluteUrl("mailto:test@example.com", "https://example.com")).toBe(
      "mailto:test@example.com",
    );
  });

  test("omits image and category metadata when unavailable", () => {
    expect(
      articleBlogPostingJsonLd(article(), undefined, undefined),
    ).toMatchObject({
      articleSection: undefined,
      image: undefined,
      url: "https://thephilosophersmeme.com/articles/title/",
    });
  });
});
