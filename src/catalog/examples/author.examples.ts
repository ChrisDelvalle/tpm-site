/** Component example metadata for author profile and byline components. */
interface AuthorCatalogExample {
  componentPath: string;
  description: string;
  title: string;
}

export const authorCatalogExamples = [
  {
    componentPath: "src/components/authors/AuthorArticleList.astro",
    description: "Author-profile article listing backed by shared cards.",
    title: "AuthorArticleList",
  },
  {
    componentPath: "src/components/authors/AuthorBioBlock.astro",
    description: "Optional author biography and approved profile links.",
    title: "AuthorBioBlock",
  },
  {
    componentPath: "src/components/authors/AuthorByline.astro",
    description: "Structured linked author byline with legacy fallback.",
    title: "AuthorByline",
  },
  {
    componentPath: "src/components/authors/AuthorLink.astro",
    description: "Single author profile link.",
    title: "AuthorLink",
  },
  {
    componentPath: "src/components/authors/AuthorPage.astro",
    description: "Composed author profile page.",
    title: "AuthorPage",
  },
  {
    componentPath: "src/components/authors/AuthorProfileHeader.astro",
    description: "Author identity, article count, and optional links.",
    title: "AuthorProfileHeader",
  },
  {
    componentPath: "src/components/authors/AuthorSocialLinks.astro",
    description: "Approved public profile links for an author.",
    title: "AuthorSocialLinks",
  },
  {
    componentPath: "src/components/authors/AuthorsIndexPage.astro",
    description: "Browsing page for all public author profiles.",
    title: "AuthorsIndexPage",
  },
] as const satisfies AuthorCatalogExample[];
