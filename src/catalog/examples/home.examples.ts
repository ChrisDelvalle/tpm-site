/** Component example metadata for homepage block components. */
interface HomeCatalogExample {
  componentPath: string;
  description: string;
  title: string;
}

export const homeCatalogExamples = [
  {
    componentPath: "src/components/blocks/HomeAnnouncementBlock.astro",
    description: "Homepage announcement image and editable Markdown prose.",
    title: "HomeAnnouncementBlock",
  },
  {
    componentPath: "src/components/blocks/HomeArchiveLinksBlock.astro",
    description: "Archive, category, and RSS discovery links.",
    title: "HomeArchiveLinksBlock",
  },
  {
    componentPath: "src/components/blocks/HomeCategoryOverviewBlock.astro",
    description: "Homepage category discovery grid.",
    title: "HomeCategoryOverviewBlock",
  },
  {
    componentPath: "src/components/blocks/HomeFeaturedArticlesBlock.astro",
    description: "Start-here or featured article list.",
    title: "HomeFeaturedArticlesBlock",
  },
  {
    componentPath: "src/components/blocks/HomeHeroBlock.astro",
    description: "Homepage brand image, tagline, and primary calls to action.",
    title: "HomeHeroBlock",
  },
  {
    componentPath: "src/components/blocks/HomeLatestArticleBlock.astro",
    description: "Most recent article teaser with image.",
    title: "HomeLatestArticleBlock",
  },
] as const satisfies HomeCatalogExample[];
