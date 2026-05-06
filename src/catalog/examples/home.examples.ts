/** Component example metadata for homepage block components. */
interface HomeCatalogExample {
  componentPath: string;
  description: string;
  title: string;
}

export const homeCatalogExamples = [
  {
    componentPath: "src/components/articles/FlatArticleList.astro",
    description: "Flat compact article-like list for homepage rails.",
    title: "FlatArticleList",
  },
  {
    componentPath: "src/components/articles/FlatArticleTeaser.astro",
    description: "One flat compact article-like teaser.",
    title: "FlatArticleTeaser",
  },
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
    componentPath: "src/components/blocks/HomeCurrentPanel.astro",
    description: "Compact current project, community, and support links.",
    title: "HomeCurrentPanel",
  },
  {
    componentPath: "src/components/blocks/HomeDiscoveryLinksBlock.astro",
    description: "Thin homepage strip for secondary discovery links.",
    title: "HomeDiscoveryLinksBlock",
  },
  {
    componentPath: "src/components/blocks/HomeFeaturedArticlesBlock.astro",
    description: "Start-here or featured article list.",
    title: "HomeFeaturedArticlesBlock",
  },
  {
    componentPath: "src/components/blocks/HomeFeaturedCarousel.astro",
    description: "Static-first featured item carousel.",
    title: "HomeFeaturedCarousel",
  },
  {
    componentPath: "src/components/blocks/HomeFeaturedSlide.astro",
    description: "One normalized homepage featured carousel item.",
    title: "HomeFeaturedSlide",
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
  {
    componentPath: "src/components/blocks/HomeMastheadBlock.astro",
    description:
      "Homepage first-impression grid with reading and current links.",
    title: "HomeMastheadBlock",
  },
  {
    componentPath: "src/components/blocks/HomeRecentPostsBlock.astro",
    description: "Compact latest-post list for the homepage promo row.",
    title: "HomeRecentPostsBlock",
  },
  {
    componentPath: "src/components/blocks/HomeStartHerePanel.astro",
    description: "Curated new-reader article links for the homepage masthead.",
    title: "HomeStartHerePanel",
  },
] as const satisfies HomeCatalogExample[];
