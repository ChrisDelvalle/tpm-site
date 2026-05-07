import heroLightImage from "@site/assets/shared/tpm_home_hero_light.png";
import heroDarkImage from "@site/assets/site/tpm_home_hero_dark.png";
import { describe, expect, test } from "vitest";

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
    expect(view).toContain('loading="eager"');
    expect(view).toContain('loading="lazy"');
    expect(view).toContain('fetchpriority="high"');
    expect(view).toContain('fetchpriority="low"');
    expect(view).toContain(
      'sizes="(min-width: 80rem) 48rem, (min-width: 64rem) 64vw, calc(100vw - 2rem)"',
    );
    expect(view).toContain("max-w-3xl");
    expect(view).toContain("The philosophy of memes.");
    expect(view).toContain("Support Us");
    expect(view).toContain("Join Discord");
    expect(view).not.toContain("Visit YouTube");
    expect(view).not.toContain("https://www.youtube.com/@ThePhilosophersMeme");
  });
});
