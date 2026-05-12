/** Component example metadata for non-article Markdown page components. */
interface PageCatalogExample {
  componentPath: string;
  description: string;
  title: string;
}

export const pageCatalogExamples = [
  {
    componentPath: "src/components/pages/MarkdownPage.astro",
    description: "Non-article Markdown page composition shell.",
    title: "MarkdownPage",
  },
  {
    componentPath: "src/components/pages/PageHeader.astro",
    description: "Title and optional description for generic pages.",
    title: "PageHeader",
  },
  {
    componentPath: "src/components/pages/PageProse.astro",
    description: "Tailwind Typography wrapper for non-article Markdown.",
    title: "PageProse",
  },
] as const satisfies PageCatalogExample[];
