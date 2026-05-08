import { readFile } from "node:fs/promises";

import { describe, expect, test } from "bun:test";

async function readCiWorkflow(): Promise<string> {
  return readFile(".github/workflows/ci.yml", "utf8");
}

function jobBlock(workflow: string, jobName: string): string {
  const start = workflow.indexOf(`  ${jobName}:\n`);

  if (start === -1) {
    throw new Error(`Missing CI job ${jobName}.`);
  }

  const rest = workflow.slice(start + 1);
  const nextJob = rest.search(/\n {2}[a-z][\w-]*:\n/u);

  return nextJob === -1 ? rest : rest.slice(0, nextJob);
}

describe("CI workflow", () => {
  test("uploads one verified build artifact for downstream checks", async () => {
    const workflow = await readCiWorkflow();
    const build = jobBlock(workflow, "build");

    expect(build).toContain("bun run build");
    expect(build).toContain("bun run verify");
    expect(build).toContain("bun run validate:html");
    expect(build).toContain("actions/upload-artifact@v4");
    expect(build).toContain("name: verified-dist");
    expect(build).toContain("path: dist");
    expect(build).toContain("retention-days: 2");
  });

  test("runs browser, accessibility, and Lighthouse checks against the verified artifact", async () => {
    const workflow = await readCiWorkflow();
    const browser = jobBlock(workflow, "browser");
    const accessibility = jobBlock(workflow, "accessibility");
    const lighthouse = jobBlock(workflow, "lighthouse");

    for (const job of [browser, accessibility, lighthouse]) {
      expect(job).toContain("needs:");
      expect(job).toContain("- build");
      expect(job).toContain("actions/download-artifact@v4");
      expect(job).toContain("name: verified-dist");
      expect(job).toContain("path: dist");
      expect(job).not.toContain("bun run build");
    }

    expect(browser).toContain("bun run test:e2e:built");
    expect(accessibility).toContain("bun run test:a11y:built");
    expect(lighthouse).toContain("bun run test:perf:built");
  });

  test("deploys the verified artifact instead of rebuilding on main", async () => {
    const workflow = await readCiWorkflow();
    const deploy = jobBlock(workflow, "deploy");

    expect(deploy).toContain("actions/download-artifact@v4");
    expect(deploy).toContain("name: verified-dist");
    expect(deploy).toContain("path: dist");
    expect(deploy).toContain("actions/upload-pages-artifact@v3");
    expect(deploy).toContain("actions/deploy-pages@v4");
    expect(deploy).not.toContain("bun run build");
    expect(deploy).not.toContain("bun run verify");
    expect(deploy).not.toContain("bun run validate:html");
  });
});
