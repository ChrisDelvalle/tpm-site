import { describe, expect, test } from "vitest";

import EndcapStack from "../../../../src/components/layout/EndcapStack.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("EndcapStack", () => {
  test("renders ordered named end surfaces before default metadata", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(EndcapStack, {
      slots: {
        default: "<p>Fallback metadata</p>",
        references: "<section>References</section>",
        support: "<section>Support</section>",
      },
    });

    const supportIndex = view.indexOf("Support");
    const referencesIndex = view.indexOf("References");
    const metadataIndex = view.indexOf("Fallback metadata");

    expect(view).toContain("data-endcap-stack");
    expect(supportIndex).toBeGreaterThan(-1);
    expect(referencesIndex).toBeGreaterThan(supportIndex);
    expect(metadataIndex).toBeGreaterThan(referencesIndex);
  });
});
