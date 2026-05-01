import type { ArticleArchiveItem } from "./archive";

/** Display-ready item consumed by article cards and article lists. */
export interface ArticleListItem {
  author?: string | undefined;
  category?:
    | undefined
    | {
        href: string;
        title: string;
      };
  date?: string | undefined;
  description?: string | undefined;
  href: string;
  title: string;
}

/**
 * Converts an archive item into the shared article-list item shape.
 *
 * @param item Archive item from content helpers.
 * @returns Component-ready article list item.
 */
export function articleListItemFromArchive(
  item: ArticleArchiveItem,
): ArticleListItem {
  return {
    author: item.author,
    category:
      item.category === undefined
        ? undefined
        : {
            href: item.category.url,
            title: item.category.title,
          },
    date: item.date,
    description: item.description,
    href: item.url,
    title: item.title,
  };
}

/**
 * Converts archive items into shared article-list item props.
 *
 * @param items Archive items from content helpers.
 * @returns Component-ready article list items.
 */
export function articleListItemsFromArchive(
  items: readonly ArticleArchiveItem[],
): ArticleListItem[] {
  return items.map(articleListItemFromArchive);
}
