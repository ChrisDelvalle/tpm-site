import { describe, expect, test } from "bun:test";

import {
  type ArticleEntry,
  articlesIndexUrl,
  articleUrl,
  categoriesIndexUrl,
  categorySlug,
  categoryUrl,
  entryTitle,
  feedUrl,
  formatDate,
  imageUrl,
  pageUrl,
  searchUrl,
  sortNewestFirst,
} from "../../../src/lib/routes";

function article(
  id: string,
  date: Date,
  data: Partial<ArticleEntry["data"]> = {},
): ArticleEntry {
  return {
    collection: "articles",
    data: {
      author: "Author",
      date,
      description: "Description",
      draft: false,
      tags: [],
      title: id,
      ...data,
    },
    filePath: `/repo/src/content/articles/history/${id}.md`,
    id,
  };
}

describe("route helpers", () => {
  test("builds stable public URLs with expected trailing slash behavior", () => {
    expect(articlesIndexUrl()).toBe("/articles/");
    expect(articleUrl("article-title")).toBe("/articles/article-title/");
    expect(categoriesIndexUrl()).toBe("/categories/");
    expect(categoryUrl("history")).toBe("/categories/history/");
    expect(pageUrl("About")).toBe("/about/");
    expect(searchUrl()).toBe("/search/");
    expect(feedUrl()).toBe("/feed.xml");
  });

  test("sorts newest first with stable slug tiebreakers", () => {
    const sameDate = new Date("2022-01-01T00:00:00Z");

    expect(
      sortNewestFirst([
        article("b", sameDate),
        article("a", sameDate),
        article("new", new Date("2023-01-01T00:00:00Z")),
      ]).map((entry) => entry.id),
    ).toEqual(["new", "a", "b"]);
  });

  test("handles invalid dates and image source variants", () => {
    expect(formatDate(new Date("invalid"))).toBe("");
    expect(
      imageUrl(
        article("image", new Date(), {
          image: { format: "png", height: 1, src: "/x.png", width: 1 },
        }),
      ),
    ).toBe("/x.png");
    expect(
      entryTitle(article("title", new Date(), { title: "A &amp; B" })),
    ).toBe("A & B");
  });

  test("derives empty category for files outside article folders", () => {
    const entry = article("orphan", new Date());
    entry.filePath = "orphan.md";

    expect(categorySlug(entry)).toBe("");
  });
});
