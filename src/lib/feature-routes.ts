import type { SiteConfig, SiteRouteKey } from "./site-config";

/** Optional features that own a generated route surface. */
type OptionalRouteFeatureKey =
  | "announcements"
  | "authors"
  | "bibliography"
  | "categories"
  | "collections"
  | "feed"
  | "search"
  | "tags";

/** Generated-output kind for an optional feature route. */
type OptionalRouteOutputKind = "directory" | "file";

/** Normalized route metadata for an optional feature. */
interface OptionalFeatureRouteEntry {
  enabled: boolean;
  feature: OptionalRouteFeatureKey;
  outputKind: OptionalRouteOutputKind;
  outputPath: string;
  route: string;
  routeKey: SiteRouteKey;
}

/**
 * Returns optional route entries controlled by site feature flags.
 *
 * @param config Validated site config.
 * @returns Optional feature routes with normalized generated-output paths.
 */
export function optionalFeatureRouteEntries(
  config: SiteConfig,
): OptionalFeatureRouteEntry[] {
  return [
    optionalFeatureRouteEntry(
      "announcements",
      "announcements",
      config.features.announcements,
      config.routes.announcements,
    ),
    optionalFeatureRouteEntry(
      "authors",
      "authors",
      config.features.authors,
      config.routes.authors,
    ),
    optionalFeatureRouteEntry(
      "bibliography",
      "bibliography",
      config.features.bibliography,
      config.routes.bibliography,
    ),
    optionalFeatureRouteEntry(
      "categories",
      "categories",
      config.features.categories,
      config.routes.categories,
    ),
    optionalFeatureRouteEntry(
      "collections",
      "collections",
      config.features.collections,
      config.routes.collections,
    ),
    optionalFeatureRouteEntry(
      "feed",
      "feed",
      config.features.feed,
      config.routes.feed,
    ),
    optionalFeatureRouteEntry(
      "search",
      "search",
      config.features.search,
      config.routes.search,
    ),
    optionalFeatureRouteEntry(
      "tags",
      "tags",
      config.features.tags,
      config.routes.tags,
    ),
  ];
}

/**
 * Checks whether a rendered pathname belongs to a configured optional route.
 *
 * @param pathname Rendered URL pathname.
 * @param route Configured route path.
 * @returns True when the route owns the pathname.
 */
export function optionalRouteOwnsPathname(
  pathname: string,
  route: string,
): boolean {
  const normalizedPathname = normalizePathname(pathname);
  const normalizedRoute = normalizePathname(route);

  if (routeOutputKind(normalizedRoute) === "file") {
    return normalizedPathname === normalizedRoute;
  }

  return (
    normalizedPathname === normalizedRoute ||
    normalizedPathname.startsWith(normalizedRoute)
  );
}

function normalizePathname(value: string): string {
  const pathname = value.split("#")[0]?.split("?")[0] ?? "/";
  const withLeadingSlash = pathname.startsWith("/") ? pathname : `/${pathname}`;

  if (withLeadingSlash === "/") {
    return "/";
  }

  return withLeadingSlash.endsWith(".xml") || withLeadingSlash.endsWith("/")
    ? withLeadingSlash
    : `${withLeadingSlash}/`;
}

function optionalFeatureRouteEntry(
  feature: OptionalRouteFeatureKey,
  routeKey: SiteRouteKey,
  enabled: boolean,
  route: string,
): OptionalFeatureRouteEntry {
  return {
    enabled,
    feature,
    outputKind: routeOutputKind(route),
    outputPath: routeOutputPath(route),
    route,
    routeKey,
  };
}

function routeOutputKind(route: string): OptionalRouteOutputKind {
  return normalizePathname(route).endsWith(".xml") ? "file" : "directory";
}

function routeOutputPath(route: string): string {
  const pathname = normalizePathname(route);
  const relativePath = pathname.replace(/^\/+/u, "");

  if (relativePath === "") {
    return "index.html";
  }

  return routeOutputKind(pathname) === "directory"
    ? relativePath.replace(/\/+$/u, "")
    : relativePath;
}
