import heroLightImage from "@site/assets/shared/tpm_home_hero_light.png";
import heroDarkImage from "@site/assets/site/tpm_home_hero_dark.png";
import { describe, expect, test } from "vitest";

import ThemedImage from "../../../../src/components/media/ThemedImage.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("ThemedImage", () => {
  test("renders optimized light and dark images with only the default light variant prioritized", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(ThemedImage, {
      props: {
        alt: "The Philosopher's Meme",
        class: "h-auto w-full",
        darkImage: heroDarkImage,
        fetchpriority: "high",
        layout: "full-width",
        lightImage: heroLightImage,
        loading: "eager",
        sizes: "(min-width: 64rem) 56rem, calc(100vw - 2rem)",
      },
    });

    expect(view).toContain('alt="The Philosopher\'s Meme"');
    expect(view).toContain("dark:hidden");
    expect(view).toContain("dark:block");
    expect(view).toContain("h-auto w-full");
    expect(view).toContain(
      'sizes="(min-width: 64rem) 56rem, calc(100vw - 2rem)"',
    );
    expect(view).toContain('loading="eager"');
    expect(view).toContain('loading="lazy"');
    expect(view).toContain('fetchpriority="high"');
    expect(view).toContain('fetchpriority="low"');
  });
});
