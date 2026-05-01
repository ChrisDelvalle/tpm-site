import { describe, expect, test } from "vitest";

import NotFoundPage from "../../../src/pages/404.astro";
import {
  createAstroTestContainer,
  testSiteUrl,
} from "../../helpers/astro-container";

describe("404 page", () => {
  test("renders the not-found message and archive recovery link", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(NotFoundPage, {
      request: new Request(`${testSiteUrl}/missing/`),
    });

    expect(view).toContain("Page Not Found");
    expect(view).toContain("/articles/");
  });
});
