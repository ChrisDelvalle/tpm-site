import { describe, expect, test } from "vitest";

import SectionHeader from "../../../../src/components/ui/SectionHeader.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("SectionHeader", () => {
  test("renders a stable heading and optional action link", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(SectionHeader, {
      props: {
        actionHref: "/articles/all/",
        actionLabel: "View more",
        headingId: "test-section-heading",
        title: "Next Article",
      },
    });

    expect(view).toContain('id="test-section-heading"');
    expect(view).toContain("Next Article");
    expect(view).toContain('href="/articles/all/"');
    expect(view).toContain("View more");
    expect(view).toContain('data-astro-prefetch="hover"');
  });

  test("does not render an incomplete action", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(SectionHeader, {
      props: {
        actionHref: "/articles/all/",
        headingId: "test-section-heading",
        title: "Related Articles",
      },
    });

    expect(view).toContain("Related Articles");
    expect(view).not.toContain('href="/articles/all/"');
  });
});
