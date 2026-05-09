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

import { describe, expect, spyOn, test } from "bun:test";

import {
  configForMinifyHtmlExperiment,
  formatMinifyHtmlExperimentReport,
  runMinifyHtmlExperiment,
  runMinifyHtmlExperimentCli,
} from "../../../scripts/payload/minify-html-experiment";

function withBuildOutput<T>(
  run: (paths: { outputDir: string; sourceDir: string }) => T,
): T {
  const rootDir = mkdtempSync(path.join(tmpdir(), "tpm-minify-html-test-"));
  const sourceDir = path.join(rootDir, "dist");
  const outputDir = path.join(rootDir, "out");

  try {
    mkdirSync(path.join(sourceDir, "nested"), { recursive: true });
    writeFileSync(
      path.join(sourceDir, "index.html"),
      `<!doctype html>
<html lang="en">
  <head>
    <title>Payload Test</title>
  </head>
  <body>
    <main>
      <p>   Hello      world.   </p>
    </main>
  </body>
</html>`,
    );
    writeFileSync(
      path.join(sourceDir, "nested", "index.html"),
      "<!doctype html><html><body><script>const value = 1 + 2;</script></body></html>",
    );
    writeFileSync(path.join(sourceDir, "asset.txt"), "plain text");

    return run({ outputDir, sourceDir });
  } finally {
    rmSync(rootDir, { force: true, recursive: true });
  }
}

describe("minify-html experiment runner", () => {
  test("exposes explicit experiment configs", () => {
    const conservative = configForMinifyHtmlExperiment("conservative");
    const inlineJs = configForMinifyHtmlExperiment("inline-js");
    const optionalTags = configForMinifyHtmlExperiment("optional-tags");
    const noncompliant = configForMinifyHtmlExperiment(
      "noncompliant-measurement",
    );

    expect(conservative.keep_closing_tags).toBe(true);
    expect(conservative.minify_css).toBe(true);
    expect(conservative.minify_js).toBe(false);
    expect(inlineJs.minify_js).toBe(true);
    expect(optionalTags.keep_closing_tags).toBe(false);
    expect(noncompliant.allow_optimal_entities).toBe(true);
    expect(noncompliant.minify_doctype).toBe(true);
  });

  test("minifies copied HTML output without mutating the source build", () => {
    withBuildOutput(({ outputDir, sourceDir }) => {
      const sourceBefore = readFileSync(
        path.join(sourceDir, "index.html"),
        "utf8",
      );
      const result = runMinifyHtmlExperiment({
        configName: "conservative",
        outputDir,
        sourceDir,
      });
      const sourceAfter = readFileSync(
        path.join(sourceDir, "index.html"),
        "utf8",
      );
      const output = readFileSync(path.join(outputDir, "index.html"), "utf8");

      expect(result.htmlFilesProcessed).toBe(2);
      expect(result.after.htmlFiles.rawBytes).toBeLessThan(
        result.before.htmlFiles.rawBytes,
      );
      expect(sourceAfter).toBe(sourceBefore);
      expect(output).not.toContain("   Hello      world.");
      expect(existsSync(path.join(outputDir, "asset.txt"))).toBe(true);
    });
  });

  test("formats experiment deltas for review", () => {
    withBuildOutput(({ outputDir, sourceDir }) => {
      const result = runMinifyHtmlExperiment({
        configName: "conservative",
        outputDir,
        sourceDir,
      });
      const output = formatMinifyHtmlExperimentReport(result);

      expect(output).toContain("minify-html experiment: conservative");
      expect(output).toContain("HTML files processed: 2");
      expect(output).toContain("HTML gzip delta:");
      expect(output).toContain("HTML Brotli delta:");
    });
  });

  test.serial("prints configs and usage from the command-line workflow", () => {
    const log = spyOn(console, "log").mockImplementation(() => undefined);

    try {
      expect(runMinifyHtmlExperimentCli(["--list-configs"])).toBe(0);
      expect(String(log.mock.calls[0]?.[0])).toContain("conservative");

      expect(runMinifyHtmlExperimentCli(["--help"])).toBe(0);
      expect(String(log.mock.calls[1]?.[0])).toContain("Usage:");
    } finally {
      log.mockRestore();
    }
  });

  test.serial("reports invalid CLI inputs", () => {
    const error = spyOn(console, "error").mockImplementation(() => undefined);

    try {
      expect(runMinifyHtmlExperimentCli(["--config", "unknown"])).toBe(1);
      expect(String(error.mock.calls[0]?.[0])).toContain(
        "Unknown minify-html config",
      );

      expect(
        runMinifyHtmlExperimentCli(["--source", "/definitely/missing"]),
      ).toBe(1);
      expect(String(error.mock.calls[1]?.[0])).toContain(
        "Source build output directory not found",
      );
    } finally {
      error.mockRestore();
    }
  });
});
