import { describe, expect, test } from "bun:test";

import type { ArticleArchiveItem } from "../../../src/lib/archive";
import type { EditorialCollectionEntry } from "../../../src/lib/collections";
import {
  homepageDiscoveryLinks,
  homePageViewModel,
} from "../../../src/lib/home";
import { defaultPublishableVisibility } from "../../../src/lib/publishable";
import { parseSiteConfig } from "../../../src/lib/site-config";
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

  test("uses configured homepage collection IDs and list limits", () => {
    const viewModel = homePageViewModel({
      announcementLimit: 1,
      announcements: [
        announcementEntry({ id: "new" }),
        announcementEntry({ id: "old" }),
      ],
      archiveItems: [archiveItem("latest"), archiveItem("older")],
      collections: [
        collectionEntry("front-page", { items: ["latest"] }),
        collectionEntry("starter-pack", { items: ["older"] }),
      ],
      featuredCollectionId: "front-page",
      recentLimit: 1,
      startHereCollectionId: "starter-pack",
    });

    expect(viewModel.featuredItems.map((item) => item.slug)).toEqual([
      "latest",
    ]);
    expect(viewModel.startHereItems.map((item) => item.href)).toEqual([
      "/articles/older/",
    ]);
    expect(viewModel.announcementItems).toHaveLength(1);
    expect(viewModel.recentFeedItems).toHaveLength(1);
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

  test("resolves configured discovery links and skips disabled route features", () => {
    const config = parseSiteConfig({
      identity: {
        description: "A configurable publication.",
        language: "en",
        title: "Example Blog",
        url: "https://example.com",
      },
      features: {
        authors: false,
      },
      homepage: {
        discoveryLinks: [
          { label: "Articles", route: "articles" },
          { label: "Authors", route: "authors" },
          { href: "https://example.com/newsletter", label: "Newsletter" },
        ],
      },
      navigation: {
        footer: [],
        primary: [],
      },
      routes: {
        allArticles: "/articles/all/",
        announcements: "/announcements/",
        articles: "/writing/",
        authors: "/authors/",
        bibliography: "/bibliography/",
        categories: "/categories/",
        collections: "/collections/",
        feed: "/feed.xml",
        home: "/",
        search: "/search/",
        tags: "/tags/",
      },
      support: {
        block: {
          body: "Keep publishing going.",
          title: "Support Example Blog",
        },
        discord: {
          href: "https://discord.gg/example",
          label: "Join Discord",
        },
        patreon: {
          href: "https://patreon.com/example",
          label: "Support Us",
        },
      },
    });

    expect(homepageDiscoveryLinks(config)).toEqual([
      { href: "/writing/", label: "Articles" },
      { href: "https://example.com/newsletter", label: "Newsletter" },
    ]);
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
