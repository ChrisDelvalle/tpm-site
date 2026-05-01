/** Layout component example metadata used by catalog coverage checks. */
interface LayoutCatalogExample {
  componentPath: string;
  description: string;
  title: string;
}

export const layoutCatalogExamples = [
  {
    componentPath: "src/components/layout/SiteHeader.astro",
    description: "Sticky site header composed from navigation primitives.",
    title: "SiteHeader",
  },
  {
    componentPath: "src/components/layout/MainFrame.astro",
    description: "Main content and desktop category-sidebar composition.",
    title: "MainFrame",
  },
  {
    componentPath: "src/components/layout/SiteFooter.astro",
    description: "Footer with publication links, categories, and support CTA.",
    title: "SiteFooter",
  },
  {
    componentPath: "src/components/layout/PageFrame.astro",
    description: "Generic page spacing and width wrapper.",
    title: "PageFrame",
  },
] as const satisfies LayoutCatalogExample[];
