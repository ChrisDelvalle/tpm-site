import {
  type ArticleEntry,
  articleUrl,
  authorName,
  categorySlug,
  entryDate,
  entryTitle,
  excerpt,
  formatDate,
  imageUrl,
} from "./routes";

/** Display and metadata fields needed by the article layout. */
interface ArticleViewModel {
  author: string;
  canonicalPath: string;
  categorySlug: string;
  date: Date;
  description: string;
  formattedDate: string;
  image?: string | undefined;
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
    image: imageUrl(article),
    imageAlt: article.data.imageAlt,
    title: entryTitle(article),
  };
}
