import { describe, expect, test } from "bun:test";

import { bibliographyCatalogExamples } from "../../../../src/catalog/examples/bibliography.examples";

describe("bibliography catalog examples", () => {
  test("cover global bibliography components with stable component paths", () => {
    const paths = bibliographyCatalogExamples.map(
      (example) => example.componentPath,
    );

    expect(paths).toEqual([
      "src/components/bibliography/BibliographyEmptyState.astro",
      "src/components/bibliography/BibliographyEntry.astro",
      "src/components/bibliography/BibliographyList.astro",
      "src/components/bibliography/BibliographyPage.astro",
      "src/components/bibliography/BibliographySourceArticles.astro",
    ]);
    expect(new Set(paths).size).toBe(paths.length);
  });
});
