import { getCollection } from "astro:content";

import {
  type ArticleEntry,
  assertUniqueArticleSlugs,
  type CategoryEntry,
  categorySlug,
  type CategorySummary,
  isPublishedArticle,
  normalizeSlug,
  sortNewestFirst,
} from "./routes";

async function getArticleEntries() {
  return getCollection("articles");
}

function labelFromSlug(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function categoryFromMetadata(
  slug: string,
  entry: CategoryEntry | undefined,
  articles: ArticleEntry[],
): CategorySummary {
  return {
    articles: sortNewestFirst(articles),
    description: entry?.data.description,
    order: entry?.data.order ?? Number.MAX_SAFE_INTEGER,
    slug,
    title: entry?.data.title ?? labelFromSlug(slug),
  };
}

/**
 * Loads all published articles in newest-first order.
 *
 * @returns Published article entries sorted for public listing surfaces.
 */
export async function getArticles() {
  const entries = await getArticleEntries();
  assertUniqueArticleSlugs(entries);
  return sortNewestFirst(entries.filter(isPublishedArticle));
}

/**
 * Loads category summaries with their published articles.
 *
 * @returns Category summaries sorted by category metadata order and title.
 */
export async function getCategories() {
  const articles = await getArticles();
  const categoryEntries = await getCollection("categories");
  const metadata = new Map(
    categoryEntries.map((entry) => [entry.id, entry] as const),
  );
  const slugs = new Set<string>([
    ...articles.map(categorySlug).filter((slug) => slug !== ""),
    ...categoryEntries.map((entry) => entry.id),
  ]);

  return [...slugs]
    .map((slug) =>
      categoryFromMetadata(
        slug,
        metadata.get(slug),
        articles.filter((article) => categorySlug(article) === slug),
      ),
    )
    .sort((a, b) => {
      const orderSort = a.order - b.order;
      return orderSort !== 0 ? orderSort : a.title.localeCompare(b.title);
    });
}

/**
 * Looks up one category summary by URL slug.
 *
 * @param slug Raw category slug from a route parameter or caller.
 * @returns Matching category summary when it exists.
 */
export async function getCategory(slug: string) {
  const normalizedSlug = normalizeSlug(slug);
  const categories = await getCategories();
  return categories.find((category) => category.slug === normalizedSlug);
}
