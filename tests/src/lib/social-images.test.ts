import type { ImageMetadata } from "astro";
import { describe, expect, test } from "bun:test";

import {
  socialPreviewImageMimeType,
  socialPreviewImageSpec,
  type SocialPreviewImageTransform,
  socialPreviewImageViewModel,
} from "../../../src/lib/social-images";

const sourceImage = {
  format: "png",
  height: 900,
  src: "/src/source.png",
  width: 900,
} as const satisfies ImageMetadata;

const fallbackImage = {
  format: "png",
  height: 832,
  src: "/src/fallback.png",
  width: 1600,
} as const satisfies ImageMetadata;

describe("social preview image helpers", () => {
  test("generates a centered cropped JPG preview from the source image", async () => {
    let received: SocialPreviewImageTransform | undefined;
    const result = await socialPreviewImageViewModel({
      alt: " Article preview ",
      fallback: fallbackImage,
      optimize: async (transform) => {
        received = transform;
        await Promise.resolve();
        return { src: "/_astro/source.hash.jpg" };
      },
      source: sourceImage,
    });

    expect(received).toEqual({
      ...socialPreviewImageSpec,
      src: sourceImage,
    });
    expect(result).toEqual({
      alt: "Article preview",
      height: socialPreviewImageSpec.height,
      src: "/_astro/source.hash.jpg",
      type: socialPreviewImageMimeType,
      width: socialPreviewImageSpec.width,
    });
  });

  test("uses the fallback image when a publishable entry has no image", async () => {
    let received: SocialPreviewImageTransform | undefined;
    await socialPreviewImageViewModel({
      fallback: fallbackImage,
      optimize: async (transform) => {
        received = transform;
        await Promise.resolve();
        return { src: "/_astro/fallback.hash.jpg" };
      },
    });

    expect(received?.src).toBe(fallbackImage);
  });
});
