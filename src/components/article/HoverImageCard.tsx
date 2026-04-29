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
