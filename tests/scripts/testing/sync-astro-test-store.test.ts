import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, test } from "bun:test";

import { syncAstroTestStore } from "../../scripts/sync-astro-test-store";

async function withTempRoot<T>(callback: (root: string) => Promise<T>) {
  const root = await mkdtemp(path.join(tmpdir(), "tpm-astro-store-test-"));

  try {
    return await callback(root);
  } finally {
    await rm(root, { force: true, recursive: true });
  }
}

describe("Astro test content-store sync", () => {
  test("copies the production content store into the dev-store path", async () =>
    withTempRoot(async (root) => {
      const source = path.join(root, "node_modules", ".astro");
      await mkdir(source, { recursive: true });
      await writeFile(path.join(source, "data-store.json"), '{"pages":{}}');

      await syncAstroTestStore({ projectRoot: root });

      const copiedStore = await readFile(
        path.join(root, ".astro", "data-store.json"),
        "utf8",
      );

      expect(copiedStore).toBe('{"pages":{}}');
    }));
});
