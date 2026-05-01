import { describe, expect, test } from "vitest";

import SearchPage from "../../../src/pages/search.astro";
import {
  createAstroTestContainer,
  testSiteUrl,
} from "../../helpers/astro-container";

describe("search page", () => {
  test("renders the search page mount point", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(SearchPage, {
      request: new Request(`${testSiteUrl}/search/`),
    });

    expect(view).toContain("Search");
    expect(view).toContain('id="search"');
    expect(view).toContain("data-search-results");
    expect(view).toContain("Search The Philosopher&#39;s Meme archive");
  });
});
