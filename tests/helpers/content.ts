import type { ArticleEntry, CategorySummary } from "../../src/lib/routes";

/** Options for building article-entry test fixtures. */
export interface ArticleEntryFixtureOptions {
  data?: Partial<ArticleEntry["data"]>;
  date?: Date;
  filePath?: string;
  id?: string;
}

/** Options for building category-summary test fixtures. */
export interface CategorySummaryFixtureOptions {
  articles?: ArticleEntry[];
  description?: string;
  order?: number;
  slug?: string;
  title?: string;
}

/**
 * Builds a minimal Astro content article entry for unit tests.
 *
 * @param options Article entry overrides.
 * @param options.data Frontmatter overrides.
 * @param options.date Publication date override.
 * @param options.filePath Source file path override.
 * @param options.id Entry ID override.
 * @returns Test article entry.
 */
export function articleEntry({
  data = {},
  date = new Date("2022-01-01T00:00:00.000Z"),
  filePath,
  id = "sample-article",
}: ArticleEntryFixtureOptions = {}): ArticleEntry {
  return {
    collection: "articles",
    data: {
      author: "Author",
      date,
      description: "Description",
      draft: false,
      tags: [],
      title: "Sample Article",
      ...data,
    },
    filePath: filePath ?? `/repo/src/content/articles/history/${id}.md`,
    id,
  };
}

/**
 * Builds a category summary for route and view-model tests.
 *
 * @param options Category summary overrides.
 * @param options.articles Article entries in the category.
 * @param options.description Category description override.
 * @param options.order Category order override.
 * @param options.slug Category slug override.
 * @param options.title Category title override.
 * @returns Test category summary.
 */
export function categorySummary({
  articles = [],
  description = "Category description",
  order = 1,
  slug = "history",
  title = "History",
}: CategorySummaryFixtureOptions = {}): CategorySummary {
  return {
    articles,
    description,
    order,
    slug,
    title,
  };
}
