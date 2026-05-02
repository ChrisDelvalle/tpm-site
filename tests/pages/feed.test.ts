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

    if (collection === "authors") {
      return [
        {
          body: "",
          collection: "authors",
          data: {
            aliases: ["Author"],
            displayName: "Author",
            socials: [],
            type: "person",
          },
          id: "author",
        },
      ];
    }

    return [];
  },
}));

const { GET } = await import("../../src/pages/feed.xml");

describe("RSS feed endpoint", () => {
  test("renders published articles into RSS XML", async () => {
    const response = await GET({ site: new URL("https://example.com") });
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toContain("<rss");
    expect(text).toContain("Newer Article");
    expect(text).not.toContain("Draft Article");
    expect(text).toContain("https://example.com/articles/newer/");
  });
});
