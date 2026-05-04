import { describe, expect, test } from "vitest";

import BrandLink from "../../../../src/components/navigation/BrandLink.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("BrandLink", () => {
  test("renders a publication home link with custom label support", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(BrandLink, {
      props: { label: "TPM", href: "/" },
    });

    expect(view).toContain('href="/"');
    expect(view).toContain("TPM");
  });

  test("keeps a full accessible name when a compact visual label is provided", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(BrandLink, {
      props: {
        compactLabel: "TPM",
        href: "/",
        label: "The Philosopher's Meme",
      },
    });

    expect(view).toContain('aria-label="The Philosopher\'s Meme"');
    expect(view).toContain("TPM");
    expect(view).toContain("sm:hidden");
    expect(view).toContain("sm:inline");
  });
});
