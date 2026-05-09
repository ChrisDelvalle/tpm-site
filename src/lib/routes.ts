import type { CollectionEntry } from "astro:content";

export type ArticleEntry = CollectionEntry<"articles">;
export type CategoryEntry = CollectionEntry<"categories">;

export interface CategorySummary {
  articles: ArticleEntry[];
  description?: string | undefined;
  order: number;
  slug: string;
  title: string;
}

export const SITE_TITLE = "The Philosopher's Meme";
export const SITE_DESCRIPTION =
  "The philosophy of memes, cyberculture, and the Internet.";

function withTrailingSlash(path: string) {
  if (path === "") {
    return "/";
  }
  return path.endsWith("/") ? path : `${path}/`;
}

export function articleUrl(slug: string) {
  return withTrailingSlash(`/articles/${slug}`);
}

export function categoryUrl(slug: string) {
  return withTrailingSlash(`/categories/${slug}`);
}

export function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function decodeHtmlEntities(value: string) {
  return value
    .replace(/&#(\d+);/g, (_, codePoint: string) =>
      String.fromCodePoint(Number(codePoint)),
    )
    .replace(/&#x([0-9a-f]+);/gi, (_, codePoint: string) =>
      String.fromCodePoint(Number.parseInt(codePoint, 16)),
    )
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export function entryTitle(entry: ArticleEntry) {
  return decodeHtmlEntities(entry.data.title);
}

export function articleSlug(entry: ArticleEntry) {
  return entry.id;
}

export function categorySlug(entry: ArticleEntry) {
  const filePath = entry.filePath ?? "";
  const marker = "/src/content/articles/";
  const relativePath = filePath.includes(marker)
    ? (filePath.split(marker)[1] ?? "")
    : filePath.replace(/^src\/content\/articles\//, "");

  return relativePath.includes("/") ? (relativePath.split("/")[0] ?? "") : "";
}

export function isPublishedArticle(entry: ArticleEntry) {
  return !entry.data.draft;
}

export function entryDate(entry: ArticleEntry) {
  return entry.data.date;
}

export function formatDate(date: Date | undefined) {
  if (date === undefined || Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function authorName(entry: ArticleEntry) {
  return entry.data.author;
}

export function excerpt(entry: ArticleEntry) {
  return entry.data.description;
}

function imageSource(value: unknown) {
  if (
    typeof value === "object" &&
    value !== null &&
    "src" in value &&
    typeof value.src === "string"
  ) {
    return value.src;
  }

  return undefined;
}

export function imageUrl(entry: ArticleEntry) {
  return imageSource(entry.data.image);
}

export function sortNewestFirst(entries: ArticleEntry[]) {
  return [...entries].sort((a, b) => {
    const bTime = entryDate(b).getTime();
    const aTime = entryDate(a).getTime();
    const dateSort = bTime - aTime;
    return dateSort !== 0
      ? dateSort
      : articleSlug(a).localeCompare(articleSlug(b));
  });
}

export function assertUniqueArticleSlugs(entries: ArticleEntry[]) {
  const seen = new Map<string, string>();

  for (const entry of entries) {
    const slug = articleSlug(entry);
    const previous = seen.get(slug);

    if (previous !== undefined) {
      throw new Error(
        `Duplicate article slug "${slug}" for "${previous}" and "${entry.id}".`,
      );
    }

    seen.set(slug, entry.id);
  }
}
