import { describe, expect, test } from "vitest";

import SupportBlock from "../../../../src/components/blocks/SupportBlock.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("SupportBlock", () => {
  test("renders a reusable support call to action", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(SupportBlock, {
      props: {
        body: "Support independent writing.",
        headingId: "test-support-block",
        label: "Support Us",
        title: "Support TPM",
      },
    });

    expect(view).toContain('aria-labelledby="test-support-block"');
    expect(view).toContain("Support TPM");
    expect(view).toContain("Support independent writing.");
    expect(view).toContain("Support Us");
    expect(view).toContain("w-full");
    expect(view).not.toContain("max-w-3xl");
  });
});
