import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, test } from "bun:test";

import {
  formatSiteDoctorIssues,
  runSiteDoctorCli,
  siteDoctorIssues,
} from "../../../scripts/site/site-doctor";
import { parseSiteConfig } from "../../../src/lib/site-config";
import { resolveSiteInstancePaths } from "../../../src/lib/site-instance";

const validConfig = {
  identity: {
    description: "A configurable publication.",
    language: "en",
    title: "Example Blog",
    url: "https://example.com",
  },
  navigation: {
    footer: [{ href: "/feed.xml", label: "RSS" }],
    primary: [{ href: "/articles/", label: "Articles" }],
  },
  routes: {
    allArticles: "/articles/all/",
    announcements: "/announcements/",
    articles: "/articles/",
    authors: "/authors/",
    bibliography: "/bibliography/",
    categories: "/categories/",
    collections: "/collections/",
    feed: "/feed.xml",
    home: "/",
    search: "/search/",
    tags: "/tags/",
  },
  support: {
    block: {
      body: "Keep publishing going.",
      title: "Support Example Blog",
    },
    discord: {
      href: "https://discord.gg/example",
      label: "Join Discord",
    },
    patreon: {
      href: "https://patreon.com/example",
      label: "Support Us",
    },
  },
} as const;

async function withTempRoot<T>(callback: (root: string) => Promise<T> | T) {
  const root = await mkdtemp(path.join(tmpdir(), "tpm-site-doctor-test-"));

  try {
    return await callback(root);
  } finally {
    await rm(root, { force: true, recursive: true });
  }
}

async function writeText(root: string, relativePath: string, text: string) {
  const fullPath = path.join(root, relativePath);
  await mkdir(path.dirname(fullPath), { recursive: true });
  await writeFile(fullPath, text);
}

async function createMinimalSite(root: string) {
  await Promise.all([
    writeText(root, "site/config/site.json", "{}\n"),
    writeText(root, "site/theme.css", ":root { --background: white; }\n"),
    writeText(root, "site/config/redirects.json", "{}\n"),
    writeText(
      root,
      "site/content/articles/proof.md",
      "---\ntitle: Proof\n---\n",
    ),
    writeText(
      root,
      "site/content/announcements/proof.md",
      "---\ntitle: Proof\n---\n",
    ),
    writeText(root, "site/content/authors/proof.md", "---\nname: Proof\n---\n"),
    writeText(
      root,
      "site/content/categories/proof.json",
      '{"title":"Proof"}\n',
    ),
    writeText(
      root,
      "site/content/collections/featured.md",
      "---\ntitle: Featured\nitems: []\n---\n",
    ),
    writeText(
      root,
      "site/content/collections/start-here.md",
      "---\ntitle: Start Here\nitems: []\n---\n",
    ),
    writeText(root, "site/content/pages/index.md", "---\ntitle: Home\n---\n"),
    writeText(root, "site/public/robots.txt", "User-agent: *\n"),
  ]);
}

describe("site doctor", () => {
  test("passes a complete minimal site instance", async () =>
    withTempRoot(async (root) => {
      await createMinimalSite(root);

      const issues = siteDoctorIssues({
        config: parseSiteConfig(validConfig),
        paths: resolveSiteInstancePaths({ cwd: root }),
      });

      expect(issues).toEqual([]);
    }));

  test("reports disabled features still linked from navigation", () => {
    const config = parseSiteConfig({
      ...validConfig,
      features: {
        tags: false,
      },
      navigation: {
        footer: [{ href: "/tags/", label: "Tags" }],
        primary: [],
      },
    });
    const issues = siteDoctorIssues({
      config,
      exists: () => true,
    });

    expect(issues).toContainEqual({
      message:
        'footer navigation link "Tags" points to disabled feature "tags".',
      repair:
        "Either enable the feature or remove this link from site/config/site.json.",
      severity: "error",
    });
  });

  test("reports disabled features still linked from homepage discovery", () => {
    const config = parseSiteConfig({
      ...validConfig,
      features: {
        authors: false,
      },
      homepage: {
        discoveryLinks: [{ label: "Authors", route: "authors" }],
      },
    });
    const issues = siteDoctorIssues({
      config,
      exists: () => true,
    });

    expect(issues).toContainEqual({
      message:
        'homepage discovery link "Authors" points to disabled feature "authors".',
      repair:
        "Either enable the feature or remove this link from site/config/site.json.",
      severity: "error",
    });
  });

  test("reports missing homepage collections and route collisions", () => {
    const config = parseSiteConfig({
      ...validConfig,
      routes: {
        ...validConfig.routes,
        authors: "/articles/",
      },
    });
    const issues = siteDoctorIssues({
      config,
      exists: (targetPath) =>
        !targetPath.endsWith("featured.md") &&
        !targetPath.endsWith("featured.mdx"),
    });
    const report = formatSiteDoctorIssues(issues);

    expect(report).toContain(
      "Homepage featured collection `featured` does not exist.",
    );
    expect(report).toContain(
      "Routes articles, authors all point to /articles/.",
    );
  });

  test("prints concise CLI success output", () => {
    let output = "";

    expect(
      runSiteDoctorCli([], {
        stderr: {
          write: (text) => {
            output += String(text);
            return true;
          },
        },
        stdout: {
          write: (text) => {
            output += String(text);
            return true;
          },
        },
      }),
    ).toBe(0);
    expect(output).toBe("Site doctor passed.\n");
  });
});
