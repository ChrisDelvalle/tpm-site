import { authorDisplayNameForArticle } from "./authors";
import { normalizePublishableVisibility } from "./publishable";
import {
  type AnnouncementEntry,
  announcementUrl,
  type ArticleEntry,
  articleUrl,
  type AuthorEntry,
  entryDate,
  entryTitle,
  excerpt,
} from "./routes";
import { siteConfig } from "./site-config";

/** Feed item source normalized from any publishable content collection. */
export interface PublishableFeedEntry {
  author: string;
  description: string;
  href: string;
  kind: "announcement" | "article";
  pubDate: Date;
  title: string;
}

interface PublishableFeedEntriesInput {
  announcements: readonly AnnouncementEntry[];
  articles: readonly ArticleEntry[];
  authors: readonly AuthorEntry[];
}

/**
 * Builds newest-first RSS source entries from publishable content.
 *
 * @param input Articles, announcements, and author metadata.
 * @returns Feed entries visible on the feed surface.
 */
export function publishableFeedEntries(
  input: PublishableFeedEntriesInput,
): PublishableFeedEntry[] {
  return [
    ...articleFeedEntries(input.articles, input.authors),
    ...announcementFeedEntries(input.announcements),
  ].sort(sortFeedEntriesNewestFirst);
}

/**
 * Builds RSS source entries from articles visible in feeds.
 *
 * @param articles Published article entries.
 * @param authors Author metadata used for display bylines.
 * @returns Feed entries for feed-visible articles.
 */
export function articleFeedEntries(
  articles: readonly ArticleEntry[],
  authors: readonly AuthorEntry[],
): PublishableFeedEntry[] {
  return articles.filter(articleVisibleInFeed).map((article) => {
    const title = entryTitle(article);

    return {
      author: authorDisplayNameForArticle(article, authors),
      description: excerpt(article),
      href: articleUrl(article.id),
      kind: "article",
      pubDate: entryDate(article),
      title,
    };
  });
}

/**
 * Builds RSS source entries from announcements visible in feeds.
 *
 * @param announcements Published announcement entries.
 * @returns Feed entries for feed-visible announcements.
 */
export function announcementFeedEntries(
  announcements: readonly AnnouncementEntry[],
): PublishableFeedEntry[] {
  return announcements.filter(announcementVisibleInFeed).map((announcement) => {
    const title = announcement.data.title;

    return {
      author: announcement.data.author,
      description: announcement.data.description,
      href: announcementUrl(announcement.id),
      kind: "announcement",
      pubDate: announcement.data.date,
      title,
    };
  });
}

function articleVisibleInFeed(article: ArticleEntry): boolean {
  return normalizePublishableVisibility(
    article.data.visibility,
    siteConfig.contentDefaults.articles.visibility,
  ).feed;
}

function announcementVisibleInFeed(announcement: AnnouncementEntry): boolean {
  return normalizePublishableVisibility(
    announcement.data.visibility,
    siteConfig.contentDefaults.announcements.visibility,
  ).feed;
}

function sortFeedEntriesNewestFirst(
  left: PublishableFeedEntry,
  right: PublishableFeedEntry,
): number {
  const dateSort = right.pubDate.getTime() - left.pubDate.getTime();
  return dateSort !== 0 ? dateSort : left.href.localeCompare(right.href);
}
