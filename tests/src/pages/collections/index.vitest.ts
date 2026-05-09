import { describe, expect, test } from "vitest";

import CollectionsIndexPage from "../../../../src/pages/collections/index.astro";
import {
  createAstroTestContainer,
  testSiteUrl,
} from "../../../helpers/astro-container";

describe("collections index page", () => {
  test("renders active editorial collections with entry counts", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(CollectionsIndexPage, {
      request: new Request(`${testSiteUrl}/collections/`),
    });

    expect(view).toContain("Collections");
    expect(view).toContain("/collections/featured/");
    expect(view).toContain("/collections/start-here/");
    expect(view).toMatch(/entries/);
  });
});
