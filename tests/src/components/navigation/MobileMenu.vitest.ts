import { describe, expect, test } from "vitest";

import MobileMenu from "../../../../src/components/navigation/MobileMenu.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";
import { navigationItems } from "./navigation-fixture";

describe("MobileMenu", () => {
  test("renders search, primary links, support, theme, and category discovery", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(MobileMenu, {
      props: { currentPath: "/articles/", items: navigationItems },
    });

    expect(view).toContain("<details");
    expect(view).toContain("Mobile site search");
    expect(view).toContain("Support Us");
    expect(view).toContain("theme-toggle");
    expect(view).toContain("Metamemetics");
  });
});
