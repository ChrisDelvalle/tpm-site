import { describe, expect, test } from "vitest";

import AnchoredRoot from "../../../../src/components/ui/AnchoredRoot.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("AnchoredRoot", () => {
  test("emits the shared root contract and processed adapter script", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(AnchoredRoot, {
      props: {
        class: "group",
        preset: "header-dropdown",
      },
      slots: {
        default: "Anchored content",
      },
    });

    expect(view).toContain("data-anchor-root");
    expect(view).toContain('data-anchor-preset="header-dropdown"');
    expect(view).toContain('class="group"');
    expect(view).toContain('type="module"');
    expect(view).toContain("Anchored content");
  });

  test("can render a details root for disclosure-owned anchored panels", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(AnchoredRoot, {
      props: {
        as: "details",
        preset: "mobile-shell-panel",
      },
      slots: {
        default: "<summary>Menu</summary>",
      },
    });

    expect(view).toContain("<details");
    expect(view).toContain("data-anchor-root");
    expect(view).toContain('data-anchor-preset="mobile-shell-panel"');
    expect(view).toContain("<summary>Menu</summary>");
  });
});
