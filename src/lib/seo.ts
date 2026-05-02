import type { AuthorSummary } from "./authors";
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
export function absoluteUrl(
  pathOrUrl: string,
  site: string | undefined | URL,
): string {
  if (hasAbsoluteUrlPrefix(pathOrUrl)) {
    return pathOrUrl;
  }

  const base = site?.toString() ?? DEFAULT_SITE_URL;
  const normalizedBase = base.replace(/\/+$/, "");
  const normalizedPath = pathOrUrl.startsWith("/")
    ? pathOrUrl
    : `/${pathOrUrl}`;

  return `${normalizedBase}${normalizedPath}`;
}

/**
 * Builds BlogPosting JSON-LD for an article page.
 *
 * @param article Article content entry.
 * @param category Category summary for the article, when available.
 * @param site Astro site origin when available.
 * @param authors Optional structured author summaries.
 * @returns Schema.org BlogPosting object ready for serialization.
 */
export function articleBlogPostingJsonLd(
  article: ArticleEntry,
  category: CategorySummary | undefined,
  site: string | undefined | URL,
  authors: readonly AuthorSummary[] = [],
): Record<string, unknown> {
  const canonicalUrl = absoluteUrl(articleUrl(article.id), site);
  const articleImage = imageUrl(article);
  const absoluteImage =
    articleImage === undefined ? undefined : absoluteUrl(articleImage, site);

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    articleSection: category?.title ?? category?.slug,
    author:
      authors.length > 0
        ? authors.map((author) => authorJsonLd(author, site))
        : {
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
export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function hasAbsoluteUrlPrefix(value: string): boolean {
  if (value.startsWith("//")) {
    return true;
  }

  const schemeSeparator = value.indexOf(":");
  if (schemeSeparator <= 0) {
    return false;
  }

  const scheme = value.slice(0, schemeSeparator);
  return Array.from(scheme).every(isUrlSchemeCharacter);
}

function isUrlSchemeCharacter(character: string, index: number): boolean {
  const codePoint = character.codePointAt(0);

  if (codePoint === undefined) {
    return false;
  }

  const isAsciiLetter =
    (codePoint >= 65 && codePoint <= 90) ||
    (codePoint >= 97 && codePoint <= 122);
  const isAsciiDigit = codePoint >= 48 && codePoint <= 57;

  return (
    isAsciiLetter ||
    (index > 0 &&
      (isAsciiDigit ||
        character === "+" ||
        character === "." ||
        character === "-"))
  );
}

function authorJsonLd(
  author: AuthorSummary,
  site: string | undefined | URL,
): Record<string, string> {
  return {
    "@type":
      author.type === "organization" || author.type === "collective"
        ? "Organization"
        : "Person",
    name: author.displayName,
    url: absoluteUrl(author.href, site),
  };
}
