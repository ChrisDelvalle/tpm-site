/* eslint-disable security/detect-object-injection -- Image policy tests construct binary fixture headers at explicit byte offsets. */
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { describe, expect, test } from "bun:test";

import {
  articleImagePresentation,
  articleImageShapeFromDimensions,
  imageDimensionsFromBuffer,
  readLocalImageDimensions,
  resolveLocalMarkdownImagePath,
} from "../../../src/lib/article-image-policy";

describe("article image policy", () => {
  test("classifies editorial image shapes by height-to-width ratio", () => {
    expect(articleImageShapeFromDimensions({ height: 675, width: 1200 })).toBe(
      "landscape",
    );
    expect(articleImageShapeFromDimensions({ height: 900, width: 1200 })).toBe(
      "square",
    );
    expect(articleImageShapeFromDimensions({ height: 1000, width: 1000 })).toBe(
      "square",
    );
    expect(articleImageShapeFromDimensions({ height: 1300, width: 1000 })).toBe(
      "portrait",
    );
    expect(articleImageShapeFromDimensions({ height: 1750, width: 1000 })).toBe(
      "tall",
    );
    expect(articleImageShapeFromDimensions({ height: 2100, width: 1000 })).toBe(
      "extra-tall",
    );
    expect(articleImageShapeFromDimensions(undefined)).toBe("unknown");
  });

  test("returns stable presentation contracts for automatic and explicit policies", () => {
    expect(articleImagePresentation({ height: 1000, width: 1000 }).shape).toBe(
      "square",
    );
    expect(
      articleImagePresentation({ height: 1000, width: 1000 }).frameClass,
    ).toContain("34rem");

    const automaticTall = articleImagePresentation({
      height: 1750,
      width: 1000,
    });

    expect(automaticTall.isInspectable).toBe(true);
    expect(automaticTall.shape).toBe("tall");
    expect(automaticTall.frameClass).toContain("26rem");
    expect(automaticTall.frameClass).toContain("34rem");

    const automaticExtraTall = articleImagePresentation({
      height: 2200,
      width: 1000,
    });

    expect(automaticExtraTall.isInspectable).toBe(true);
    expect(automaticExtraTall.shape).toBe("extra-tall");
    expect(automaticExtraTall.frameClass).toContain("24rem");
    expect(automaticExtraTall.frameClass).toContain("34rem");

    const containedExtraTall = articleImagePresentation(
      { height: 2200, width: 1000 },
      "contained",
    );

    expect(containedExtraTall.isInspectable).toBe(false);
    expect(containedExtraTall.shape).toBe("tall");

    const natural = articleImagePresentation(
      { height: 2200, width: 1000 },
      "natural",
    );

    expect(natural.isInspectable).toBe(false);
    expect(natural.imageClass).toContain("max-h-none");
  });

  test("resolves local Markdown images and rejects nonlocal sources", () => {
    const markdownUrl = pathToFileURL(
      "/repo/src/content/articles/example/post.md",
    );

    expect(
      resolveLocalMarkdownImagePath(
        "../../../assets/articles/example/image.png",
        markdownUrl,
      ),
    ).toBe("/repo/src/assets/articles/example/image.png");
    expect(
      resolveLocalMarkdownImagePath(
        "https://example.com/image.png",
        markdownUrl,
      ),
    ).toBeUndefined();
    expect(
      resolveLocalMarkdownImagePath("/image.png", markdownUrl),
    ).toBeUndefined();
    expect(
      resolveLocalMarkdownImagePath("#fragment", markdownUrl),
    ).toBeUndefined();
  });

  test("reads dimensions from PNG, GIF, JPEG, and WebP headers", () => {
    expect(imageDimensionsFromBuffer(pngHeader(640, 960))).toEqual({
      height: 960,
      width: 640,
    });
    expect(imageDimensionsFromBuffer(gifHeader(320, 480))).toEqual({
      height: 480,
      width: 320,
    });
    expect(imageDimensionsFromBuffer(jpegHeader(500, 700))).toEqual({
      height: 700,
      width: 500,
    });
    expect(imageDimensionsFromBuffer(webpVp8xHeader(800, 600))).toEqual({
      height: 600,
      width: 800,
    });
    expect(
      imageDimensionsFromBuffer(new Uint8Array([0, 1, 2])),
    ).toBeUndefined();
  });

  test("reads local image dimensions from files without throwing on invalid files", () => {
    const directory = mkdtempSync(join(tmpdir(), "article-image-policy-"));
    const imagePath = join(directory, "image.png");
    const invalidPath = join(directory, "invalid.png");
    writeFileSync(imagePath, pngHeader(400, 900));
    writeFileSync(invalidPath, "not an image");

    expect(readLocalImageDimensions(imagePath)).toEqual({
      height: 900,
      width: 400,
    });
    expect(readLocalImageDimensions(invalidPath)).toBeUndefined();
  });
});

function pngHeader(width: number, height: number): Uint8Array {
  const buffer = Buffer.alloc(24);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(buffer, 0);
  buffer.write("IHDR", 12);
  buffer.writeUInt32BE(width, 16);
  buffer.writeUInt32BE(height, 20);
  return buffer;
}

function gifHeader(width: number, height: number): Uint8Array {
  const buffer = Buffer.alloc(10);
  buffer.write("GIF89a", 0, "ascii");
  buffer.writeUInt16LE(width, 6);
  buffer.writeUInt16LE(height, 8);
  return buffer;
}

function jpegHeader(width: number, height: number): Uint8Array {
  const buffer = Buffer.alloc(21);
  buffer[0] = 0xff;
  buffer[1] = 0xd8;
  buffer[2] = 0xff;
  buffer[3] = 0xc0;
  buffer.writeUInt16BE(17, 4);
  buffer[6] = 8;
  buffer.writeUInt16BE(height, 7);
  buffer.writeUInt16BE(width, 9);
  return buffer;
}

function webpVp8xHeader(width: number, height: number): Uint8Array {
  const buffer = Buffer.alloc(30);
  buffer.write("RIFF", 0, "ascii");
  buffer.write("WEBP", 8, "ascii");
  buffer.write("VP8X", 12, "ascii");
  writeUInt24LE(buffer, 24, width - 1);
  writeUInt24LE(buffer, 27, height - 1);
  return buffer;
}

function writeUInt24LE(buffer: Buffer, offset: number, value: number): void {
  buffer[offset] = value & 0xff;
  buffer[offset + 1] = (value >> 8) & 0xff;
  buffer[offset + 2] = (value >> 16) & 0xff;
}

/* eslint-enable security/detect-object-injection */
