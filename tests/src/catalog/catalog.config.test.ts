import { describe, expect, test } from "bun:test";

import {
  catalogExampleComponentPaths,
  catalogMetadata,
  componentCatalogIgnoreList,
  componentCatalogStaticPaths,
  isComponentCatalogEnabled,
} from "../../../src/catalog/catalog.config";

describe("catalog config", () => {
  test("enables the catalog only for the explicit true value", () => {
    expect(isComponentCatalogEnabled("true")).toBe(true);
    expect(isComponentCatalogEnabled("")).toBe(false);
    expect(isComponentCatalogEnabled("1")).toBe(false);
    expect(isComponentCatalogEnabled(undefined)).toBe(false);
  });

  test("declares catalog metadata, examples, and reasoned ignores", () => {
    expect(catalogMetadata.title).toContain("Component Catalog");
    expect(catalogExampleComponentPaths).toContain(
      "src/components/ui/Button.astro",
    );
    expect(catalogExampleComponentPaths).toContain(
      "src/components/layout/SiteHeader.astro",
    );
    expect(catalogExampleComponentPaths).toContain(
      "src/components/authors/AuthorPage.astro",
    );
    expect(catalogExampleComponentPaths).toContain(
      "src/components/articles/ArticleHeader.astro",
    );
    expect(catalogExampleComponentPaths).toContain(
      "src/components/blocks/SupportBlock.astro",
    );
    expect(catalogExampleComponentPaths).toContain(
      "src/components/pages/MarkdownPage.astro",
    );
    expect(catalogExampleComponentPaths).toContain(
      "src/components/blocks/HomeHeroBlock.astro",
    );
    expect(catalogExampleComponentPaths).toContain(
      "src/components/blocks/SearchResultsBlock.astro",
    );
    expect(
      componentCatalogIgnoreList.every((entry) => entry.reason.length > 24),
    ).toBe(true);
  });

  test("returns catalog route paths only when enabled", () => {
    expect(componentCatalogStaticPaths(false)).toEqual([]);
    expect(componentCatalogStaticPaths(true)).toEqual([
      { params: { path: undefined } },
    ]);
  });
});
