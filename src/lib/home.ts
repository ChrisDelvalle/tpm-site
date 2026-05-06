import type { CollectionEntry } from "astro:content";

import type { ArticleArchiveItem } from "./archive";

/** Astro content entry for one homepage featured item. */
export type HomeFeaturedEntry = CollectionEntry<"homeFeatured">;

/** Homepage discovery panel generated from curated and fallback articles. */
interface HomeArticleSelection {
  missingIds: string[];
  selectedItems: ArticleArchiveItem[];
}

/** Display-ready homepage featured item. */
export interface HomeFeaturedItem {
  category?: undefined | { href: string; title: string };
  date?: string | undefined;
  description?: string | undefined;
  entry: HomeFeaturedEntry;
  href: string;
  id: string;
  image?: ArticleArchiveItem["image"] | undefined;
  kind: "article" | "link";
  linkLabel?: string | undefined;
  title: string;
}

/** Normalized homepage featured item result. */
interface HomeFeaturedSelection {
  items: HomeFeaturedItem[];
  missingSlugs: string[];
}

/**
 * Selects curated start-here articles with deterministic fallbacks.
 *
 * @param items Article archive items sorted in homepage display order.
 * @param curatedIds Article content IDs from homepage frontmatter.
 * @param limit Maximum number of selected articles.
 * @returns Curated articles followed by fallback articles and missing IDs.
 */
export function homeArticleSelection(
  items: readonly ArticleArchiveItem[],
  curatedIds: readonly string[],
  limit: number,
): HomeArticleSelection {
  const itemById = new Map(items.map((item) => [item.article.id, item]));
  const missingIds = curatedIds.filter((id) => !itemById.has(id));
  const curatedItems = uniqueStrings(curatedIds)
    .map((id) => itemById.get(id))
    .filter((item): item is ArticleArchiveItem => item !== undefined);
  const curatedItemIds = new Set(curatedItems.map((item) => item.article.id));
  const fallbackItems = items.filter(
    (item) => !curatedItemIds.has(item.article.id),
  );

  return {
    missingIds,
    selectedItems: [...curatedItems, ...fallbackItems].slice(0, limit),
  };
}

/**
 * Sorts and filters homepage featured entries.
 *
 * @param features Homepage featured content entries.
 * @returns Active featured entries sorted for homepage display.
 */
export function activeHomeFeatures(
  features: readonly HomeFeaturedEntry[],
): HomeFeaturedEntry[] {
  return features
    .filter((feature) => feature.data.active)
    .toSorted((a, b) => {
      const orderSort = a.data.order - b.data.order;
      if (orderSort !== 0) {
        return orderSort;
      }

      return a.id.localeCompare(b.id);
    });
}

/**
 * Normalizes homepage featured entries into one renderable item model.
 *
 * @param features Active featured content entries.
 * @param articles Display-ready normal article archive items.
 * @returns Normalized featured items and stale article slugs.
 */
export function homeFeaturedSelection(
  features: readonly HomeFeaturedEntry[],
  articles: readonly ArticleArchiveItem[],
): HomeFeaturedSelection {
  const articleById = new Map(articles.map((item) => [item.article.id, item]));
  const missingSlugs = features
    .flatMap((feature) =>
      feature.data.kind === "article" ? [feature.data.slug] : [],
    )
    .filter((slug) => !articleById.has(slug));

  return {
    items: features.flatMap<HomeFeaturedItem>((feature) => {
      if (feature.data.kind === "link") {
        return [
          {
            entry: feature,
            href: feature.data.link,
            id: feature.id,
            kind: "link",
            linkLabel: feature.data.linkLabel,
            title: feature.data.title,
          } satisfies HomeFeaturedItem,
        ];
      }

      const article = articleById.get(feature.data.slug);
      if (article === undefined) {
        return [];
      }

      return [
        {
          category:
            article.category === undefined
              ? undefined
              : {
                  href: article.category.url,
                  title: article.category.title,
                },
          date: article.date,
          description: article.description,
          entry: feature,
          href: article.url,
          id: feature.id,
          image: article.image,
          kind: "article",
          title: article.title,
        } satisfies HomeFeaturedItem,
      ];
    }),
    missingSlugs: uniqueStrings(missingSlugs),
  };
}

function uniqueStrings(values: readonly string[]): string[] {
  return Array.from(new Set(values));
}
