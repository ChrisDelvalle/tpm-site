import { describe, expect, test } from "bun:test";

import { layoutCatalogExamples } from "../../../../src/catalog/examples/layout.examples";

describe("layout catalog examples", () => {
  test("cover cataloged layout components with stable component paths", () => {
    expect(
      layoutCatalogExamples.map((example) => example.componentPath),
    ).toEqual([
      "src/components/layout/SiteHeader.astro",
      "src/components/layout/MainFrame.astro",
      "src/components/layout/ReadingBody.astro",
      "src/components/layout/BrowsingBody.astro",
      "src/components/layout/SectionStack.astro",
      "src/components/layout/ContentRail.astro",
      "src/components/layout/EndcapStack.astro",
      "src/components/layout/MarginSidebarLayout.astro",
      "src/components/layout/SiteFooter.astro",
      "src/components/layout/PageFrame.astro",
    ]);
  });
});
