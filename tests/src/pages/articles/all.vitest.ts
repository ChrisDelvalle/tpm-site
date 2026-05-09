import { describe, expect, test } from "vitest";

import ArticlesArchivePage from "../../../../src/pages/articles/all.astro";
import {
  createAstroTestContainer,
  testSiteUrl,
} from "../../../helpers/astro-container";

describe("all articles page", () => {
  test("renders the complete chronological article archive", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(ArticlesArchivePage, {
      request: new Request(`${testSiteUrl}/articles/all/`),
    });

    expect(view).toContain("All Articles");
    expect(view).toContain("The complete chronological archive.");
    expect(view).toContain("data-pagefind-ignore");
    expect(view).toContain("<article");
  });
});
