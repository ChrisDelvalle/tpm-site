import { describe, expect, test } from "bun:test";

import config from "../../astro.config";

describe("Astro config", () => {
  test("keeps static-site production invariants explicit", () => {
    expect(config.site).toBe("https://thephilosophersmeme.com");
    expect(config.trailingSlash).toBe("always");
    expect(config.compressHTML).toBe(true);
    expect(config.prerenderConflictBehavior).toBe("error");
  });

  test("keeps legacy redirects separate from article routing helpers", () => {
    expect(config.redirects?.["/2021/05/16/gamergate-as-metagaming/"]).toBe(
      "/articles/gamergate-as-metagaming/",
    );
  });
});
