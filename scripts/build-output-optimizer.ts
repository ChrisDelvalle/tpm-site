import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

import { transform as transformCss } from "lightningcss";
import { type MinifyOptions, minifySync } from "oxc-minify";
import { optimize as optimizeSvg } from "svgo";

/** Supported generated-output transform. */
export type BuildOutputTransformName =
  | "lightning-css"
  | "oxc-js-aggressive"
  | "oxc-js-conservative"
  | "svgo";

/** Production-approved generated-output transform stack. */
export const productionBuildOutputTransforms = [
  "lightning-css",
  "svgo",
  "oxc-js-conservative",
] as const satisfies readonly BuildOutputTransformName[];

/** Inputs for generated-output optimization. */
export interface BuildOutputOptimizationOptions {
  outputDir: string;
  transforms?: readonly BuildOutputTransformName[];
}

/** Summary of transformed generated files. */
export interface BuildOutputOptimizationResult {
  cssFiles: number;
  jsFiles: number;
  svgFiles: number;
  totalFiles: number;
  transforms: BuildOutputTransformName[];
}

interface OxcDiagnostic {
  message: string;
}

interface OxcMinifyOutput {
  code: string;
  errors: readonly OxcDiagnostic[];
}

/**
 * Optimizes generated static build output in place.
 *
 * @param options Optimization options.
 * @param options.outputDir Generated build output directory.
 * @param options.transforms Transform stack to apply.
 * @returns Count of optimized generated files.
 */
export function optimizeBuildOutput({
  outputDir,
  transforms = productionBuildOutputTransforms,
}: BuildOutputOptimizationOptions): BuildOutputOptimizationResult {
  assertDirectory(outputDir);

  const result: BuildOutputOptimizationResult = {
    cssFiles: 0,
    jsFiles: 0,
    svgFiles: 0,
    totalFiles: 0,
    transforms: Array.from(transforms),
  };

  for (const transform of transforms) {
    if (transform === "lightning-css") {
      result.cssFiles += optimizeCssFiles(outputDir);
    } else if (transform === "svgo") {
      result.svgFiles += optimizeSvgFiles(outputDir);
    } else if (transform === "oxc-js-conservative") {
      result.jsFiles += optimizeJavaScriptFiles(
        outputDir,
        conservativeOxcOptions(),
      );
    } else {
      result.jsFiles += optimizeJavaScriptFiles(
        outputDir,
        aggressiveOxcOptions(),
      );
    }
  }

  return {
    ...result,
    totalFiles: result.cssFiles + result.jsFiles + result.svgFiles,
  };
}

function aggressiveOxcOptions(): MinifyOptions {
  return {
    codegen: {
      removeWhitespace: true,
    },
    compress: {
      dropConsole: false,
      dropDebugger: true,
      target: "esnext",
    },
    mangle: {
      keepNames: true,
      toplevel: false,
    },
    module: true,
    sourcemap: false,
  };
}

function assertDirectory(outputDir: string): void {
  if (!existsSync(outputDir)) {
    throw new Error(`Build output directory does not exist: ${outputDir}`);
  }

  if (!statSync(outputDir).isDirectory()) {
    throw new Error(`Build output path is not a directory: ${outputDir}`);
  }
}

function conservativeOxcOptions(): MinifyOptions {
  return {
    codegen: {
      removeWhitespace: true,
    },
    compress: false,
    mangle: false,
    module: true,
    sourcemap: false,
  };
}

function isOxcDiagnostic(value: unknown): value is OxcDiagnostic {
  return isRecord(value) && typeof value["message"] === "string";
}

function isOxcMinifyOutput(value: unknown): value is OxcMinifyOutput {
  return (
    isRecord(value) &&
    typeof value["code"] === "string" &&
    Array.isArray(value["errors"]) &&
    value["errors"].every(isOxcDiagnostic)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function listFiles(rootDir: string): string[] {
  return readdirSync(rootDir, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(rootDir, entry.name);

    if (entry.isDirectory()) {
      return listFiles(absolutePath);
    }

    if (entry.isFile()) {
      return [absolutePath];
    }

    return [];
  });
}

function optimizeCssFiles(outputDir: string): number {
  const cssFiles = listFiles(outputDir).filter((item) => item.endsWith(".css"));

  for (const file of cssFiles) {
    const result = transformCss({
      code: readFileSync(file),
      filename: file,
      minify: true,
      sourceMap: false,
    });

    writeFileSync(file, result.code);
  }

  return cssFiles.length;
}

function optimizeJavaScriptFiles(
  outputDir: string,
  options: MinifyOptions,
): number {
  const jsFiles = listFiles(outputDir).filter((item) => item.endsWith(".js"));

  for (const file of jsFiles) {
    const result: unknown = minifySync(
      file,
      readFileSync(file, "utf8"),
      options,
    );

    if (!isOxcMinifyOutput(result)) {
      throw new Error(
        `Oxc returned an unexpected result for ${path.relative(outputDir, file)}.`,
      );
    }

    if (result.errors.length > 0) {
      throw new Error(
        `Oxc failed to minify ${path.relative(outputDir, file)}: ${result.errors
          .map((error) => error.message)
          .join("; ")}`,
      );
    }

    writeFileSync(file, `${result.code}\n`);
  }

  return jsFiles.length;
}

function optimizeSvgFiles(outputDir: string): number {
  const svgFiles = listFiles(outputDir).filter((item) => item.endsWith(".svg"));

  for (const file of svgFiles) {
    const original = readFileSync(file, "utf8");
    const result = optimizeSvg(original, {
      multipass: true,
      path: file,
      plugins: ["preset-default"],
    });

    if (/\sviewBox=/u.test(original) && !/\sviewBox=/u.test(result.data)) {
      throw new Error(
        `SVGO removed viewBox from ${path.relative(outputDir, file)}.`,
      );
    }

    writeFileSync(file, result.data);
  }

  return svgFiles.length;
}
