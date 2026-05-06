import { describe, expect, test } from "bun:test";

import type { ArticleArchiveItem } from "../../../src/lib/archive";
import type { EditorialCollectionEntry } from "../../../src/lib/collections";
import { homePageViewModel } from "../../../src/lib/home";
import { defaultPublishableVisibility } from "../../../src/lib/publishable";
import { announcementEntry, articleEntry } from "../../helpers/content";

describe("homepage view model", () => {
  test("resolves Featured and Start Here from publishable collections", () => {
    const viewModel = homePageViewModel({
      announcements: [
        announcementEntry({
          id: "forum-priority",
        }),
      ],
      archiveItems: [
        archiveItem("latest"),
        archiveItem("what-is-a-meme"),
        archiveItem("homesteading-the-memeosphere"),
      ],
      collections: [
        collectionEntry("featured", {
          items: [
            {
              note: "Feature note.",
              slug: "homesteading-the-memeosphere",
            },
            "forum-priority",
          ],
        }),
        collectionEntry("start-here", {
          items: ["what-is-a-meme", "homesteading-the-memeosphere"],
        }),
      ],
    });

    expect(viewModel.featuredItems.map((item) => item.slug)).toEqual([
      "homesteading-the-memeosphere",
      "forum-priority",
    ]);
    expect(viewModel.featuredItems[0]?.note).toBe("Feature note.");
    expect(viewModel.featuredItems.map((item) => item.kind)).toEqual([
      "article",
      "announcement",
    ]);
    expect(viewModel.startHereItems.map((item) => item.title)).toEqual([
      "what-is-a-meme",
      "homesteading-the-memeosphere",
    ]);
  });

  test("uses newest visible announcements and normal articles for automatic homepage lists", () => {
    const viewModel = homePageViewModel({
      announcementLimit: 2,
      announcements: [
        announcementEntry({
          date: new Date("2026-05-05T00:00:00Z"),
          id: "new",
        }),
        announcementEntry({
          data: {
            visibility: {
              ...defaultPublishableVisibility,
              homepage: false,
            },
          },
          date: new Date("2026-05-04T00:00:00Z"),
          id: "hidden-announcement",
        }),
        announcementEntry({
          date: new Date("2026-05-03T00:00:00Z"),
          id: "old",
        }),
      ],
      archiveItems: [
        archiveItem("latest"),
        archiveItem("hidden", {
          visibility: {
            ...defaultPublishableVisibility,
            homepage: false,
          },
        }),
        archiveItem("older"),
      ],
      collections: [
        collectionEntry("featured", { items: ["latest"] }),
        collectionEntry("start-here", { items: ["older"] }),
      ],
      recentLimit: 2,
    });

    expect(viewModel.announcementItems.map((item) => item.href)).toEqual([
      "/announcements/new/",
      "/announcements/old/",
    ]);
    expect(viewModel.recentFeedItems.map((item) => item.href)).toEqual([
      "/articles/latest/",
      "/articles/older/",
    ]);
  });

  test("fails clearly when required homepage collections are missing", () => {
    expect(() =>
      homePageViewModel({
        announcements: [],
        archiveItems: [],
        collections: [],
      }),
    ).toThrow('Missing required homepage collection "featured".');
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
    date: "January 1, 2024",
    description: `${id} description`,
    title: id,
    url: `/articles/${id}/`,
  };
}

function collectionEntry(
  id: string,
  data: Partial<EditorialCollectionEntry["data"]> = {},
): EditorialCollectionEntry {
  return {
    body: "",
    collection: "collections",
    data: {
      draft: false,
      items: [],
      title: id,
      ...data,
    },
    id,
  };
}
