import {
  type ArticleEntry,
  articleUrl,
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
interface ArticleArchiveItem {
  article: ArticleEntry;
  author: string;
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
 * @returns Display-ready archive items.
 */
export function articleArchiveItems(
  articles: ArticleEntry[],
  categories: CategorySummary[],
): ArticleArchiveItem[] {
  const categoryMap = new Map(
    categories.map((category) => [category.slug, category] as const),
  );

  return articles.map((article) => {
    const category = categoryMap.get(categorySlug(article));

    return {
      article,
      author: authorName(article),
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
