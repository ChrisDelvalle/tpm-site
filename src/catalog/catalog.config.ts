import { archiveCatalogExamples } from "./examples/archive.examples";
import { articleCatalogExamples } from "./examples/article.examples";
import { homeCatalogExamples } from "./examples/home.examples";
import { layoutCatalogExamples } from "./examples/layout.examples";
import { navigationCatalogExamples } from "./examples/navigation.examples";
import { pageCatalogExamples } from "./examples/page.examples";
import { uiCatalogExamples } from "./examples/ui.examples";

/** Metadata displayed on the private component catalog page. */
interface CatalogMetadata {
  description: string;
  title: string;
}

/** Public component intentionally excluded from catalog completeness checks. */
export interface ComponentCatalogIgnore {
  path: string;
  reason: string;
}

/** Static path shape for the private component catalog route. */
interface ComponentCatalogStaticPath {
  params: {
    path: string | undefined;
  };
}

export const catalogMetadata = {
  description:
    "Private design-system review surface for TPM Astro and Tailwind components.",
  title: "TPM Component Catalog",
} as const satisfies CatalogMetadata;

export const catalogExampleComponentPaths = [
  ...archiveCatalogExamples,
  ...articleCatalogExamples,
  ...homeCatalogExamples,
  ...uiCatalogExamples,
  ...navigationCatalogExamples,
  ...layoutCatalogExamples,
  ...pageCatalogExamples,
].map((example) => example.componentPath);

export const componentCatalogIgnoreList = [
  {
    path: "src/components/article/ArticleProse.astro",
    reason: "Legacy compatibility wrapper for existing imports.",
  },
  {
    path: "src/components/article/HoverImageCard.tsx",
    reason: "Legacy compatibility wrapper for existing imports.",
  },
  {
    path: "src/components/article/HoverImageLink.astro",
    reason: "Legacy compatibility wrapper for existing MDX imports.",
  },
  {
    path: "src/components/article/HoverImageParagraph.astro",
    reason: "Legacy compatibility wrapper for existing MDX imports.",
  },
  {
    path: "src/components/articles/HoverImageCard.tsx",
    reason:
      "Article-specific interactive MDX component pending article catalog examples.",
  },
  {
    path: "src/components/articles/HoverImageLink.astro",
    reason: "Article-specific MDX wrapper pending article catalog examples.",
  },
  {
    path: "src/components/articles/HoverImageParagraph.astro",
    reason: "Article-specific MDX wrapper pending article catalog examples.",
  },
  {
    path: "src/components/seo/ArticleJsonLd.astro",
    reason: "Non-visual SEO component covered by SEO and page render tests.",
  },
  {
    path: "src/components/seo/SiteHead.astro",
    reason: "Non-visual SEO component covered by SEO and page render tests.",
  },
  {
    path: "src/components/ui/hover-card.tsx",
    reason: "Internal shadcn/Radix primitive used by HoverImageCard.",
  },
  {
    path: "src/components/layout/SiteShell.astro",
    reason:
      "Full-page composition shell is covered by layout/page tests and would nest the catalog page.",
  },
] as const satisfies ComponentCatalogIgnore[];

/**
 * Checks whether the private component catalog route should be generated.
 *
 * @param value Environment value to evaluate.
 * @returns True only for the explicit string `true`.
 */
export function isComponentCatalogEnabled(
  value = process.env["TPM_COMPONENT_CATALOG"],
): boolean {
  return value === "true";
}

/**
 * Returns static paths for the private component catalog route.
 *
 * @param enabled Whether the catalog should be generated.
 * @returns Empty paths for normal builds, or the `/catalog/` path when enabled.
 */
export function componentCatalogStaticPaths(
  enabled = isComponentCatalogEnabled(),
): ComponentCatalogStaticPath[] {
  return enabled ? [{ params: { path: undefined } }] : [];
}
