import type { ArticleArchiveItem } from "./archive";
import type { PublishableListItem } from "./publishable";

/** Compatibility name for the generic publishable-entry list item. */
export type ArticleListItem = PublishableListItem;
export type { PublishableListItem };

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
    authors: item.authors,
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
    image: item.image,
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
