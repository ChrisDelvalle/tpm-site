import { describe, expect, test } from "vitest";

import HomePage from "../../../src/pages/index.astro";
import {
  createAstroTestContainer,
  testSiteUrl,
} from "../../helpers/astro-container";

describe("home page", () => {
  test("renders the flat homepage lead grid, featured carousel, and concise discovery links", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(HomePage, {
      request: new Request(`${testSiteUrl}/`),
    });

    expect(view).toContain("data-home-lead-grid");
    expect(view).toContain("data-home-lead-hero");
    expect(view).toContain("data-home-lead-featured");
    expect(view).toContain("data-home-lead-start");
    expect(view).toContain("data-home-lead-announcements");
    expect(view).toContain("Announcements");
    expect(view).toContain("Join the TPM Discord");
    expect(view).toContain("Support Us");
    expect(view).toContain("Join Discord");
    expect(view).toContain("Featured");
    expect(view).toContain("Start Here");
    expect(view).toContain("Categories");
    expect(view).toContain("More");
    expect(view).toContain("Recent");
    expect(view).toContain("All articles");
    expect(view).toContain("Authors");
    expect(view).toContain("Tags");
    expect(view).not.toContain("Most Recent Essays");
    expect(view).not.toContain("Most Recent");
    expect(view).not.toContain("GitHub");
  });
});
