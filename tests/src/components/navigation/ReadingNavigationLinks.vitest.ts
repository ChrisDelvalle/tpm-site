import { describe, expect, test } from "vitest";

import ReadingNavigationLinks from "../../../../src/components/navigation/ReadingNavigationLinks.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("ReadingNavigationLinks", () => {
  test("renders compact links with an optional title prefix", async () => {
    const container = await createAstroTestContainer();
    const links = [
      { href: "/articles/", label: "Articles" },
      { href: "/articles/all/", label: "Archive" },
      { href: "/authors/", label: "Authors" },
    ];
    const titledView = await container.renderToString(ReadingNavigationLinks, {
      props: {
        "aria-label": "Homepage reading navigation",
        links,
        title: "Read",
      },
    });
    const untitledView = await container.renderToString(
      ReadingNavigationLinks,
      {
        props: {
          "aria-label": "Article reading navigation",
          links,
          showTitle: false,
        },
      },
    );

    expect(titledView).toContain("Read");
    expect(titledView).toContain("Articles");
    expect(titledView).toContain("Archive");
    expect(titledView).toContain("flex-nowrap");
    expect(titledView).toContain("truncate");
    expect(titledView).toContain("py-0");
    expect(untitledView).toContain('aria-label="Article reading navigation"');
    expect(untitledView).toContain("Articles");
    expect(untitledView).not.toContain("font-semibold whitespace-nowrap");
    expect(untitledView).not.toContain('aria-hidden="true">/');
  });
});
