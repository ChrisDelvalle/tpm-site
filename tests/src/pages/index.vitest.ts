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
    expect(view).toContain("data-home-read-lead-group");
    expect(view).toContain("data-home-lead-hero");
    expect(view).toContain("data-home-lead-featured");
    expect(view).toContain("data-home-lead-start");
    expect(view).toContain("data-home-lead-announcements");
    expect(view).toContain("Announcements");
    expect(view).toContain("Join the TPM Discord");
    expect(view).toContain("Support Us");
    expect(view).toContain("Join Discord");
    expect(view).toContain("Start Here");
    expect(view).toContain("Read");
    expect(view).toContain("Articles");
    expect(view).toContain("Archive");
    expect(view).toContain("Collections");
    expect(view).toContain("Authors");
    expect(view).toContain("Tags");
    expect(view.indexOf("data-home-discovery-links")).toBeLessThan(
      view.indexOf("data-home-lead-grid"),
    );
    expect(view).toContain('href="/articles/"');
    expect(view).toContain('href="/articles/all/"');
    expect(view).toContain("pt-2");
    expect(view).toContain("gap-1");
    expect(view).toContain('href="/collections/start-here/"');
    expect(view).toContain('href="/announcements/"');
    expect(view).toContain('href="/collections/"');
    expect(view).not.toContain("home-featured-heading");
    expect(view).not.toContain("home-categories-heading");
    expect(view).not.toContain("home-recent-feed-heading");
    expect(view).not.toContain("Most Recent Essays");
    expect(view).not.toContain("Most Recent");
    expect(view).not.toContain("GitHub");
    expect(view).not.toContain("Visit YouTube");
    expect(view).not.toContain("https://www.youtube.com/@ThePhilosophersMeme");
  });
});
