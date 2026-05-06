import { describe, expect, test } from "vitest";

import SiteFooter from "../../../../src/components/layout/SiteFooter.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";
import { navigationItems } from "../navigation/navigation-fixture";

describe("SiteFooter", () => {
  test("renders publication links, categories, and support CTA", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(SiteFooter, {
      props: { navigationItems },
    });

    expect(view).toContain("Footer navigation");
    expect(view).toContain("Footer category navigation");
    expect(view).toContain("/bibliography/");
    expect(view).toContain("Support Our Research");
    expect(view).toContain('href="/collections/"');
    expect(view).toContain('href="/announcements/"');
    expect(view).toContain('href="/collections/featured/"');
    expect(view).toContain('href="/tags/"');
    expect(view).toContain("Metamemetics");
  });
});
