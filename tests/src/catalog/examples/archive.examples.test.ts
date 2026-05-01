import { describe, expect, test } from "bun:test";

import { archiveCatalogExamples } from "../../../../src/catalog/examples/archive.examples";

describe("archive catalog examples", () => {
  test("cover archive, category, and search blocks with stable component paths", () => {
    const paths = archiveCatalogExamples.map(
      (example) => example.componentPath,
    );

    expect(paths).toContain("src/components/blocks/ArchiveListBlock.astro");
    expect(paths).toContain(
      "src/components/blocks/CategoryOverviewBlock.astro",
    );
    expect(paths).toContain("src/components/blocks/SearchResultsBlock.astro");
  });
});
