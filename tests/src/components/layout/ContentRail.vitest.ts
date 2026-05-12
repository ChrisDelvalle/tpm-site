import { describe, expect, test } from "vitest";

import ContentRail from "../../../../src/components/layout/ContentRail.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("ContentRail", () => {
  test("renders a labeled quiet rail only when content is present", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(ContentRail, {
      props: {
        label: "Article contents",
        position: "left",
        sticky: "below-header",
      },
      slots: { default: "<nav>Contents</nav>" },
    });

    expect(view).toContain('aria-label="Article contents"');
    expect(view).toContain('data-content-rail="left"');
    expect(view).toContain("xl:sticky");
    expect(view).toContain("Contents");
  });

  test("omits empty rails", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(ContentRail, {
      props: { position: "right" },
    });

    expect(view).not.toContain("data-content-rail");
  });
});
