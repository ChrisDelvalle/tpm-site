import type { ArticleArchiveItem } from "./archive";
import {
  editorialCollectionById,
  type EditorialCollectionEntry,
  resolvePublishableCollection,
} from "./collections";
import {
  type PublishableEntry,
  publishableFromAnnouncement,
  publishableFromArticleArchive,
  publishableIndex,
  type PublishableKind,
  type PublishableListItem,
  publishableListItems,
  visiblePublishables,
} from "./publishable";
import type { AnnouncementEntry } from "./routes";

/** Display-ready homepage featured item. */
export interface HomeFeaturedItem extends PublishableListItem {
  id: string;
  kind: PublishableKind;
  note?: string | undefined;
  slug: string;
}

/** Inputs required to build the homepage view model. */
interface HomePageViewModelInput {
  announcementLimit?: number;
  announcements: readonly AnnouncementEntry[];
  archiveItems: readonly ArticleArchiveItem[];
  collections: readonly EditorialCollectionEntry[];
  featuredCollectionId?: string;
  recentLimit?: number;
  startHereCollectionId?: string;
}

/** Display-ready homepage view model consumed by the Astro route. */
interface HomePageViewModel {
  announcementItems: PublishableListItem[];
  featuredItems: HomeFeaturedItem[];
  recentFeedItems: PublishableListItem[];
  startHereItems: PublishableListItem[];
}

/**
 * Builds the homepage view model from publishable entries and collections.
 *
 * @param input Homepage content inputs.
 * @param input.announcementLimit Maximum newest announcements shown on home.
 * @param input.announcements Published announcements.
 * @param input.archiveItems Display-ready normal article archive items.
 * @param input.collections Active editor-owned collections.
 * @param input.featuredCollectionId Collection ID used for the featured carousel.
 * @param input.recentLimit Maximum newest normal articles shown on home.
 * @param input.startHereCollectionId Collection ID used for the start-here list.
 * @returns Display-ready homepage lists and feature items.
 */
export function homePageViewModel({
  announcementLimit = 3,
  announcements,
  archiveItems,
  collections,
  featuredCollectionId = "featured",
  recentLimit = 8,
  startHereCollectionId = "start-here",
}: HomePageViewModelInput): HomePageViewModel {
  const articlePublishables = archiveItems.map(publishableFromArticleArchive);
  const announcementPublishables = announcements.map(
    publishableFromAnnouncement,
  );
  const publishables = [...articlePublishables, ...announcementPublishables];
  const index = publishableIndex(publishables);
  const featuredCollection = requiredCollection(
    collections,
    featuredCollectionId,
  );
  const startHereCollection = requiredCollection(
    collections,
    startHereCollectionId,
  );
  const featuredItems = resolvePublishableCollection(
    featuredCollection,
    index,
    { requiredVisibility: "homepage" },
  ).items.map(featuredItemFromResolvedItem);
  const startHereItems = publishableListItems(
    resolvePublishableCollection(startHereCollection, index, {
      requiredVisibility: "homepage",
    }).items.map((item) => item.entry),
  );
  const announcementItems = publishableListItems(
    visiblePublishables(announcementPublishables, "homepage").slice(
      0,
      announcementLimit,
    ),
  );
  const recentFeedItems = publishableListItems(
    visiblePublishables(articlePublishables, "homepage").slice(0, recentLimit),
  );

  return {
    announcementItems,
    featuredItems,
    recentFeedItems,
    startHereItems,
  };
}

function featuredItemFromResolvedItem({
  entry,
  note,
}: {
  entry: PublishableEntry;
  note?: string | undefined;
}): HomeFeaturedItem {
  return {
    ...entry,
    id: entry.slug,
    note,
  };
}

function requiredCollection(
  collections: readonly EditorialCollectionEntry[],
  id: string,
): EditorialCollectionEntry {
  const collection = editorialCollectionById(collections, id);

  if (collection === undefined) {
    throw new Error(`Missing required homepage collection "${id}".`);
  }

  return collection;
}
