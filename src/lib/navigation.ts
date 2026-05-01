import {
  articleSlug,
  articleUrl,
  type CategorySummary,
  categoryUrl,
  entryTitle,
  excerpt,
} from "./routes";

/** Article data rendered inside navigation and discovery surfaces. */
export interface ArticleSummary {
  description: string;
  href: string;
  isCurrent: boolean;
  slug: string;
  title: string;
}

/** Category section data rendered inside navigation and discovery surfaces. */
export interface SectionNavItem {
  articles: ArticleSummary[];
  description?: string | undefined;
  href: string;
  isCurrent: boolean;
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
export function sectionNavigationItems(
  categories: CategorySummary[],
  currentPath: string,
): SectionNavItem[] {
  return categories.map((category) => {
    const href = categoryUrl(category.slug);
    const isCurrent = currentPath.startsWith(href);
    const articles = category.articles.map((article) =>
      articleSummary(article, currentPath),
    );
    const containsCurrentArticle = articles.some(
      (article) => article.isCurrent,
    );

    return {
      articles,
      description: category.description,
      href,
      isCurrent,
      isOpen: isCurrent || containsCurrentArticle,
      slug: category.slug,
      title: category.title,
    };
  });
}

function articleSummary(
  article: CategorySummary["articles"][number],
  currentPath: string,
): ArticleSummary {
  const slug = articleSlug(article);
  const href = articleUrl(slug);

  return {
    description: excerpt(article),
    href,
    isCurrent: currentPath.startsWith(href),
    slug,
    title: entryTitle(article),
  };
}
