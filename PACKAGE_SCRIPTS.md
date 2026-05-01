# Package Scripts

Run scripts with `bun run <script>`. The package scripts are the source of truth
for local checks and GitHub Actions.

| Script                  | Intended use                                                                                                                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `assets:duplicates`     | Finds image files with identical byte content. Review signal by default; can fail with `--fail-on-duplicates`.                                                                             |
| `assets:locations`      | Verifies image files live under `src/assets/` unless intentionally ignored. Blocking content/project invariant.                                                                            |
| `assets:shared`         | Verifies assets referenced by multiple source files live under `src/assets/shared/`. Blocking organization invariant.                                                                      |
| `assets:unused`         | Finds images in `src/assets/` that no source file appears to reference. Review signal by default.                                                                                          |
| `audit`                 | Runs a high-severity dependency audit. Blocking security gate.                                                                                                                             |
| `audit:all`             | Runs dependency audit across all severities. Review signal for maintenance.                                                                                                                |
| `build`                 | Builds the static Astro site into `dist/` and generates the Pagefind search index for real content routes, excluding generated redirect fallback pages.                                    |
| `check`                 | Runs the normal blocking quality gate for PR work: content validation, asset invariants, typecheck, lint, package ordering, formatting, dead-code checks, and coverage-checked unit tests. |
| `check:release`         | Runs the blocking pre-release gate: `check`, production build, build verification, HTML validation, browser tests, high-severity audit, and secrets scan.                                  |
| `coverage`              | Runs unit/script/component/page tests with LCOV output, then verifies every testable TS/TSX source file is represented. Review signal until line thresholds exist.                         |
| `coverage:check`        | Runs the coverage gate with concise output for `check` and CI.                                                                                                                             |
| `coverage:unit`         | Generates Bun text and LCOV coverage for unit-level tests.                                                                                                                                 |
| `coverage:verify`       | Verifies the LCOV report includes every testable source file, excluding config/declaration files and browser-only entrypoints covered by Playwright.                                       |
| `deadcode`              | Runs Knip to find unused files, exports, dependencies, binaries, and stale scripts.                                                                                                        |
| `dev`                   | Starts the Astro development server.                                                                                                                                                       |
| `fix`                   | Runs safe automatic fixes for code and config: ESLint fixes and code/config formatting.                                                                                                    |
| `fix:markdown`          | Runs mechanical Markdown/MDX formatting. Use only when Markdown content formatting is in scope.                                                                                            |
| `format`                | Runs the blocking code/config formatting check.                                                                                                                                            |
| `format:code`           | Checks formatting for Astro, CSS, JS/TS, JSON, and YAML files.                                                                                                                             |
| `format:code:write`     | Applies formatting to Astro, CSS, JS/TS, JSON, and YAML files.                                                                                                                             |
| `format:markdown`       | Checks Markdown/MDX formatting. Review-only for article content.                                                                                                                           |
| `format:markdown:write` | Applies Markdown/MDX formatting. Use with care around article content.                                                                                                                     |
| `format:write`          | Applies code/config formatting.                                                                                                                                                            |
| `lint`                  | Runs strict ESLint for JS, TS, Astro, and related source/config files. Blocking gate.                                                                                                      |
| `lint:fix`              | Runs ESLint with safe autofixes enabled.                                                                                                                                                   |
| `lint:markdown`         | Runs Markdown style linting. Review-only for article content.                                                                                                                              |
| `lint:mdx`              | Runs ESLint over MDX files to catch MDX/parser/code issues.                                                                                                                                |
| `lint:packages`         | Checks deterministic `package.json` ordering.                                                                                                                                              |
| `preview`               | Serves the built `dist/` output locally with Astro preview.                                                                                                                                |
| `preview:fresh`         | Builds the site, then starts Astro preview. Useful for production-like local testing.                                                                                                      |
| `quality`               | Runs the local quality path quietly, printing only failures and review warnings.                                                                                                           |
| `quality:release`       | Runs the release quality path quietly, with blocking release gates plus non-blocking review signals.                                                                                       |
| `review:assets`         | Runs duplicate and unused image review checks without blocking publishing.                                                                                                                 |
| `review:markdown`       | Runs Markdown/MDX style checks without blocking publishing.                                                                                                                                |
| `secrets`               | Runs Gitleaks against git history. Blocking security gate when available.                                                                                                                  |
| `test`                  | Runs fast Bun unit/script/component/page tests.                                                                                                                                            |
| `test:a11y`             | Runs axe accessibility checks in Playwright. Review signal.                                                                                                                                |
| `test:e2e`              | Runs Playwright browser smoke, responsive, navigation, theme, and search tests. Blocking browser gate.                                                                                     |
| `test:flake`            | Repeats the unit/script test suite to investigate nondeterminism. Manual diagnostic.                                                                                                       |
| `test:perf`             | Runs Lighthouse CI against built output. Review signal.                                                                                                                                    |
| `typecheck`             | Runs Astro typechecking, failing on warnings, then TypeScript checks for tools/scripts/tests.                                                                                              |
| `typecheck:astro`       | Runs `astro check` and treats Astro warnings as failures.                                                                                                                                  |
| `typecheck:tools`       | Runs TypeScript checking for scripts, tests, and tooling config.                                                                                                                           |
| `validate:html`         | Validates representative built HTML files and fails on warnings.                                                                                                                           |
| `verify`                | Verifies built `dist/` output: expected pages, local links, draft exclusion, JSON-LD, and static-page script constraints.                                                                  |
| `verify:content`        | Verifies source content invariants such as URL-safe slugs/categories and duplicate article slugs.                                                                                          |
