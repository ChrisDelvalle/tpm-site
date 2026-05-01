import type * as React from "react";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface HoverImage {
  src: string;
  width: number;
  height: number;
}

interface HoverImageCardProps {
  image: HoverImage;
  label: string;
  alt?: string;
  expanded?: boolean;
}

/**
 * Renders an inline link that previews an image in a hover/focus card.
 *
 * @param props Hover image configuration and link label.
 * @param props.image Image metadata and source URL for the preview.
 * @param props.label Inline link text shown in article prose.
 * @param props.alt Accessible alt text for the preview image.
 * @param props.expanded Whether to use the larger preview size.
 * @returns React hover card for MDX article image previews.
 */
export default function HoverImageCard({
  image,
  label,
  alt = "",
  expanded = false,
}: HoverImageCardProps) {
  const maxWidthRem = expanded ? 40 : 30;
  const maxHeightRem = expanded ? 34 : 28;
  const aspectRatio =
    image.width > 0 && image.height > 0 ? image.width / image.height : 1;
  const displayWidthRem = Math.min(maxWidthRem, maxHeightRem * aspectRatio);
  const imageStyle = {
    width: `min(${displayWidthRem.toFixed(3)}rem, calc(100vw - 2rem))`,
    maxHeight: `min(${maxHeightRem}rem, calc(100svh - 2rem))`,
  } satisfies React.CSSProperties;

  return (
    <HoverCard closeDelay={150} openDelay={100}>
      <HoverCardTrigger asChild>
        <a href={image.src}>{label}</a>
      </HoverCardTrigger>
      <HoverCardContent
        align="center"
        className="w-auto max-w-[calc(100vw-2rem)] p-1"
        collisionPadding={16}
        side="top"
        sideOffset={8}
      >
        <img
          alt={alt}
          className="block max-w-none rounded-md object-contain"
          height={image.height}
          src={image.src}
          style={imageStyle}
          width={image.width}
        />
      </HoverCardContent>
    </HoverCard>
  );
}
