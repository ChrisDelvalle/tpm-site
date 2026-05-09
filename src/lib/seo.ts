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

export function absoluteUrl(pathOrUrl: string, site: string | URL | undefined) {
  return new URL(pathOrUrl, site ?? DEFAULT_SITE_URL).toString();
}

export function safeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function articleBlogPostingJsonLd(
  article: ArticleEntry,
  category: CategorySummary | undefined,
  site: string | URL | undefined,
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
