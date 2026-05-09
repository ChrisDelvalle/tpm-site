import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";

/** Options for synchronizing Astro's test-time content store. */
export interface AstroTestStoreSyncOptions {
  projectRoot: string;
}

/**
 * Copies Astro's freshly synced production content store into the dev-store
 * location used by Astro Container tests.
 *
 * @param options Sync options.
 * @param options.projectRoot Repository root.
 */
export async function syncAstroTestStore({
  projectRoot,
}: AstroTestStoreSyncOptions): Promise<void> {
  const productionStore = path.join(
    projectRoot,
    "node_modules",
    ".astro",
    "data-store.json",
  );
  const devStore = path.join(projectRoot, ".astro", "data-store.json");

  await mkdir(path.dirname(devStore), { recursive: true });
  await copyFile(productionStore, devStore);
}

if (import.meta.main) {
  // Coverage note: the CLI wrapper performs a real filesystem copy after
  // `astro sync`; tests cover `syncAstroTestStore()` with a temporary project.
  await syncAstroTestStore({ projectRoot: process.cwd() });
}
