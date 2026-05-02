import { describe, expect, test } from "vitest";

import MobileMenu from "../../../../src/components/navigation/MobileMenu.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";
import { navigationItems } from "./navigation-fixture";

describe("MobileMenu", () => {
  test("renders primary links and category discovery", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(MobileMenu, {
      props: { categoryItems: navigationItems, currentPath: "/articles/" },
    });

    expect(view).toContain("<details");
    expect(view).toContain("Mobile site search");
    expect(view).toContain("theme-toggle");
    expect(view).toContain("Mobile primary navigation");
    expect(view).toContain("Articles");
    expect(view).toContain("About");
    expect(view).not.toContain("RSS");
    expect(view).not.toContain("Support Us");
    expect(view).toContain("data-mobile-menu-panel");
    expect(view).toContain("fixed inset-x-4");
    expect(view).toContain("grid-cols-[minmax(0,1fr)_auto]");
    expect(view).toContain("overflow-y-auto");
    expect(view).toContain("Metamemetics");
  });
});
