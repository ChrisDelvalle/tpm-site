import { describe, expect, test } from "bun:test";

import {
  type ArticleEntry,
  articlesArchiveUrl,
  articlesIndexUrl,
  articleSlug,
  articleUrl,
  assertUniqueArticleSlugs,
  categoriesIndexUrl,
  categorySlug,
  categoryUrl,
  decodeHtmlEntities,
  feedUrl,
  isPublishedArticle,
  normalizeSlug,
  pageUrl,
  searchUrl,
} from "../../src/lib/routes";

function entry(
  id: string,
  data: Record<string, unknown> = {},
  filePath = "",
): ArticleEntry {
  const articleData = {
    author: "Author",
    date: new Date("2022-04-06T00:00:00Z"),
    description: "Description",
    draft: false,
    tags: [],
    title: "Title",
    ...data,
  } satisfies ArticleEntry["data"];

  return {
    collection: "articles",
    id,
    data: articleData,
    filePath:
      filePath === ""
        ? `/repo/src/content/articles/history/${id}.md`
        : filePath,
  };
}

describe("route helpers", () => {
  test("normalizes labels into URL slugs", () => {
    expect(normalizeSlug("Game Studies")).toBe("game-studies");
    expect(normalizeSlug("Memes & Humor")).toBe("memes-and-humor");
  });

  test("keeps canonical routes trailing-slashed", () => {
    expect(articlesIndexUrl()).toBe("/articles/");
    expect(articlesArchiveUrl()).toBe("/articles/all/");
    expect(articleUrl("gamergate-as-metagaming")).toBe(
      "/articles/gamergate-as-metagaming/",
    );
    expect(categoriesIndexUrl()).toBe("/categories/");
    expect(categoryUrl("memeculture")).toBe("/categories/memeculture/");
    expect(pageUrl("About")).toBe("/about/");
    expect(searchUrl()).toBe("/search/");
    expect(feedUrl()).toBe("/feed.xml");
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

  test("detects article slugs reserved for static routes", () => {
    expect(() => {
      assertUniqueArticleSlugs([entry("all")]);
    }).toThrow('Article slug "all" is reserved for a site route.');
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
      decodeHtmlEntities(
        "Memes and Humor&#58; &#x26; &quot;What is a Meme?&quot;",
      ),
    ).toBe('Memes and Humor: & "What is a Meme?"');
  });
});
