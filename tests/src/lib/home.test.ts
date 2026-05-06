import { describe, expect, test } from "bun:test";

import type { ArticleArchiveItem } from "../../../src/lib/archive";
import {
  activeHomeFeatures,
  homeArticleSelection,
  type HomeFeaturedEntry,
  homeFeaturedSelection,
} from "../../../src/lib/home";
import { articleEntry } from "../../helpers/content";

describe("homepage helpers", () => {
  test("selects curated start-here articles with deterministic fallbacks", () => {
    const items = [
      archiveItem("latest"),
      archiveItem("what-is-a-meme"),
      archiveItem("the-memetic-bottleneck"),
      archiveItem("fallback"),
    ];

    const selection = homeArticleSelection(
      items,
      ["what-is-a-meme", "missing", "what-is-a-meme"],
      3,
    );

    expect(selection.missingIds).toEqual(["missing"]);
    expect(selection.selectedItems.map((item) => item.article.id)).toEqual([
      "what-is-a-meme",
      "latest",
      "the-memetic-bottleneck",
    ]);
  });

  test("filters inactive featured entries and sorts active entries by order and id", () => {
    const features = [
      linkFeature("discord", 20, true),
      linkFeature("hidden", 1, false),
      articleFeature("article-b", "beta", 10, true),
      articleFeature("article-a", "alpha", 10, true),
    ];

    expect(activeHomeFeatures(features).map((item) => item.id)).toEqual([
      "article-a",
      "article-b",
      "discord",
    ]);
  });

  test("normalizes article and link featured entries into one render model", () => {
    const selection = homeFeaturedSelection(
      [
        articleFeature("feature-article", "what-is-a-meme", 10, true),
        linkFeature("feature-link", 20, true),
      ],
      [archiveItem("what-is-a-meme")],
    );

    expect(selection.missingSlugs).toEqual([]);
    expect(selection.items).toMatchObject([
      {
        description: "what-is-a-meme description",
        href: "/articles/what-is-a-meme/",
        id: "feature-article",
        kind: "article",
        title: "what-is-a-meme",
      },
      {
        href: "https://discord.gg/8MVFRMa",
        id: "feature-link",
        kind: "link",
        linkLabel: "Join Discord",
        title: "Join Discord",
      },
    ]);
  });

  test("reports stale featured article slugs without returning invalid items", () => {
    const selection = homeFeaturedSelection(
      [
        articleFeature("missing", "missing-article", 10, true),
        articleFeature("duplicate-missing", "missing-article", 20, true),
      ],
      [archiveItem("available")],
    );

    expect(selection.missingSlugs).toEqual(["missing-article"]);
    expect(selection.items).toEqual([]);
  });
});

function archiveItem(id: string): ArticleArchiveItem {
  return {
    article: articleEntry({ id }),
    author: "Author",
    authors: [],
    date: "January 1, 2024",
    description: `${id} description`,
    title: id,
    url: `/articles/${id}/`,
  };
}

function articleFeature(
  id: string,
  slug: string,
  order: number,
  active: boolean,
): HomeFeaturedEntry {
  return {
    id,
    body: "",
    collection: "homeFeatured",
    data: {
      active,
      kind: "article",
      order,
      slug,
    },
  } satisfies HomeFeaturedEntry;
}

function linkFeature(
  id: string,
  order: number,
  active: boolean,
): HomeFeaturedEntry {
  return {
    id,
    body: "",
    collection: "homeFeatured",
    data: {
      active,
      kind: "link",
      link: "https://discord.gg/8MVFRMa",
      linkLabel: "Join Discord",
      order,
      title: "Join Discord",
    },
  } satisfies HomeFeaturedEntry;
}
