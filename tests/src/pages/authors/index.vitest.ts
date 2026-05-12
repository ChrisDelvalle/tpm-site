import { describe, expect, test } from "vitest";

import AuthorsIndexRoute from "../../../../src/pages/authors/index.astro";
import {
  createAstroTestContainer,
  testSiteUrl,
} from "../../../helpers/astro-container";

describe("authors index route", () => {
  test("renders the authors browsing page", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(AuthorsIndexRoute, {
      request: new Request(`${testSiteUrl}/authors/`),
    });

    expect(view).toContain("Authors");
    expect(view).toContain("Seong-Young Her");
    expect(view).toContain("/authors/seong-young-her/");
  });
});
