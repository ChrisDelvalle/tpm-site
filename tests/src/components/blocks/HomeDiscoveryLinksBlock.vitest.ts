import { describe, expect, test } from "vitest";

import HomeDiscoveryLinksBlock from "../../../../src/components/blocks/HomeDiscoveryLinksBlock.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("HomeDiscoveryLinksBlock", () => {
  test("renders thin discovery navigation without enumerating tags", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(HomeDiscoveryLinksBlock, {
      props: {
        links: [
          { href: "/articles/all/", label: "All articles" },
          { href: "/authors/", label: "Authors" },
          { href: "/tags/", label: "Tags" },
        ],
      },
    });

    expect(view).toContain("data-home-discovery-links");
    expect(view).toContain("More");
    expect(view).toContain("/tags/");
    expect(view).toContain("Authors");
    expect(view).not.toContain("GitHub");
    expect(view).not.toContain("RSS");
    expect(view).not.toContain("memeculture");
  });
});
