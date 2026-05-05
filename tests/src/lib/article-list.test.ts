import type { ImageMetadata } from "astro";
import { describe, expect, test } from "bun:test";

import type { ArticleArchiveItem } from "../../../src/lib/archive";
import {
  articleListItemFromArchive,
  articleListItemsFromArchive,
} from "../../../src/lib/article-list";
import { articleEntry } from "../../helpers/content";

describe("article list helpers", () => {
  const sampleImage = {
    format: "jpg",
    height: 600,
    src: "/assets/article-preview.jpg",
    width: 800,
  } as const satisfies ImageMetadata;
  const archiveItem = {
    article: articleEntry({ id: "article-title" }),
    author: "Author",
    authors: [
      {
        displayName: "Author",
        href: "/authors/author/",
        id: "author",
        type: "person",
      },
    ],
    category: {
      title: "History",
      url: "/categories/history/",
    },
    date: "April 6, 2022",
    description: "Description",
    image: {
      alt: "Article preview image",
      src: sampleImage,
    },
    title: "Article Title",
    url: "/articles/article-title/",
  } satisfies ArticleArchiveItem;

  test("maps archive fields into article-list component props", () => {
    expect(articleListItemFromArchive(archiveItem)).toEqual({
      author: "Author",
      authors: [
        {
          displayName: "Author",
          href: "/authors/author/",
          id: "author",
          type: "person",
        },
      ],
      category: {
        href: "/categories/history/",
        title: "History",
      },
      date: "April 6, 2022",
      description: "Description",
      href: "/articles/article-title/",
      image: {
        alt: "Article preview image",
        src: sampleImage,
      },
      title: "Article Title",
    });
  });

  test("keeps missing category metadata optional", () => {
    const uncategorized = {
      ...archiveItem,
      category: undefined,
    } satisfies ArticleArchiveItem;

    expect(articleListItemsFromArchive([uncategorized])).toEqual([
      {
        author: "Author",
        authors: [
          {
            displayName: "Author",
            href: "/authors/author/",
            id: "author",
            type: "person",
          },
        ],
        category: undefined,
        date: "April 6, 2022",
        description: "Description",
        href: "/articles/article-title/",
        image: {
          alt: "Article preview image",
          src: sampleImage,
        },
        title: "Article Title",
      },
    ]);
  });
});
