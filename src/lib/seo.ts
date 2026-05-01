import {
  type ArticleEntry,
  articleUrl,
  authorName,
  type CategorySummary,
  entryDate,
  entryTitle,
  excerpt,
  imageUrl,
  SITE_TITLE,
} from "./routes";

const DEFAULT_SITE_URL = "https://thephilosophersmeme.com";

/**
 * Resolves a site-relative or absolute URL against the configured site origin.
 *
 * @param pathOrUrl Relative path or absolute URL.
 * @param site Astro site origin when available.
 * @returns Absolute URL string.
 */
export function absoluteUrl(pathOrUrl: string, site: string | undefined | URL) {
  return new URL(pathOrUrl, site ?? DEFAULT_SITE_URL).toString();
}

/**
 * Builds BlogPosting JSON-LD for an article page.
 *
 * @param article Article content entry.
 * @param category Category summary for the article, when available.
 * @param site Astro site origin when available.
 * @returns Schema.org BlogPosting object ready for serialization.
 */
export function articleBlogPostingJsonLd(
  article: ArticleEntry,
  category: CategorySummary | undefined,
  site: string | undefined | URL,
) {
  const canonicalUrl = absoluteUrl(articleUrl(article.id), site);
  const articleImage = imageUrl(article);
  const absoluteImage =
    articleImage === undefined ? undefined : absoluteUrl(articleImage, site);

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    articleSection: category?.title ?? category?.slug,
    author: {
      "@type": "Person",
      name: authorName(article),
    },
    datePublished: entryDate(article).toISOString(),
    description: excerpt(article),
    headline: entryTitle(article),
    image: absoluteImage,
    keywords: article.data.tags,
    mainEntityOfPage: canonicalUrl,
    publisher: {
      "@type": "Organization",
      name: SITE_TITLE,
    },
    url: canonicalUrl,
  };
}

/**
 * Serializes JSON-LD so it is safe to place inside an HTML script element.
 *
 * @param value Structured data object to serialize.
 * @returns JSON string with HTML-significant less-than characters escaped.
 */
export function safeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
