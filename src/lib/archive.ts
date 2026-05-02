import {
  authorDisplayNameForArticle,
  authorSummariesForArticle,
  type AuthorSummary,
} from "./authors";
import {
  type ArticleEntry,
  articleUrl,
  type AuthorEntry,
  authorName,
  categorySlug,
  type CategorySummary,
  categoryUrl,
  entryDate,
  entryTitle,
  excerpt,
  formatDate,
} from "./routes";

/** Display-ready archive item for article listing pages. */
export interface ArticleArchiveItem {
  article: ArticleEntry;
  author: string;
  authors: AuthorSummary[];
  category?:
    | undefined
    | {
        title: string;
        url: string;
      };
  date: string;
  description: string;
  title: string;
  url: string;
}

/**
 * Builds article archive view models from articles and category metadata.
 *
 * @param articles Published article entries sorted for display.
 * @param categories Category summaries used for display labels.
 * @param authors Optional author metadata used to build structured bylines.
 * @returns Display-ready archive items.
 */
export function articleArchiveItems(
  articles: readonly ArticleEntry[],
  categories: CategorySummary[],
  authors: readonly AuthorEntry[] = [],
): ArticleArchiveItem[] {
  const categoryMap = new Map(
    categories.map((category) => [category.slug, category] as const),
  );

  return articles.map((article) => {
    const category = categoryMap.get(categorySlug(article));

    return {
      article,
      author:
        authors.length > 0
          ? authorDisplayNameForArticle(article, authors)
          : authorName(article),
      authors:
        authors.length > 0 ? authorSummariesForArticle(article, authors) : [],
      category:
        category === undefined
          ? undefined
          : {
              title: category.title,
              url: categoryUrl(category.slug),
            },
      date: formatDate(entryDate(article)),
      description: excerpt(article),
      title: entryTitle(article),
      url: articleUrl(article.id),
    };
  });
}
