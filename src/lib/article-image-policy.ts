/* eslint-disable security/detect-non-literal-fs-filename, security/detect-object-injection -- Build-time image policy intentionally reads project-local Markdown image files and indexes binary image headers by byte offset. */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Intrinsic dimensions for an article image asset. */
interface ArticleImageDimensions {
  height: number;
  width: number;
}

/** Editorial shape buckets used for article image presentation. */
type ArticleImageShape =
  | "extra-tall"
  | "landscape"
  | "portrait"
  | "square"
  | "tall"
  | "unknown";

/** Explicit author/developer override for article image height handling. */
export type ArticleImageHeightPolicy =
  | "auto"
  | "contained"
  | "inspectable"
  | "natural";

/** Stable presentation data consumed by components and the rehype plugin. */
interface ArticleImagePresentation {
  captionClass: string;
  figureClass: string;
  frameClass: string;
  imageClass: string;
  inspectionClass: string;
  isInspectable: boolean;
  shape: ArticleImageShape;
}

const baseFigureClass =
  "not-prose mx-auto my-8 grid max-w-full gap-2 text-center first:mt-0";
const baseFrameClass =
  "mx-auto block max-w-full overflow-hidden rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const baseImageClass = "mx-auto block h-auto max-w-full object-contain";
const captionClass = "text-muted-foreground text-center text-sm";
const inspectionClass =
  "pointer-events-none absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-sm border border-border bg-background/95 px-2 py-1 text-xs font-semibold text-foreground shadow-sm";
const landscapeMaximumHeightToWidthRatio = 0.7;
const squareHeightCeilingClass = "max-h-[min(70svh,34rem)]";
const autoInspectableShapes = ["extra-tall", "tall"] as const;

const frameClassByShape = {
  "extra-tall": `relative w-[min(100%,24rem)] ${squareHeightCeilingClass} border border-border bg-muted/30 text-left`,
  landscape: "w-full",
  portrait: "w-[min(100%,30rem)]",
  square: "w-[min(100%,34rem)]",
  tall: `relative w-[min(100%,26rem)] ${squareHeightCeilingClass} border border-border bg-muted/30 text-left`,
  unknown: "w-[min(100%,34rem)]",
} as const satisfies Record<ArticleImageShape, string>;

const imageClassByShape = {
  "extra-tall": "w-full rounded-sm object-top",
  landscape: `w-full ${squareHeightCeilingClass} rounded-sm`,
  portrait: `w-auto ${squareHeightCeilingClass} rounded-sm`,
  square: `w-full ${squareHeightCeilingClass} rounded-sm`,
  tall: "w-full rounded-sm object-top",
  unknown: `w-full ${squareHeightCeilingClass} rounded-sm`,
} as const satisfies Record<ArticleImageShape, string>;

/** Cache key passed to Astro so article image policy changes invalidate rendered content. */
export const articleImagePolicyCacheKey = JSON.stringify({
  autoInspectableShapes,
  frameClassByShape,
  imageClassByShape,
  landscapeMaximumHeightToWidthRatio,
  squareHeightCeilingClass,
});

/**
 * Classifies image shape from intrinsic dimensions.
 *
 * @param dimensions Intrinsic image dimensions when they are available.
 * @returns The editorial shape bucket used by article image presentation.
 */
export function articleImageShapeFromDimensions(
  dimensions: ArticleImageDimensions | undefined,
): ArticleImageShape {
  if (
    dimensions === undefined ||
    dimensions.width <= 0 ||
    dimensions.height <= 0
  ) {
    return "unknown";
  }

  // eslint-disable-next-line total-functions/no-partial-division -- Width is checked above and must be positive before classification.
  const ratio = dimensions.height / dimensions.width;

  if (ratio < landscapeMaximumHeightToWidthRatio) {
    return "landscape";
  }

  if (ratio < 1.2) {
    return "square";
  }

  if (ratio < 1.5) {
    return "portrait";
  }

  if (ratio < 2) {
    return "tall";
  }

  return "extra-tall";
}

/**
 * Returns editorial presentation classes for an image shape and height policy.
 *
 * @param dimensions Intrinsic image dimensions when they are available.
 * @param heightPolicy Explicit author/developer override for height handling.
 * @returns Stable shape, class, and inspectability data for image rendering.
 */
export function articleImagePresentation(
  dimensions: ArticleImageDimensions | undefined,
  heightPolicy: ArticleImageHeightPolicy = "auto",
): ArticleImagePresentation {
  const classifiedShape = articleImageShapeFromDimensions(dimensions);
  const isInspectable =
    heightPolicy === "inspectable" ||
    (heightPolicy === "auto" && isAutoInspectableShape(classifiedShape));

  if (heightPolicy === "natural") {
    return {
      captionClass,
      figureClass: baseFigureClass,
      frameClass: `${baseFrameClass} w-full`,
      imageClass: `${baseImageClass} max-h-none w-auto rounded-sm`,
      inspectionClass,
      isInspectable: false,
      shape: classifiedShape,
    };
  }

  const effectiveShape = articleImageEffectiveShape(
    classifiedShape,
    heightPolicy,
    isInspectable,
  );

  return {
    captionClass,
    figureClass: baseFigureClass,
    frameClass: `${baseFrameClass} ${frameClassByShape[effectiveShape]}`,
    imageClass: `${baseImageClass} ${imageClassByShape[effectiveShape]}`,
    inspectionClass,
    isInspectable,
    shape: effectiveShape,
  };
}

function articleImageEffectiveShape(
  classifiedShape: ArticleImageShape,
  heightPolicy: ArticleImageHeightPolicy,
  isInspectable: boolean,
): ArticleImageShape {
  if (isInspectable && heightPolicy === "inspectable") {
    return "extra-tall";
  }

  if (isInspectable) {
    return classifiedShape;
  }

  if (classifiedShape === "extra-tall") {
    return "tall";
  }

  return classifiedShape;
}

function isAutoInspectableShape(
  shape: ArticleImageShape,
): shape is (typeof autoInspectableShapes)[number] {
  return autoInspectableShapes.some(
    (autoInspectableShape) => autoInspectableShape === shape,
  );
}

/**
 * Resolves a local Markdown image path relative to its source file.
 *
 * @param imageSource Raw Markdown image source.
 * @param markdownFilePath Source Markdown file path provided by the VFile.
 * @returns Absolute local image path, or undefined for non-local sources.
 */
export function resolveLocalMarkdownImagePath(
  imageSource: string,
  markdownFilePath: string | undefined | URL,
): string | undefined {
  if (markdownFilePath === undefined || !isRelativeLocalPath(imageSource)) {
    return undefined;
  }

  const filePath = markdownSourceFilePath(markdownFilePath);

  return resolve(dirname(filePath), decodeURI(imageSource));
}

function markdownSourceFilePath(markdownFilePath: string | URL): string {
  if (markdownFilePath instanceof URL) {
    return fileURLToPath(markdownFilePath);
  }

  if (markdownFilePath.startsWith("file:")) {
    return fileURLToPath(markdownFilePath);
  }

  return markdownFilePath;
}

/**
 * Reads supported local image dimensions from file headers.
 *
 * @param imagePath Absolute path to a local image file.
 * @returns Parsed image dimensions, or undefined when the file is unsupported.
 */
export function readLocalImageDimensions(
  imagePath: string,
): ArticleImageDimensions | undefined {
  try {
    return imageDimensionsFromBuffer(readFileSync(imagePath));
  } catch {
    return undefined;
  }
}

/**
 * Parses PNG, JPEG, GIF, and WebP dimensions from a file buffer.
 *
 * @param buffer Binary file header/body bytes for a supported image format.
 * @returns Parsed image dimensions, or undefined for unsupported bytes.
 */
export function imageDimensionsFromBuffer(
  buffer: Uint8Array,
): ArticleImageDimensions | undefined {
  return (
    pngDimensions(buffer) ??
    gifDimensions(buffer) ??
    jpegDimensions(buffer) ??
    webpDimensions(buffer)
  );
}

function isRelativeLocalPath(value: string): boolean {
  return (
    !value.startsWith("/") &&
    !value.startsWith("#") &&
    !value.startsWith("data:") &&
    !/^[a-z][a-z0-9+.-]*:/iu.test(value)
  );
}

function pngDimensions(buffer: Uint8Array): ArticleImageDimensions | undefined {
  const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

  if (
    buffer.length < 24 ||
    pngSignature.some((byte, index) => buffer[index] !== byte)
  ) {
    return undefined;
  }

  return {
    height: readUInt32BE(buffer, 20),
    width: readUInt32BE(buffer, 16),
  };
}

function gifDimensions(buffer: Uint8Array): ArticleImageDimensions | undefined {
  if (buffer.length < 10) {
    return undefined;
  }

  const signature = text(buffer, 0, 6);

  if (signature !== "GIF87a" && signature !== "GIF89a") {
    return undefined;
  }

  return {
    height: readUInt16LE(buffer, 8),
    width: readUInt16LE(buffer, 6),
  };
}

function jpegDimensions(
  buffer: Uint8Array,
): ArticleImageDimensions | undefined {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return undefined;
  }

  let offset = 2;

  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    while (buffer[offset] === 0xff) {
      offset += 1;
    }

    const marker = buffer[offset];
    offset += 1;

    if (marker === undefined || marker === 0xd9 || marker === 0xda) {
      return undefined;
    }

    if (offset + 2 > buffer.length) {
      return undefined;
    }

    const segmentLength = readUInt16BE(buffer, offset);

    if (segmentLength < 2 || offset + segmentLength > buffer.length) {
      return undefined;
    }

    if (isJpegStartOfFrame(marker)) {
      return {
        height: readUInt16BE(buffer, offset + 3),
        width: readUInt16BE(buffer, offset + 5),
      };
    }

    offset += segmentLength;
  }

  return undefined;
}

function webpDimensions(
  buffer: Uint8Array,
): ArticleImageDimensions | undefined {
  if (
    buffer.length < 30 ||
    text(buffer, 0, 4) !== "RIFF" ||
    text(buffer, 8, 12) !== "WEBP"
  ) {
    return undefined;
  }

  const chunkType = text(buffer, 12, 16);

  if (chunkType === "VP8X") {
    return {
      height: 1 + readUInt24LE(buffer, 27),
      width: 1 + readUInt24LE(buffer, 24),
    };
  }

  if (chunkType === "VP8L" && buffer[20] === 0x2f) {
    const byteOne = buffer[21] ?? 0;
    const byteTwo = buffer[22] ?? 0;
    const byteThree = buffer[23] ?? 0;
    const byteFour = buffer[24] ?? 0;

    return {
      height:
        1 +
        (((byteFour & 0x0f) << 10) |
          (byteThree << 2) |
          ((byteTwo & 0xc0) >> 6)),
      width: 1 + (((byteTwo & 0x3f) << 8) | byteOne),
    };
  }

  if (
    chunkType === "VP8 " &&
    buffer[23] === 0x9d &&
    buffer[24] === 0x01 &&
    buffer[25] === 0x2a
  ) {
    return {
      height: readUInt16LE(buffer, 28) & 0x3fff,
      width: readUInt16LE(buffer, 26) & 0x3fff,
    };
  }

  return undefined;
}

function isJpegStartOfFrame(marker: number): boolean {
  return (
    (marker >= 0xc0 && marker <= 0xc3) ||
    (marker >= 0xc5 && marker <= 0xc7) ||
    (marker >= 0xc9 && marker <= 0xcb) ||
    (marker >= 0xcd && marker <= 0xcf)
  );
}

function readUInt16BE(buffer: Uint8Array, offset: number): number {
  return ((buffer[offset] ?? 0) << 8) | (buffer[offset + 1] ?? 0);
}

function readUInt16LE(buffer: Uint8Array, offset: number): number {
  return (buffer[offset] ?? 0) | ((buffer[offset + 1] ?? 0) << 8);
}

function readUInt24LE(buffer: Uint8Array, offset: number): number {
  return (
    (buffer[offset] ?? 0) |
    ((buffer[offset + 1] ?? 0) << 8) |
    ((buffer[offset + 2] ?? 0) << 16)
  );
}

function readUInt32BE(buffer: Uint8Array, offset: number): number {
  return (
    ((buffer[offset] ?? 0) << 24) |
    ((buffer[offset + 1] ?? 0) << 16) |
    ((buffer[offset + 2] ?? 0) << 8) |
    (buffer[offset + 3] ?? 0)
  );
}

function text(buffer: Uint8Array, start: number, end: number): string {
  return String.fromCharCode(...buffer.slice(start, end));
}

/* eslint-enable security/detect-non-literal-fs-filename, security/detect-object-injection */
