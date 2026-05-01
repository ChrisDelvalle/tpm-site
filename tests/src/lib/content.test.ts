import { describe, expect, mock, test } from "bun:test";

await mock.module("astro:content", () => ({
  getCollection: async (collection: string) => {
    await Promise.resolve();

    if (collection === "articles") {
      return [
        {
          collection: "articles",
          data: {
            author: "Author",
            date: new Date("2022-01-02T00:00:00Z"),
            description: "Newer",
            draft: false,
            tags: [],
            title: "Newer Article",
          },
          filePath: "/repo/src/content/articles/history/newer.md",
          id: "newer",
        },
        {
          collection: "articles",
          data: {
            author: "Author",
            date: new Date("2021-01-02T00:00:00Z"),
            description: "Draft",
            draft: true,
            tags: [],
            title: "Draft Article",
          },
          filePath: "/repo/src/content/articles/history/draft.md",
          id: "draft",
        },
        {
          collection: "articles",
          data: {
            author: "Author",
            date: new Date("2020-01-02T00:00:00Z"),
            description: "Older",
            draft: false,
            tags: [],
            title: "Older Article",
          },
          filePath: "/repo/src/content/articles/politics/older.md",
          id: "older",
        },
      ];
    }

    if (collection === "categories") {
      return [
        {
          collection: "categories",
          data: {
            description: "History articles",
            order: 1,
            title: "History",
          },
          id: "history",
        },
        {
          collection: "categories",
          data: {
            order: 2,
            title: "Politics",
          },
          id: "politics",
        },
      ];
    }

    return [];
  },
}));

const { getCategories, getCategory } = await import("../../../src/lib/content");

describe("content helpers", () => {
  test("builds category summaries from metadata and article folders", async () => {
    const categories = await getCategories();

    expect(categories.map((category) => category.slug)).toEqual([
      "history",
      "politics",
    ]);
    expect(categories[0]?.articles.map((article) => article.id)).toEqual([
      "newer",
    ]);
  });

  test("normalizes category lookup before searching summaries", async () => {
    const category = await getCategory("History");

    expect(category).toMatchObject({ slug: "history" });
  });
});
