import { describe, expect, test } from "vitest";

import AboutPage from "../../../src/pages/about.astro";
import {
  createAstroTestContainer,
  testSiteUrl,
} from "../../helpers/astro-container";

describe("about page", () => {
  test("renders Markdown page content through the prose wrapper", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(AboutPage, {
      request: new Request(`${testSiteUrl}/about/`),
    });

    expect(view).toContain("The Philosopher&#39;s Meme");
    expect(view).toContain("prose");
  });
});
