import { describe, expect, test } from "bun:test";

import { articleArchiveItems } from "../../../src/lib/archive";
import {
  articleEntry,
  authorEntry,
  categorySummary,
} from "../../helpers/content";

describe("articleArchiveItems", () => {
  test("combines article data with category display metadata", () => {
    const article = articleEntry({
      data: {
        author: "Seong-Young Her",
        date: new Date("2022-04-06T23:58:10.000Z"),
        description: "Article excerpt",
        title: "Article Title",
      },
      id: "article-title",
    });
    const [archiveItem] = articleArchiveItems(
      [article],
      [
        categorySummary({
          articles: [article],
          slug: "history",
          title: "History",
        }),
      ],
    );

    expect(archiveItem).toMatchObject({
      author: "Seong-Young Her",
      authors: [],
      category: {
        title: "History",
        url: "/categories/history/",
      },
      date: "April 6, 2022",
      description: "Article excerpt",
      title: "Article Title",
      url: "/articles/article-title/",
    });
  });

  test("keeps article entries renderable when category metadata is missing", () => {
    const [archiveItem] = articleArchiveItems(
      [
        articleEntry({
          filePath: "/repo/src/content/articles/missing-category/post.md",
          id: "post",
        }),
      ],
      [],
    );

    expect(archiveItem?.category).toBeUndefined();
  });

  test("adds structured author summaries when author metadata is available", () => {
    const article = articleEntry({
      data: { author: "Seong-Young Her" },
      id: "article-title",
    });
    const [archiveItem] = articleArchiveItems(
      [article],
      [],
      [
        authorEntry({
          displayName: "Seong-Young Her",
          id: "seong-young-her",
        }),
      ],
    );

    expect(archiveItem).toMatchObject({
      author: "Seong-Young Her",
      authors: [
        {
          displayName: "Seong-Young Her",
          href: "/authors/seong-young-her/",
        },
      ],
    });
  });
});
