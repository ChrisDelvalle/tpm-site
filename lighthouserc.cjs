module.exports = {
  ci: {
    collect: {
      numberOfRuns: 1,
      settings: {
        budgets: [
          {
            path: "/*",
            resourceCounts: [
              { budget: 45, resourceType: "total" },
              { budget: 2, resourceType: "script" },
              { budget: 4, resourceType: "stylesheet" },
              { budget: 12, resourceType: "image" },
              { budget: 0, resourceType: "third-party" },
            ],
            resourceSizes: [
              { budget: 80, resourceType: "script" },
              { budget: 60, resourceType: "stylesheet" },
              { budget: 700, resourceType: "image" },
              { budget: 1000, resourceType: "total" },
            ],
          },
        ],
        chromeFlags: "--no-sandbox",
      },
      staticDistDir: "./dist",
      url: [
        "/",
        "/articles/",
        "/articles/gamergate-as-metagaming/",
        "/articles/misattributed-plato-quote-is-real-now/",
        "/topics/history/",
        "/about/",
      ],
    },
    assert: {
      assertions: {
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["error", { minScore: 1 }],
        "categories:performance": ["warn", { minScore: 0.95 }],
        "categories:seo": ["error", { minScore: 0.9 }],
        "largest-contentful-paint": ["warn", { maxNumericValue: 2500 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.05 }],
        "total-blocking-time": ["warn", { maxNumericValue: 150 }],
      },
    },
    upload: {
      outputDir: "./.lighthouseci",
      target: "filesystem",
    },
  },
};
