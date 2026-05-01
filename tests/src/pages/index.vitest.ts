import { describe, expect, test } from "vitest";

import HomePage from "../../../src/pages/index.astro";
import {
  createAstroTestContainer,
  testSiteUrl,
} from "../../helpers/astro-container";

describe("home page", () => {
  test("renders the homepage hero, support link, and latest-post section", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(HomePage, {
      request: new Request(`${testSiteUrl}/`),
    });

    expect(view).toContain("The philosophy of memes");
    expect(view).toContain("Support Us");
    expect(view).toContain("Most Recent Post");
  });
});
