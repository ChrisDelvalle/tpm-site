import { describe, expect, test } from "vitest";

import SupportLink from "../../../../src/components/navigation/SupportLink.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("SupportLink", () => {
  test("renders a support CTA as a link", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(SupportLink, {
      props: { href: "https://example.com/support", label: "Support" },
    });

    expect(view).toContain('href="https://example.com/support"');
    expect(view).toContain("Support");
  });
});
