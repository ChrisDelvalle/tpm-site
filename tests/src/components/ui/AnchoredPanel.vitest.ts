import { describe, expect, test } from "vitest";

import AnchoredPanel from "../../../../src/components/ui/AnchoredPanel.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("AnchoredPanel", () => {
  test("emits the shared panel contract and CSS variable positioning hooks", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(AnchoredPanel, {
      props: {
        class: "z-50",
        style: "width: min(24rem, var(--anchor-max-width));",
      },
      slots: {
        default: "Panel content",
      },
    });

    expect(view).toContain("data-anchor-panel");
    expect(view).toContain("data-floating-panel");
    expect(view).toContain("left: var(--anchor-x");
    expect(view).toContain("top: var(--anchor-y");
    expect(view).toContain("max-width: var(--anchor-max-width");
    expect(view).toContain("max-height: var(--anchor-max-height");
    expect(view).toContain("width: min(24rem, var(--anchor-max-width));");
    expect(view).toContain("Panel content");
  });
});
