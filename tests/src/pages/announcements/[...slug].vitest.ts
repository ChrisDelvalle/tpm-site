import { describe, expect, test } from "vitest";

import { getAnnouncements } from "../../../../src/lib/content";
import AnnouncementPage from "../../../../src/pages/announcements/[...slug].astro";
import {
  createAstroTestContainer,
  testSiteUrl,
} from "../../../helpers/astro-container";

describe("announcement page", () => {
  test("renders an announcement as a reading page without normal article chrome", async () => {
    const [announcement] = await getAnnouncements();

    if (announcement === undefined) {
      throw new Error("Expected at least one announcement fixture.");
    }

    const container = await createAstroTestContainer();
    const view = await container.renderToString(AnnouncementPage, {
      props: { announcement },
      request: new Request(`${testSiteUrl}/announcements/${announcement.id}/`),
    });

    expect(view).toContain(announcement.data.title);
    expect(view).toContain("data-article-prose");
    expect(view).toContain("data-pagefind-body");
    expect(view).toContain(`/announcements/${announcement.id}/`);
    expect(view).not.toContain("Article tags");
    expect(view).not.toContain("More in");
  });
});
