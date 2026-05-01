import { describe, expect, test } from "vitest";

import HomeArchiveLinksBlock from "../../../../src/components/blocks/HomeArchiveLinksBlock.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("HomeArchiveLinksBlock", () => {
  test("renders archive, category, and feed links", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(HomeArchiveLinksBlock);

    expect(view).toContain("Explore the Archive");
    expect(view).toContain("/articles/");
    expect(view).toContain("/categories/");
    expect(view).toContain("/feed.xml");
  });
});
