/** Known embedded-media providers with layout-specific frame needs. */
type EmbedMediaProvider = "soundcloud" | "unknown" | "youtube";

/** Layout class used by article embed wrappers and MDX embed components. */
export type EmbedMediaLayout = "audio" | "video";

/** Classified embedded-media source. */
export interface EmbedMediaClassification {
  layout: EmbedMediaLayout;
  provider: EmbedMediaProvider;
}

const youtubeHostPatterns = [
  "youtube.com",
  "youtube-nocookie.com",
  "youtu.be",
] as const;

/**
 * Classifies an embedded-media source URL for layout decisions.
 *
 * @param src Embed source URL.
 * @returns Provider and layout classification.
 */
export function classifyEmbedMedia(
  src: string | undefined,
): EmbedMediaClassification {
  const normalized = src?.toLowerCase() ?? "";

  if (normalized.includes("w.soundcloud.com/player")) {
    return {
      layout: "audio",
      provider: "soundcloud",
    };
  }

  if (youtubeHostPatterns.some((host) => normalized.includes(host))) {
    return {
      layout: "video",
      provider: "youtube",
    };
  }

  return {
    layout: "video",
    provider: "unknown",
  };
}

/**
 * Returns the frame class for one embedded-media layout.
 *
 * @param layout Embedded-media layout.
 * @returns Static Tailwind class string for the wrapper frame.
 */
export function embedFrameClassName(layout: EmbedMediaLayout): string {
  switch (layout) {
    case "audio":
      return "not-prose h-[110px]";
    case "video":
      return "not-prose aspect-video";
  }
}

/**
 * Returns the iframe class for one embedded-media layout.
 *
 * @param layout Embedded-media layout.
 * @returns Static Tailwind class string for the iframe.
 */
export function embedIframeClassName(layout: EmbedMediaLayout): string {
  switch (layout) {
    case "audio":
      return "block h-full w-full border-0";
    case "video":
      return "block aspect-video w-full border-0";
  }
}

/**
 * Builds a SoundCloud player URL from a public SoundCloud URL.
 *
 * @param sourceUrl Public SoundCloud track or playlist URL.
 * @returns SoundCloud player iframe URL.
 */
export function soundCloudPlayerUrl(sourceUrl: string): string {
  const params = new URLSearchParams({
    auto_play: "false",
    color: "ff5500",
    hide_related: "false",
    show_comments: "true",
    show_reposts: "false",
    show_user: "true",
    url: sourceUrl,
  });

  return `https://w.soundcloud.com/player/?${params.toString()}`;
}
