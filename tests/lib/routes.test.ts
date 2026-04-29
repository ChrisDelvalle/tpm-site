import { describe, expect, test } from "bun:test";

import {
  articleSlug,
  articleUrl,
  assertUniqueArticleSlugs,
  decodeHtmlEntities,
  isPublishedArticle,
  type LegacyEntry,
  normalizeSlug,
  topicForEntry,
  topicUrl,
} from "../../src/lib/routes";

function entry(
  id: string,
  data: Record<string, unknown>,
  filePath = "",
): LegacyEntry {
  return {
    id,
    data,
    filePath: filePath || `/repo/src/content/legacy/history/${id}.md`,
  } as LegacyEntry;
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
    expect(topicUrl("meme-culture")).toBe("/topics/meme-culture/");
  });

  test("prefers dated permalink slugs for migrated articles", () => {
    expect(
      articleSlug(
        entry("history/2022-04-06-title-from-file", {
          permalink:
            "/2022/04/06/wittgensteins-most-beloved-quote-was-real-but-its-fake-now/",
        }),
      ),
    ).toBe("wittgensteins-most-beloved-quote-was-real-but-its-fake-now");
  });

  test("falls back to date-stripped collection ids", () => {
    expect(
      articleSlug(
        entry("history/2022-04-06-title-from-file", {
          permalink: "/history/",
        }),
      ),
    ).toBe("history/title-from-file");
  });

  test("filters unpublished and draft entries", () => {
    const published = entry("published", {
      permalink: "/2022/04/06/published/",
    });
    const unpublished = entry("unpublished", {
      permalink: "/2022/04/06/unpublished/",
      published: false,
    });
    const draft = entry("draft", {
      permalink: "/2022/04/06/draft/",
      status: "draft",
    });

    expect(isPublishedArticle(published)).toBe(true);
    expect(isPublishedArticle(unpublished)).toBe(false);
    expect(isPublishedArticle(draft)).toBe(false);
  });

  test("detects duplicate article slugs", () => {
    expect(() => {
      assertUniqueArticleSlugs([
        entry("a", { permalink: "/2022/04/06/same/" }),
        entry("b", { permalink: "/2023/04/06/same/" }),
      ]);
    }).toThrow('Duplicate article slug "same"');
  });

  test("derives topics from source folders before legacy parent metadata", () => {
    const politics = entry(
      "politics/2016-01-29-the-post-pepe-manifesto",
      { parent: 2016 },
      "/repo/src/content/legacy/politics/2016-01-29-the-post-pepe-manifesto.md",
    );

    expect(topicForEntry(politics)?.slug).toBe("politics");
  });

  test("decodes known legacy HTML entities in titles", () => {
    expect(
      decodeHtmlEntities("Memes and Humor&#58; &quot;What is a Meme?&quot;"),
    ).toBe('Memes and Humor: "What is a Meme?"');
  });
});
