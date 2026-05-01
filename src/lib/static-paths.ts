import type { ArticleEntry, CategorySummary } from "./routes";

/** Astro static path entry for article pages. */
interface ArticleStaticPath {
  params: {
    slug: string;
  };
  props: {
    article: ArticleEntry;
  };
}

/** Astro static path entry for category pages. */
interface CategoryStaticPath {
  params: {
    category: string;
  };
  props: {
    category: CategorySummary;
  };
}

/**
 * Builds Astro static paths for published articles.
 *
 * @param articles Published article entries.
 * @returns Static path params and props.
 */
export function articleStaticPaths(
  articles: ArticleEntry[],
): ArticleStaticPath[] {
  return articles.map((article) => ({
    params: { slug: article.id },
    props: { article },
  }));
}

/**
 * Builds Astro static paths for public categories.
 *
 * @param categories Category summaries.
 * @returns Static path params and props.
 */
export function categoryStaticPaths(
  categories: CategorySummary[],
): CategoryStaticPath[] {
  return categories.map((category) => ({
    params: { category: category.slug },
    props: { category },
  }));
}
