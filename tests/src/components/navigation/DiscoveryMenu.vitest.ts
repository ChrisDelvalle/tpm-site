import { describe, expect, test } from "vitest";

import DiscoveryMenu from "../../../../src/components/navigation/DiscoveryMenu.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";
import { navigationItems } from "./navigation-fixture";

describe("DiscoveryMenu", () => {
  test("renders wide-viewport category discovery without rendering a full archive", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(DiscoveryMenu, {
      props: { currentPath: "/categories/history/", items: navigationItems },
    });

    expect(view).toContain('aria-label="Category discovery"');
    expect(view).toContain("data-discovery-menu");
    expect(view).toContain("Browse Metamemetics articles");
    expect(view).toContain("Browse History articles");
    expect(view).toContain("2xl:flex");
  });

  test("omits the discovery nav when there are no categories", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(DiscoveryMenu, {
      props: { items: [] },
    });

    expect(view).not.toContain("data-discovery-menu");
  });
});
