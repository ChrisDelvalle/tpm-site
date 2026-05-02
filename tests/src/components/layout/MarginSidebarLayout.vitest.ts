import { describe, expect, test } from "vitest";

import MarginSidebarLayout from "../../../../src/components/layout/MarginSidebarLayout.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("MarginSidebarLayout", () => {
  test("centers content without blank rail columns when no rails exist", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(MarginSidebarLayout, {
      slots: { default: "<article>Reading content</article>" },
    });

    expect(view).toContain("data-margin-sidebar-layout");
    expect(view).toContain("justify-items-center");
    expect(view).toContain("Reading content");
    expect(view).not.toContain("data-margin-sidebar-left");
  });

  test("places optional rail content outside the centered content column", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(MarginSidebarLayout, {
      slots: {
        default: "<article>Reading content</article>",
        left: "<nav>Local contents</nav>",
      },
    });

    expect(view).toContain("data-margin-sidebar-left");
    expect(view).toContain("data-margin-sidebar-content");
    expect(view).toContain("Local contents");
    expect(view).toContain("2xl:grid-cols");
  });
});
