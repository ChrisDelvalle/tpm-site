import { describe, expect, test } from "bun:test";

import { pageCatalogExamples } from "../../../../src/catalog/examples/page.examples";

describe("page catalog examples", () => {
  test("cover generic Markdown page components with stable paths", () => {
    expect(pageCatalogExamples.map((example) => example.componentPath)).toEqual(
      [
        "src/components/pages/MarkdownPage.astro",
        "src/components/pages/PageHeader.astro",
        "src/components/pages/PageProse.astro",
      ],
    );
  });
});
