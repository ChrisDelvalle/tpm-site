import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, test } from "bun:test";

import {
  optimizeBuildOutput,
  productionBuildOutputTransforms,
} from "../../../scripts/build/build-output-optimizer";

function withBuildOutput<T>(run: (outputDir: string) => T): T {
  const rootDir = mkdtempSync(path.join(tmpdir(), "tpm-build-optimizer-test-"));
  const outputDir = path.join(rootDir, "dist");

  try {
    mkdirSync(path.join(outputDir, "_astro"), { recursive: true });
    writeFileSync(
      path.join(outputDir, "_astro", "style.css"),
      ".example    { color: rgb(255, 0, 0); margin: 0px; }\n",
    );
    writeFileSync(
      path.join(outputDir, "_astro", "entry.js"),
      "const message = 'hello' + ' world'; console.log(message);\n",
    );
    writeFileSync(
      path.join(outputDir, "_astro", "used.hash.png"),
      "referenced image",
    );
    writeFileSync(
      path.join(outputDir, "_astro", "unused.hash.png"),
      "unreferenced image",
    );
    writeFileSync(
      path.join(outputDir, "index.html"),
      '<!doctype html><img src="/_astro/used.hash.png" alt="">',
    );
    writeFileSync(
      path.join(outputDir, "favicon.svg"),
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><metadata>unused</metadata><rect width="10" height="10"/></svg>',
    );

    return run(outputDir);
  } finally {
    rmSync(rootDir, { force: true, recursive: true });
  }
}

describe("generated build output optimizer", () => {
  test("applies the production CSS, SVG, and conservative JS stack in place", () => {
    withBuildOutput((outputDir) => {
      const result = optimizeBuildOutput({ outputDir });

      expect(result.transforms).toEqual(
        Array.from(productionBuildOutputTransforms),
      );
      expect(result.cssFiles).toBe(1);
      expect(result.jsFiles).toBe(1);
      expect(result.rasterFilesRemoved).toBe(1);
      expect(result.svgFiles).toBe(1);
      expect(result.totalFiles).toBe(4);
      expect(
        readFileSync(path.join(outputDir, "_astro", "style.css"), "utf8"),
      ).not.toContain("    ");
      expect(
        readFileSync(path.join(outputDir, "_astro", "entry.js"), "utf8"),
      ).toContain("console.log");
      expect(
        readFileSync(path.join(outputDir, "favicon.svg"), "utf8"),
      ).toContain("viewBox");
      expect(existsSync(path.join(outputDir, "_astro", "used.hash.png"))).toBe(
        true,
      );
      expect(
        existsSync(path.join(outputDir, "_astro", "unused.hash.png")),
      ).toBe(false);
      expect(existsSync(path.join(outputDir, "_astro", "entry.js.br"))).toBe(
        false,
      );
      expect(existsSync(path.join(outputDir, "_astro", "entry.js.gz"))).toBe(
        false,
      );
    });
  });

  test("fails clearly when the output directory is missing", () => {
    expect(() =>
      optimizeBuildOutput({ outputDir: path.join(tmpdir(), "missing-dist") }),
    ).toThrow("Build output directory does not exist");
  });

  test("keeps generated raster assets referenced from CSS and encoded URLs", () => {
    withBuildOutput((outputDir) => {
      writeFileSync(
        path.join(outputDir, "_astro", "pattern image.hash.webp"),
        "referenced encoded image",
      );
      writeFileSync(
        path.join(outputDir, "_astro", "style.css"),
        `.example{background-image:url("/_astro/${encodeURI(
          "pattern image.hash.webp",
        )}")}`,
      );

      const result = optimizeBuildOutput({
        outputDir,
        transforms: ["unreferenced-astro-raster-assets"],
      });

      expect(result.rasterFilesRemoved).toBe(1);
      expect(
        existsSync(path.join(outputDir, "_astro", "pattern image.hash.webp")),
      ).toBe(true);
      expect(existsSync(path.join(outputDir, "_astro", "used.hash.png"))).toBe(
        true,
      );
      expect(
        existsSync(path.join(outputDir, "_astro", "unused.hash.png")),
      ).toBe(false);
    });
  });
});
