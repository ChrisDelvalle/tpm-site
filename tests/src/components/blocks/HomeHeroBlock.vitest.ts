import { describe, expect, test } from "vitest";

import heroDarkImage from "../../../../src/assets/site/tpm_home_hero_dark.png";
import heroLightImage from "../../../../src/assets/site/tpm_home_hero_light.png";
import HomeHeroBlock from "../../../../src/components/blocks/HomeHeroBlock.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("HomeHeroBlock", () => {
  test("renders the homepage identity, tagline, and primary links", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(HomeHeroBlock, {
      props: {
        darkImage: heroDarkImage,
        imageAlt: "The Philosopher's Meme",
        lightImage: heroLightImage,
        tagline: "The philosophy of memes.",
      },
    });

    expect(view).toContain("home-hero-heading");
    expect(view).toContain("dark:hidden");
    expect(view).toContain("dark:block");
    expect(view).toContain("The philosophy of memes.");
    expect(view).toContain("Support Us");
    expect(view).toContain("Join TPM Discord");
  });
});
