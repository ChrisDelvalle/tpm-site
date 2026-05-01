import { describe, expect, test } from "vitest";

import SiteShell from "../../../../src/components/layout/SiteShell.astro";
import {
  createAstroTestContainer,
  testSiteUrl,
} from "../../../helpers/astro-container";

describe("SiteShell", () => {
  test("loads category navigation and composes header, main, and footer", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(SiteShell, {
      request: new Request(`${testSiteUrl}/articles/`),
      slots: { default: "<h1>Shell Content</h1>" },
    });

    expect(view).toContain("Shell Content");
    expect(view).toContain("Mobile site search");
    expect(view).toContain("Category navigation");
    expect(view).toContain("Support Our Research");
  });
});
