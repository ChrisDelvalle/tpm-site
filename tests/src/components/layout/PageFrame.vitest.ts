import { describe, expect, test } from "vitest";

import PageFrame from "../../../../src/components/layout/PageFrame.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("PageFrame", () => {
  test("renders slotted page content inside a responsive container", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(PageFrame, {
      props: { size: "prose", spacing: "sm" },
      slots: { default: "<p>Page frame content</p>" },
    });

    expect(view).toContain("Page frame content");
    expect(view).toContain("max-w-prose");
  });
});
