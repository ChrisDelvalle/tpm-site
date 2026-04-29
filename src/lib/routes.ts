import type { CollectionEntry } from "astro:content";

export type ArticleEntry = CollectionEntry<"articles">;

export const SITE_TITLE = "The Philosopher's Meme";
export const SITE_DESCRIPTION =
  "The philosophy of memes, cyberculture, and the Internet.";

export const TOPICS = [
  { slug: "meme-culture", label: "Meme Culture", source: "memeculture" },
  { slug: "metamemetics", label: "Metamemetics", source: "metamemetics" },
  { slug: "aesthetics", label: "Aesthetics", source: "aesthetics" },
  { slug: "irony", label: "Irony", source: "irony" },
  { slug: "game-studies", label: "Game Studies", source: "game-studies" },
  { slug: "history", label: "History", source: "history" },
  { slug: "philosophy", label: "Philosophy", source: "philosophy" },
  { slug: "politics", label: "Politics", source: "politics" },
] as const;

function withTrailingSlash(path: string) {
  if (path === "") {
    return "/";
  }
  return path.endsWith("/") ? path : `${path}/`;
}

export function articleUrl(slug: string) {
  return withTrailingSlash(`/articles/${slug}`);
}

export function topicUrl(slug: string) {
  return withTrailingSlash(`/topics/${slug}`);
}

export function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
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
  return typeof entry.data.title === "string"
    ? decodeHtmlEntities(entry.data.title)
    : "Untitled";
}

export function sourceFolder(entry: ArticleEntry) {
  const filePath = entry.filePath ?? "";
  const markers = ["/src/content/articles/", "/src/content/legacy/"];
  const marker = markers.find((item) => filePath.includes(item));
  const relativePath =
    marker === undefined
      ? filePath
          .replace(/^src\/content\/articles\//, "")
          .replace(/^src\/content\/legacy\//, "")
      : (filePath.split(marker)[1] ?? "");

  return relativePath.includes("/") ? (relativePath.split("/")[0] ?? "") : "";
}

export function articleSlug(entry: ArticleEntry) {
  const permalink = entry.data.legacyPermalink ?? entry.data.permalink;
  const permalinkMatch =
    typeof permalink === "string"
      ? /^\/?\d{4}\/\d{2}\/\d{2}\/([^/]+)\/?$/.exec(permalink)
      : null;

  if (permalinkMatch) {
    return permalinkMatch[1] ?? entry.id;
  }

  return entry.id.replace(/(^|\/)\d{4}[-_]\d{2}[-_]\d{2}[-_]/, "$1");
}

function isDatedPermalink(permalink: unknown) {
  return (
    typeof permalink === "string" &&
    /^\/?\d{4}\/\d{2}\/\d{2}\/[^/]+\/?$/.test(permalink)
  );
}

function isArticle(entry: ArticleEntry) {
  return isDatedPermalink(entry.data.legacyPermalink ?? entry.data.permalink);
}

function isPublished(entry: ArticleEntry) {
  return (
    entry.data.draft !== true &&
    entry.data.published !== false &&
    entry.data.status !== "draft"
  );
}

export function isPublishedArticle(entry: ArticleEntry) {
  return isArticle(entry) && isPublished(entry);
}

export function entryDate(entry: ArticleEntry) {
  const date = entry.data.date;
  if (date instanceof Date) {
    return date;
  }
  if (typeof date === "string" || typeof date === "number") {
    return new Date(date);
  }
  return undefined;
}

export function formatDate(date: Date | undefined) {
  if (date === undefined || Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function authorName(entry: ArticleEntry) {
  const author = entry.data.author;
  if (typeof author === "string") {
    return author;
  }
  if (isRecord(author) && typeof author["display_name"] === "string") {
    return author["display_name"];
  }
  return "The Philosopher's Meme";
}

export function excerpt(entry: ArticleEntry) {
  const value = entry.data.description ?? entry.data.excerpt;
  return typeof value === "string" ? value : "";
}

function imageSource(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

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
  const value = entry.data.image ?? entry.data.fbpreview ?? entry.data.banner;
  return imageSource(value);
}

export function topicForEntry(entry: ArticleEntry) {
  const source = sourceFolder(entry);
  const fromSource = TOPICS.find((topic) => topic.source === source);
  if (fromSource !== undefined) {
    return fromSource;
  }

  const parent = typeof entry.data.parent === "string" ? entry.data.parent : "";
  const normalizedParent = normalizeSlug(parent);
  return TOPICS.find(
    (topic) =>
      topic.slug === normalizedParent ||
      normalizeSlug(topic.label) === normalizedParent,
  );
}

export function sortNewestFirst(entries: ArticleEntry[]) {
  return [...entries].sort((a, b) => {
    const bTime = entryDate(b)?.getTime() ?? 0;
    const aTime = entryDate(a)?.getTime() ?? 0;
    const dateSort = bTime - aTime;
    return dateSort !== 0
      ? dateSort
      : articleSlug(a).localeCompare(articleSlug(b));
  });
}

export function assertUniqueArticleSlugs(entries: ArticleEntry[]) {
  const seen = new Map<string, string>();

  for (const entry of entries.filter(isArticle)) {
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
