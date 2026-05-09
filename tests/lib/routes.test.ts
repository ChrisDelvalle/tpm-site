import { describe, expect, test } from "bun:test";

import {
  type ArticleEntry,
  articleSlug,
  articleUrl,
  assertUniqueArticleSlugs,
  categorySlug,
  categoryUrl,
  decodeHtmlEntities,
  isPublishedArticle,
  normalizeSlug,
} from "../../src/lib/routes";

function entry(
  id: string,
  data: Record<string, unknown> = {},
  filePath = "",
): ArticleEntry {
  return {
    collection: "articles",
    id,
    data: {
      author: "Author",
      date: new Date("2022-04-06T00:00:00Z"),
      description: "Description",
      draft: false,
      tags: [],
      title: "Title",
      ...data,
    },
    filePath: filePath || `/repo/src/content/articles/history/${id}.md`,
  } as unknown as ArticleEntry;
}

describe("route helpers", () => {
  test("normalizes labels into URL slugs", () => {
    expect(normalizeSlug("Game Studies")).toBe("game-studies");
    expect(normalizeSlug("Memes & Humor")).toBe("memes-and-humor");
  });

  test("keeps canonical routes trailing-slashed", () => {
    expect(articleUrl("gamergate-as-metagaming")).toBe(
      "/articles/gamergate-as-metagaming/",
    );
    expect(categoryUrl("memeculture")).toBe("/categories/memeculture/");
  });

  test("uses collection ids directly as article slugs", () => {
    expect(
      articleSlug(
        entry("filename-slug", {
          legacyPermalink: "/2022/04/06/legacy-permalink-slug/",
        }),
      ),
    ).toBe("filename-slug");
  });

  test("filters draft entries", () => {
    const published = entry("published");
    const draft = entry("draft", { draft: true });

    expect(isPublishedArticle(published)).toBe(true);
    expect(isPublishedArticle(draft)).toBe(false);
  });

  test("detects duplicate article slugs", () => {
    expect(() => {
      assertUniqueArticleSlugs([entry("same"), entry("same")]);
    }).toThrow('Duplicate article slug "same"');
  });

  test("derives categories from source folders", () => {
    const politics = entry(
      "the-post-pepe-manifesto",
      {},
      "/repo/src/content/articles/politics/the-post-pepe-manifesto.md",
    );

    expect(categorySlug(politics)).toBe("politics");
  });

  test("decodes known HTML entities in titles", () => {
    expect(
      decodeHtmlEntities("Memes and Humor&#58; &quot;What is a Meme?&quot;"),
    ).toBe('Memes and Humor: "What is a Meme?"');
  });
});
