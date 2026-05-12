import { describe, expect, spyOn, test } from "bun:test";

import {
  formatComponentCatalogReport,
  runComponentCatalogCli,
  verifyComponentCatalog,
} from "../../../scripts/quality/verify-component-catalog";

const exampleComponent = "src/components/ui/Button.astro";
const ignoredComponent = "src/components/seo/SiteHead.astro";

describe("component catalog verifier", () => {
  test("passes when every component is cataloged or ignored", () => {
    const result = verifyComponentCatalog({
      componentFiles: [exampleComponent, ignoredComponent],
      examplePaths: [exampleComponent],
      ignoreList: [
        {
          path: ignoredComponent,
          reason: "SEO component has no visual catalog surface.",
        },
      ],
      rootDir: ".",
    });

    expect(formatComponentCatalogReport(result)).toContain(
      "Component catalog passed",
    );
  });

  test("reports missing examples, stale paths, duplicate entries, and weak reasons", () => {
    const missingComponent = "src/components/ui/Input.astro";
    const result = verifyComponentCatalog({
      componentFiles: [exampleComponent, ignoredComponent, missingComponent],
      examplePaths: [
        exampleComponent,
        exampleComponent,
        "src/components/ui/Missing.astro",
      ],
      ignoreList: [
        {
          path: ignoredComponent,
          reason: "Too short",
        },
        {
          path: "src/components/ui/Ghost.astro",
          reason: "This ignored component no longer exists in the project.",
        },
      ],
      rootDir: ".",
    });
    const report = formatComponentCatalogReport(result);

    expect(result.duplicateConfiguredPaths).toEqual([exampleComponent]);
    expect(result.missingComponents).toEqual([missingComponent]);
    expect(result.unknownExamplePaths).toEqual([
      "src/components/ui/Missing.astro",
    ]);
    expect(result.unknownIgnorePaths).toEqual([
      "src/components/ui/Ghost.astro",
    ]);
    expect(result.weakIgnoreReasons).toEqual([
      `- ${ignoredComponent}: Too short`,
    ]);
    expect(report).toContain("Component catalog check failed.");
    expect(report).toContain("Missing catalog coverage:");
    expect(report).toContain(missingComponent);
    expect(report).toContain("Weak ignore reasons:");
    expect(report).toContain("Catalog examples for missing files:");
    expect(report).toContain("Catalog ignores for missing files:");
    expect(report).toContain("Duplicate catalog configuration paths:");
  });

  test.serial("prints command usage without scanning components", () => {
    const log = spyOn(console, "log").mockImplementation(() => undefined);

    try {
      expect(runComponentCatalogCli(["--help"])).toBe(0);
      expect(String(log.mock.calls[0]?.[0])).toContain("Usage:");
    } finally {
      log.mockRestore();
    }
  });

  test.serial("prints failures from the command-line workflow", () => {
    const error = spyOn(console, "error").mockImplementation(() => undefined);

    try {
      const exitCode = runComponentCatalogCli(
        ["--quiet"],
        "/definitely/missing",
      );

      expect(exitCode).toBe(1);
      expect(String(error.mock.calls[0]?.[0])).toMatch(
        /Failed to list repository files|fatal:/u,
      );
    } finally {
      error.mockRestore();
    }
  });

  test.serial("prints a success report from the command-line workflow", () => {
    const log = spyOn(console, "log").mockImplementation(() => undefined);

    try {
      expect(runComponentCatalogCli([], process.cwd())).toBe(0);
      expect(String(log.mock.calls[0]?.[0])).toContain(
        "Component catalog passed",
      );
    } finally {
      log.mockRestore();
    }
  });
});
