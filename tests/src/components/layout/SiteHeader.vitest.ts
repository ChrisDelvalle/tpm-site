import { describe, expect, test } from "vitest";

import SiteHeader from "../../../../src/components/layout/SiteHeader.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";
import { navigationItems } from "../navigation/navigation-fixture";

describe("SiteHeader", () => {
  test("renders brand, search, primary navigation, support, theme, and mobile menu", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(SiteHeader, {
      props: {
        currentPath: "/articles/",
        navigationItems,
      },
    });

    expect(view).toContain("The Philosopher&#39;s Meme");
    expect(view).toContain('role="search"');
    expect(view).toContain("Support Us");
    expect(view).toContain("theme-toggle");
    expect(view).toContain("Mobile site search");
  });
});
