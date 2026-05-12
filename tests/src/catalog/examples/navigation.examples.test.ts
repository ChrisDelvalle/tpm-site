import { describe, expect, test } from "bun:test";

import { navigationCatalogExamples } from "../../../../src/catalog/examples/navigation.examples";

describe("navigation catalog examples", () => {
  test("cover the navigation component family with stable component paths", () => {
    expect(
      navigationCatalogExamples.map((example) => example.componentPath),
    ).toEqual([
      "src/components/navigation/BrandLink.astro",
      "src/components/navigation/PrimaryNav.astro",
      "src/components/navigation/DiscoveryMenu.astro",
      "src/components/navigation/CategoryDropdown.astro",
      "src/components/navigation/CategoryPreviewList.astro",
      "src/components/navigation/SearchForm.astro",
      "src/components/navigation/SearchReveal.astro",
      "src/components/navigation/ReadingNavigationLinks.astro",
      "src/components/navigation/SupportLink.astro",
      "src/components/navigation/ThemeToggle.astro",
      "src/components/navigation/SectionNavItem.astro",
      "src/components/navigation/CategoryGroup.astro",
      "src/components/navigation/CategoryTree.astro",
      "src/components/navigation/SectionNav.astro",
      "src/components/navigation/MobileMenu.astro",
    ]);
  });
});
