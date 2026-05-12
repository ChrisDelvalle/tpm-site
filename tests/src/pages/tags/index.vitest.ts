import { describe, expect, test } from "vitest";

import TagsIndexPage from "../../../../src/pages/tags/index.astro";
import {
  createAstroTestContainer,
  testSiteUrl,
} from "../../../helpers/astro-container";

describe("tags index page", () => {
  test("renders canonical tag links from article frontmatter", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(TagsIndexPage, {
      request: new Request(`${testSiteUrl}/tags/`),
    });

    expect(view).toContain("Browse articles by recurring topics");
    expect(view).toContain("memeculture");
    expect(view).toContain("/tags/memeculture/");
    expect(view).toMatch(/articles/);
    expect(view).toContain("data-page-frame");
  });
});
