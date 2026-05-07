import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, test } from "bun:test";

import {
  runGenerateSiteConfigSchemaCli,
  siteConfigJsonSchema,
} from "../../../scripts/site/generate-site-config-schema";

const silentIo = {
  stderr: {
    write: () => true,
  },
  stdout: {
    write: () => true,
  },
};

async function withTempRoot<T>(callback: (root: string) => Promise<T> | T) {
  const root = await mkdtemp(path.join(tmpdir(), "tpm-site-schema-test-"));

  try {
    return await callback(root);
  } finally {
    await rm(root, { force: true, recursive: true });
  }
}

describe("site config schema generator", () => {
  test("builds an input JSON Schema from the site config schema", () => {
    const schema = siteConfigJsonSchema();

    expect(schema["$schema"]).toBe(
      "https://json-schema.org/draft/2020-12/schema",
    );
    expect(schema["title"]).toBe("TPM Platform Site Config");
    expect(schema["required"]).toEqual([
      "identity",
      "navigation",
      "routes",
      "support",
    ]);
    expect(JSON.stringify(schema)).toContain("contentDefaults");
    expect(JSON.stringify(schema)).toContain("features");
  });

  test("writes and checks a deterministic schema file", async () =>
    withTempRoot(async (root) => {
      const outputPath = path.join(root, "site.schema.json");

      expect(
        runGenerateSiteConfigSchemaCli(
          ["--quiet", "--output", outputPath],
          silentIo,
        ),
      ).toBe(0);
      const firstSchema = await readFile(outputPath, "utf8");

      expect(firstSchema).toContain('"features"');
      expect(
        runGenerateSiteConfigSchemaCli(
          ["--check", "--quiet", "--output", outputPath],
          silentIo,
        ),
      ).toBe(0);

      await mkdir(path.dirname(outputPath), { recursive: true });
      await writeFile(outputPath, "{}\n");

      expect(
        runGenerateSiteConfigSchemaCli(
          ["--check", "--quiet", "--output", outputPath],
          silentIo,
        ),
      ).toBe(1);
    }));
});
