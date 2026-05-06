import { describe, expect, test } from "vitest";

import AnnouncementsIndexPage from "../../../../src/pages/announcements/index.astro";
import {
  createAstroTestContainer,
  testSiteUrl,
} from "../../../helpers/astro-container";

describe("announcements index page", () => {
  test("renders announcement entries without article category browsing", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(AnnouncementsIndexPage, {
      request: new Request(`${testSiteUrl}/announcements/`),
    });

    expect(view).toContain("Announcements");
    expect(view).toContain("Join the TPM Discord");
    expect(view).toContain("/announcements/discord-community/");
    expect(view).not.toContain("Browse Categories");
    expect(view).not.toContain("/articles/discord-community/");
  });
});
