import { describe, expect, test } from "vitest";

import SoundCloudEmbed from "../../../../src/components/media/SoundCloudEmbed.astro";
import { createAstroTestContainer } from "../../../helpers/astro-container";

describe("SoundCloudEmbed", () => {
  test("renders a compact audio iframe from a source URL", async () => {
    const container = await createAstroTestContainer();
    const view = await container.renderToString(SoundCloudEmbed, {
      props: {
        sourceUrl: "https://soundcloud.com/example/track",
        title: "SoundCloud track",
      },
    });

    expect(view).toContain("https://w.soundcloud.com/player/");
    expect(view).toContain("h-[110px]");
    expect(view).toContain('scrolling="no"');
    expect(view).toContain('allow="autoplay"');
  });
});
