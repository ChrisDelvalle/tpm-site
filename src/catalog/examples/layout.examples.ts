/** Layout component example metadata used by catalog coverage checks. */
interface LayoutCatalogExample {
  componentPath: string;
  description: string;
  title: string;
}

export const layoutCatalogExamples = [
  {
    componentPath: "src/components/layout/PriorityInlineRow.astro",
    description:
      "Start, centered, and end slot primitive for centered identity rows.",
    title: "PriorityInlineRow",
  },
  {
    componentPath: "src/components/layout/SiteHeader.astro",
    description: "Sticky site header composed from navigation primitives.",
    title: "SiteHeader",
  },
  {
    componentPath: "src/components/layout/MainFrame.astro",
    description: "Single main landmark that receives page-body primitives.",
    title: "MainFrame",
  },
  {
    componentPath: "src/components/layout/ReadingBody.astro",
    description:
      "Readable article and prose page body with optional rail slot.",
    title: "ReadingBody",
  },
  {
    componentPath: "src/components/layout/BrowsingBody.astro",
    description:
      "Standard browsing page body for archives, categories, and search.",
    title: "BrowsingBody",
  },
  {
    componentPath: "src/components/layout/SectionStack.astro",
    description: "Reusable vertical rhythm between page sections.",
    title: "SectionStack",
  },
  {
    componentPath: "src/components/layout/ContentRail.astro",
    description: "Quiet secondary rail for article-local navigation or tools.",
    title: "ContentRail",
  },
  {
    componentPath: "src/components/layout/EndcapStack.astro",
    description:
      "Ordered stack for support, discovery, references, and metadata.",
    title: "EndcapStack",
  },
  {
    componentPath: "src/components/layout/MarginSidebarLayout.astro",
    description:
      "Centered content layout with optional side rails in page margin space.",
    title: "MarginSidebarLayout",
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
