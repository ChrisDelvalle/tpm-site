import { describe, expect, test } from "vitest";

import SectionNav from "../../../../src/components/navigation/SectionNav.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";
import { navigationItems } from "./navigation-fixture";

describe("SectionNav", () => {
  test("renders a headed category navigation section", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(SectionNav, {
      props: { heading: "Topics", items: navigationItems },
    });

    expect(view).toContain("Topics");
    expect(view).toContain('aria-labelledby="section-nav-heading"');
    expect(view).toContain("Metamemetics");
  });
});
