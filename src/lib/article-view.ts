import {
  type ArticleEntry,
  articleUrl,
  authorName,
  categorySlug,
  entryDate,
  entryTitle,
  excerpt,
  formatDate,
} from "./routes";

/** Display and metadata fields needed by the article layout. */
export interface ArticleViewModel {
  author: string;
  canonicalPath: string;
  categorySlug: string;
  date: Date;
  description: string;
  formattedDate: string;
  imageAlt?: string | undefined;
  title: string;
}

/**
 * Builds the article layout model from a content collection entry.
 *
 * @param article Article content entry.
 * @returns Display-ready article metadata.
 */
export function articleViewModel(article: ArticleEntry): ArticleViewModel {
  const date = entryDate(article);

  return {
    author: authorName(article),
    canonicalPath: articleUrl(article.id),
    categorySlug: categorySlug(article),
    date,
    description: excerpt(article),
    formattedDate: formatDate(date),
    imageAlt: article.data.imageAlt,
    title: entryTitle(article),
  };
}
