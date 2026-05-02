/** Component example metadata for article and article-discovery components. */
interface ArticleCatalogExample {
  componentPath: string;
  description: string;
  title: string;
}

export const articleCatalogExamples = [
  {
    componentPath: "src/components/articles/ArticleBibliography.astro",
    description: "Article-local bibliography section for cite-* definitions.",
    title: "ArticleBibliography",
  },
  {
    componentPath: "src/components/articles/ArticleCard.astro",
    description: "Compact article teaser used in archives and discovery lists.",
    title: "ArticleCard",
  },
  {
    componentPath: "src/components/articles/ArticleEndcap.astro",
    description: "Article footer discovery and support composition.",
    title: "ArticleEndcap",
  },
  {
    componentPath: "src/components/articles/ArticleFootnotes.astro",
    description: "Article-local explanatory notes section.",
    title: "ArticleFootnotes",
  },
  {
    componentPath: "src/components/articles/ArticleHeader.astro",
    description: "Article title, category, metadata, description, and tags.",
    title: "ArticleHeader",
  },
  {
    componentPath: "src/components/articles/ArticleImage.astro",
    description: "Optimized article image with required alt text and caption.",
    title: "ArticleImage",
  },
  {
    componentPath: "src/components/articles/ArticleList.astro",
    description: "Responsive ordered list of article cards.",
    title: "ArticleList",
  },
  {
    componentPath: "src/components/articles/ArticleMeta.astro",
    description: "Author and machine-readable publication date metadata.",
    title: "ArticleMeta",
  },
  {
    componentPath: "src/components/articles/ArticleProse.astro",
    description: "Tailwind Typography wrapper for rendered Markdown prose.",
    title: "ArticleProse",
  },
  {
    componentPath: "src/components/articles/ArticleReferenceBacklinks.astro",
    description: "Accessible return links from references to inline markers.",
    title: "ArticleReferenceBacklinks",
  },
  {
    componentPath: "src/components/articles/ArticleReferences.astro",
    description: "Composed article notes and bibliography apparatus.",
    title: "ArticleReferences",
  },
  {
    componentPath: "src/components/articles/ArticleTableOfContents.astro",
    description:
      "Article-local heading navigation for the reading margin rail.",
    title: "ArticleTableOfContents",
  },
  {
    componentPath: "src/components/articles/TableOfContentsItem.astro",
    description: "One article heading link inside the table of contents.",
    title: "TableOfContentsItem",
  },
  {
    componentPath: "src/components/articles/TableOfContentsToggle.astro",
    description: "Native summary control for hiding article contents.",
    title: "TableOfContentsToggle",
  },
  {
    componentPath: "src/components/articles/ArticleTags.astro",
    description: "Article tag badges.",
    title: "ArticleTags",
  },
  {
    componentPath: "src/components/articles/MoreInCategoryBlock.astro",
    description: "Article-end list of additional posts in the same category.",
    title: "MoreInCategoryBlock",
  },
  {
    componentPath: "src/components/articles/RelatedArticlesBlock.astro",
    description: "Stable placeholder for future related-article discovery.",
    title: "RelatedArticlesBlock",
  },
  {
    componentPath: "src/components/blocks/SupportBlock.astro",
    description: "Reusable reader-support call to action.",
    title: "SupportBlock",
  },
] as const satisfies ArticleCatalogExample[];
