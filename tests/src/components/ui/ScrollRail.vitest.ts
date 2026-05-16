import { describe, expect, test } from "vitest";

import ScrollRail from "../../../../src/components/ui/ScrollRail.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("ScrollRail", () => {
  test("renders a controlled horizontal rail with stable data hooks", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(ScrollRail, {
      props: {
        nextLabel: "Scroll right",
        previousLabel: "Scroll left",
        railId: "example-rail",
      },
      slots: {
        default: "<li>First</li><li>Second</li>",
      },
    });

    expect(view).toContain("data-scroll-rail");
    expect(view).toContain('id="example-rail"');
    expect(view).toContain("data-scroll-rail-viewport");
    expect(view).toContain("data-scroll-rail-list");
    expect(view).toContain("data-scroll-rail-previous");
    expect(view).toContain("data-scroll-rail-next");
    expect(view).toContain("Scroll left");
    expect(view).toContain("Scroll right");
    expect(view).toContain("<script");
  });
});
