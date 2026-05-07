import type { ImageMetadata } from "astro";
import { describe, expect, test } from "bun:test";

import type { ArticleArchiveItem } from "../../../src/lib/archive";
import {
  defaultPublishableVisibility,
  normalizePublishableVisibility,
  publishableFromAnnouncement,
  publishableFromArticleArchive,
  publishableIndex,
  publishableListItem,
  publishableListItems,
  publishableSourceHref,
  visiblePublishables,
} from "../../../src/lib/publishable";
import { announcementEntry, articleEntry } from "../../helpers/content";

describe("publishable model", () => {
  const image = {
    format: "jpg",
    height: 600,
    src: "/preview.jpg",
    width: 800,
  } as const satisfies ImageMetadata;

  test("normalizes visibility with true defaults and explicit overrides", () => {
    expect(normalizePublishableVisibility(undefined)).toEqual(
      defaultPublishableVisibility,
    );
    expect(normalizePublishableVisibility({ homepage: false })).toEqual({
      directory: true,
      feed: true,
      homepage: false,
      search: true,
    });
    expect(
      normalizePublishableVisibility(
        { homepage: true },
        {
          directory: true,
          feed: false,
          homepage: false,
          search: false,
        },
      ),
    ).toEqual({
      directory: true,
      feed: false,
      homepage: true,
      search: false,
    });
  });

  test("derives article kind and list data from archive items", () => {
    const publishable = publishableFromArticleArchive(
      archiveItem("what-is-a-meme"),
    );

    expect(publishable).toMatchObject({
      category: {
        href: "/categories/metamemetics/",
        title: "Metamemetics",
      },
      href: "/articles/what-is-a-meme/",
      kind: "article",
      slug: "what-is-a-meme",
      title: "What Is A Meme?",
    });
    expect(publishableListItem(publishable)).toMatchObject({
      href: "/articles/what-is-a-meme/",
      kind: "article",
      title: "What Is A Meme?",
    });
  });

  test("derives announcement kind and image fallback data from announcement entries", () => {
    const announcement = announcementEntry({
      data: {
        image,
        title: "Join Discord",
      },
      id: "join-discord",
    });
    const publishable = publishableFromAnnouncement(announcement);

    expect(publishable).toMatchObject({
      author: "The Philosopher's Meme",
      href: "/announcements/join-discord/",
      image: {
        alt: "Join Discord",
        src: image,
      },
      kind: "announcement",
      slug: "join-discord",
      title: "Join Discord",
    });
  });

  test("builds a global index and rejects duplicate publishable slugs", () => {
    const article = publishableFromArticleArchive(archiveItem("same-slug"));
    const announcement = publishableFromAnnouncement(
      announcementEntry({ id: "same-slug" }),
    );

    expect(() => publishableIndex([article, announcement])).toThrow(
      'Duplicate publishable slug "same-slug" for article and announcement.',
    );
    expect(publishableIndex([article]).get("same-slug")).toBe(article);
  });

  test("filters visible publishables per surface", () => {
    const hidden = publishableFromArticleArchive(
      archiveItem("hidden", {
        visibility: {
          ...defaultPublishableVisibility,
          homepage: false,
        },
      }),
    );
    const visible = publishableFromAnnouncement(announcementEntry());

    expect(visiblePublishables([hidden, visible], "homepage")).toEqual([
      visible,
    ]);
    expect(visiblePublishables([hidden, visible], "directory")).toEqual([
      hidden,
      visible,
    ]);
  });

  test("maps multiple publishables to source-agnostic list items", () => {
    const items = publishableListItems([
      publishableFromArticleArchive(archiveItem("article")),
      publishableFromAnnouncement(announcementEntry({ id: "announcement" })),
    ]);

    expect(items.map((item) => item.kind)).toEqual(["article", "announcement"]);
  });

  test("returns source hrefs from folder-derived collection kind", () => {
    expect(publishableSourceHref(articleEntry({ id: "article" }))).toBe(
      "/articles/article/",
    );
    expect(
      publishableSourceHref(announcementEntry({ id: "announcement" })),
    ).toBe("/announcements/announcement/");
  });
});

function archiveItem(
  id: string,
  data: Partial<ReturnType<typeof articleEntry>["data"]> = {},
): ArticleArchiveItem {
  return {
    article: articleEntry({ data, id }),
    author: "Author",
    authors: [],
    category: {
      title: "Metamemetics",
      url: "/categories/metamemetics/",
    },
    date: "November 30, 2021",
    description: "Article description.",
    image: undefined,
    title: "What Is A Meme?",
    url: `/articles/${id}/`,
  };
}
