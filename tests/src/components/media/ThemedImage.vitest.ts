import { describe, expect, test } from "vitest";

import heroDarkImage from "../../../../src/assets/site/tpm_home_hero_dark.png";
import heroLightImage from "../../../../src/assets/site/tpm_home_hero_light.png";
import ThemedImage from "../../../../src/components/media/ThemedImage.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("ThemedImage", () => {
  test("renders optimized light and dark images with theme visibility classes", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(ThemedImage, {
      props: {
        alt: "The Philosopher's Meme",
        class: "h-auto w-full",
        darkImage: heroDarkImage,
        layout: "full-width",
        lightImage: heroLightImage,
      },
    });

    expect(view).toContain('alt="The Philosopher\'s Meme"');
    expect(view).toContain("dark:hidden");
    expect(view).toContain("dark:block");
    expect(view).toContain("h-auto w-full");
  });
});
