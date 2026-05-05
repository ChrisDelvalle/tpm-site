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
            tags: ["meme history", "memes"],
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
            tags: ["meme history"],
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
            tags: ["meme history", "games"],
            title: "Older Article",
          },
          filePath: "/repo/src/content/articles/politics/older.md",
          id: "older",
        },
        {
          collection: "articles",
          data: {
            author: "Author",
            date: new Date("2019-01-02T00:00:00Z"),
            description: "Unlisted category",
            draft: false,
            tags: [],
            title: "Unlisted Category Article",
          },
          filePath: "/repo/src/content/articles/game-studies/unlisted.md",
          id: "unlisted",
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

const { getCategories, getCategory, getTag, getTags } =
  await import("../../../src/lib/content");

describe("content helpers", () => {
  test("builds category summaries from metadata and article folders", async () => {
    const categories = await getCategories();

    expect(categories.map((category) => category.slug)).toEqual([
      "history",
      "politics",
      "game-studies",
    ]);
    expect(categories[0]?.articles.map((article) => article.id)).toEqual([
      "newer",
    ]);
    expect(categories[2]).toMatchObject({ title: "Game Studies" });
  });

  test("normalizes category lookup before searching summaries", async () => {
    const category = await getCategory("History");

    expect(category).toMatchObject({ slug: "history" });
  });

  test("builds tag summaries from published article frontmatter", async () => {
    const tags = await getTags();

    expect(tags.map((tag) => tag.label)).toEqual([
      "games",
      "meme history",
      "memes",
    ]);
    expect(tags[1]?.articles.map((article) => article.id)).toEqual([
      "newer",
      "older",
    ]);
    expect(await getTag("meme%20history")).toMatchObject({
      href: "/tags/meme%20history/",
      label: "meme history",
    });
    expect(await getTag("meme history")).toMatchObject({
      href: "/tags/meme%20history/",
      label: "meme history",
    });
  });
});
