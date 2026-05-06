import type { ArticleListItem } from "./article-list";
import { type AnnouncementEntry, announcementUrl, formatDate } from "./routes";

/**
 * Converts an announcement entry into the shared article-list display shape.
 *
 * @param announcement Announcement content entry.
 * @returns Component-ready list item.
 */
export function announcementListItem(
  announcement: AnnouncementEntry,
): ArticleListItem {
  return {
    author: announcement.data.author,
    date: formatDate(announcement.data.date),
    description: announcement.data.description,
    href: announcementUrl(announcement.id),
    image:
      announcement.data.image === undefined
        ? undefined
        : {
            alt: announcement.data.imageAlt ?? announcement.data.title,
            src: announcement.data.image,
          },
    title: announcement.data.title,
  };
}

/**
 * Converts announcement entries into shared article-list display props.
 *
 * @param announcements Announcement content entries.
 * @returns Component-ready list items.
 */
export function announcementListItems(
  announcements: readonly AnnouncementEntry[],
): ArticleListItem[] {
  return announcements.map(announcementListItem);
}
