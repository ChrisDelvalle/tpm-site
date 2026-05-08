import type { ArticleArchiveItem } from "./archive";
import {
  editorialCollectionById,
  type EditorialCollectionEntry,
  resolvePublishableCollection,
} from "./collections";
import { optionalFeatureRouteEntries } from "./feature-routes";
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
import type { SiteConfig, SiteRouteKey } from "./site-config";

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

/** Display-ready homepage discovery link. */
interface HomeDiscoveryLink {
  href: string;
  label: string;
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

/**
 * Resolves configured homepage discovery links against routes and feature flags.
 *
 * @param config Validated site config.
 * @returns Homepage discovery links safe to render for the active feature set.
 */
export function homepageDiscoveryLinks(
  config: SiteConfig,
): HomeDiscoveryLink[] {
  const disabledOptionalRoutes = new Set(
    optionalFeatureRouteEntries(config)
      .filter((entry) => !entry.enabled)
      .map((entry) => entry.routeKey),
  );

  return config.homepage.discoveryLinks.flatMap((link) => {
    if (link.route !== undefined) {
      return disabledOptionalRoutes.has(link.route)
        ? []
        : [{ href: routeForKey(config, link.route), label: link.label }];
    }

    return link.href === undefined
      ? []
      : [{ href: link.href, label: link.label }];
  });
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

function routeForKey(config: SiteConfig, key: SiteRouteKey): string {
  switch (key) {
    case "allArticles": {
      return config.routes.allArticles;
    }
    case "announcements": {
      return config.routes.announcements;
    }
    case "articles": {
      return config.routes.articles;
    }
    case "authors": {
      return config.routes.authors;
    }
    case "bibliography": {
      return config.routes.bibliography;
    }
    case "categories": {
      return config.routes.categories;
    }
    case "collections": {
      return config.routes.collections;
    }
    case "feed": {
      return config.routes.feed;
    }
    case "home": {
      return config.routes.home;
    }
    case "search": {
      return config.routes.search;
    }
    case "tags": {
      return config.routes.tags;
    }
  }
}
