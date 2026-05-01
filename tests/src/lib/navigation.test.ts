import { describe, expect, test } from "bun:test";

import { categoryNavigationItems } from "../../../src/lib/navigation";
import { articleEntry, categorySummary } from "../../helpers/content";

describe("categoryNavigationItems", () => {
  test("opens the current category and maps article links", () => {
    const article = articleEntry({ id: "history-post" });
    const navigation = categoryNavigationItems(
      [categorySummary({ articles: [article], slug: "history" })],
      "/categories/history/",
    );

    expect(navigation).toEqual([
      {
        articles: [
          {
            title: "Sample Article",
            url: "/articles/history-post/",
          },
        ],
        isOpen: true,
        slug: "history",
        title: "History",
      },
    ]);
  });

  test("opens a category when the current article belongs to it", () => {
    const article = articleEntry({
      data: { title: "Article Title" },
      id: "article-title",
    });
    const [navigation] = categoryNavigationItems(
      [categorySummary({ articles: [article], slug: "history" })],
      "/articles/article-title/",
    );

    expect(navigation?.isOpen).toBe(true);
  });
});
