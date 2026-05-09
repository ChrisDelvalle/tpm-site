import { describe, expect, test } from "vitest";

import SectionStack from "../../../../src/components/layout/SectionStack.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("SectionStack", () => {
  test("renders slotted sections with named rhythm", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(SectionStack, {
      props: { spacing: "relaxed" },
      slots: { default: "<section><h2>First section</h2></section>" },
    });

    expect(view).toContain("data-section-stack");
    expect(view).toContain("gap-10");
    expect(view).toContain("First section");
  });
});
