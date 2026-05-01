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
});
