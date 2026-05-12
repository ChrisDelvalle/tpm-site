/** Component example metadata for global bibliography components. */
interface BibliographyCatalogExample {
  componentPath: string;
  description: string;
  title: string;
}

export const bibliographyCatalogExamples = [
  {
    componentPath: "src/components/bibliography/BibliographyEmptyState.astro",
    description: "Empty-state guidance while canonical citations are prepared.",
    title: "BibliographyEmptyState",
  },
  {
    componentPath: "src/components/bibliography/BibliographyEntry.astro",
    description:
      "One global bibliography source with source-article backlinks.",
    title: "BibliographyEntry",
  },
  {
    componentPath: "src/components/bibliography/BibliographyList.astro",
    description: "Divided list of global bibliography entries.",
    title: "BibliographyList",
  },
  {
    componentPath: "src/components/bibliography/BibliographyPage.astro",
    description: "Global bibliography browsing page composition.",
    title: "BibliographyPage",
  },
  {
    componentPath:
      "src/components/bibliography/BibliographySourceArticles.astro",
    description: "Article backlinks for one global bibliography source.",
    title: "BibliographySourceArticles",
  },
] as const satisfies BibliographyCatalogExample[];
