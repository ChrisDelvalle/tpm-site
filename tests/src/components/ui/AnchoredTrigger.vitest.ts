import { describe, expect, test } from "vitest";

import AnchoredTrigger from "../../../../src/components/ui/AnchoredTrigger.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("AnchoredTrigger", () => {
  test("emits the shared trigger contract while preserving native link semantics", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(AnchoredTrigger, {
      props: {
        as: "a",
        class: "inline-flex",
        href: "/categories/culture/",
      },
      slots: {
        default: "Culture",
      },
    });

    expect(view).toContain("<a");
    expect(view).toContain("data-anchor-trigger");
    expect(view).toContain('href="/categories/culture/"');
    expect(view).toContain('class="inline-flex"');
    expect(view).toContain("Culture");
  });
});
