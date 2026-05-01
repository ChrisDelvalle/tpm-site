import { describe, expect, test } from "vitest";

import ArticlesIndexPage from "../../../../src/pages/articles/index.astro";
import {
  createAstroTestContainer,
  testSiteUrl,
} from "../../../helpers/astro-container";

describe("articles index page", () => {
  test("renders the article archive list", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(ArticlesIndexPage, {
      request: new Request(`${testSiteUrl}/articles/`),
    });

    expect(view).toContain("Essays and notes");
    expect(view).toContain('class="archive-list"');
  });
});
