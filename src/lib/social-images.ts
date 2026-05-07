import type { ImageMetadata } from "astro";

export const socialPreviewImageSpec = {
  fit: "cover",
  format: "jpg",
  height: 630,
  position: "center",
  quality: 82,
  width: 1200,
} as const;

export const socialPreviewImageMimeType = "image/jpeg";
export const maxSocialPreviewImageBytes = 500 * 1024;

/** Generated social preview image metadata for Open Graph, Twitter, and JSON-LD. */
export interface SocialPreviewImage {
  alt?: string | undefined;
  height: typeof socialPreviewImageSpec.height;
  src: string;
  type: typeof socialPreviewImageMimeType;
  width: typeof socialPreviewImageSpec.width;
}

/** Transform contract passed to Astro's image optimizer for social previews. */
export interface SocialPreviewImageTransform {
  fit: typeof socialPreviewImageSpec.fit;
  format: typeof socialPreviewImageSpec.format;
  height: typeof socialPreviewImageSpec.height;
  position: typeof socialPreviewImageSpec.position;
  quality: typeof socialPreviewImageSpec.quality;
  src: ImageMetadata;
  width: typeof socialPreviewImageSpec.width;
}

/** Minimal optimizer adapter shape needed by the social preview pipeline. */
type SocialPreviewImageOptimizer = (
  transform: SocialPreviewImageTransform,
) => Promise<{ src: string }>;

/** Inputs needed to generate one social preview image view model. */
interface SocialPreviewImageViewModelInput {
  alt?: string | undefined;
  fallback: ImageMetadata;
  optimize: SocialPreviewImageOptimizer;
  source?: ImageMetadata | undefined;
}

/**
 * Generates social preview metadata from a source image or site fallback.
 *
 * @param input Source image, fallback image, alt text, and optimizer adapter.
 * @returns Generated social preview image metadata.
 */
export async function socialPreviewImageViewModel(
  input: SocialPreviewImageViewModelInput,
): Promise<SocialPreviewImage> {
  const image = input.source ?? input.fallback;
  const optimized = await input.optimize({
    fit: socialPreviewImageSpec.fit,
    format: socialPreviewImageSpec.format,
    height: socialPreviewImageSpec.height,
    position: socialPreviewImageSpec.position,
    quality: socialPreviewImageSpec.quality,
    src: image,
    width: socialPreviewImageSpec.width,
  });
  const alt = input.alt?.trim();

  return {
    ...(alt !== undefined && alt !== "" ? { alt } : {}),
    height: socialPreviewImageSpec.height,
    src: optimized.src,
    type: socialPreviewImageMimeType,
    width: socialPreviewImageSpec.width,
  };
}
