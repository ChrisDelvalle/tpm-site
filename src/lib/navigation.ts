import {
  articleUrl,
  type CategorySummary,
  categoryUrl,
  entryTitle,
} from "./routes";

/** Article link rendered inside category navigation menus. */
interface NavigationArticle {
  title: string;
  url: string;
}

/** Category navigation item with current-page open state. */
interface NavigationCategory {
  articles: NavigationArticle[];
  isOpen: boolean;
  slug: string;
  title: string;
}

/**
 * Builds category navigation state for the current route.
 *
 * @param categories Category summaries with sorted article entries.
 * @param currentPath Current request path from Astro.
 * @returns Display-ready sidebar/mobile category navigation items.
 */
export function categoryNavigationItems(
  categories: CategorySummary[],
  currentPath: string,
): NavigationCategory[] {
  return categories.map((category) => {
    const isCurrentCategory = currentPath.startsWith(
      categoryUrl(category.slug),
    );
    const articles = category.articles.map((article) => ({
      title: entryTitle(article),
      url: articleUrl(article.id),
    }));
    const containsCurrentArticle = articles.some((article) =>
      currentPath.startsWith(article.url),
    );

    return {
      articles,
      isOpen: isCurrentCategory || containsCurrentArticle,
      slug: category.slug,
      title: category.title,
    };
  });
}
