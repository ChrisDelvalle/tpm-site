import { describe, expect, test } from "vitest";

import heroImage from "../../../../src/assets/site/2022-04-05_tpm-header_trnp_dm.png";
import HomeHeroBlock from "../../../../src/components/blocks/HomeHeroBlock.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("HomeHeroBlock", () => {
  test("renders the homepage identity, tagline, and primary links", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(HomeHeroBlock, {
      props: {
        image: heroImage,
        imageAlt: "The Philosopher's Meme",
        tagline: "The philosophy of memes.",
      },
    });

    expect(view).toContain("home-hero-heading");
    expect(view).toContain("The philosophy of memes.");
    expect(view).toContain("Support Us");
    expect(view).toContain("Join TPM Discord");
  });
});
