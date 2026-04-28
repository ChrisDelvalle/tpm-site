# Quality Tooling Plan

This document defines the project tooling target for code quality, formatting,
testing, security, performance, and release readiness.

The Gridgen project under `Unrelated Project/gridgen` is a useful reference for
strict local tooling. We should reuse its philosophy and several patterns, but
not copy it blindly. This site has different constraints: Astro components,
Markdown/MDX content, Tailwind, static output, Lighthouse goals, and an authoring
model where article writers should not touch code.

## Tooling Philosophy

The default stance is strict.

- Prefer tools that catch mistakes before runtime.
- Prefer type-checked lint rules over syntax-only lint rules.
- Prefer safe automatic fixes where the tool can make a deterministic change.
- Prefer well-regarded professional defaults, then make them stricter when doing
  so improves robustness.
- Prefer project-specific validation when generic tools cannot understand the
  content model.
- Treat warnings as failures in CI.
- Keep release checks reproducible through Bun scripts.

Strict tooling should make invalid state hard or impossible to represent. It
should not create noise that developers learn to ignore.

## Script Simplicity Policy

Keep QA scripts simple, direct, and inspectable.

Strict tooling should not depend on clever shell wrappers or complicated custom
scripts that make failures harder to understand. A check should usually be a
thin call to a well-known tool with explicit options.

Prefer:

- one repository script per tool or responsibility;
- direct commands such as `eslint .`, `astro check`, `playwright test`, and
  `lhci autorun`;
- short composition scripts such as `check` and `check:release` that call other
  named scripts;
- tool config files checked into the repo;
- deterministic validation scripts with clear failure messages.

Avoid:

- hidden shell logic inside long package scripts;
- pipes or redirections that suppress useful errors;
- wrappers that reinterpret exit codes;
- scripts that pass even when an underlying tool fails;
- custom scripts for behavior a standard tool already handles well;
- generated config that developers cannot easily inspect;
- flags copied from another project without understanding what they do.

Every non-obvious flag should be understood before it is added. If a flag exists
to control noise, performance, CI behavior, or failure semantics, document that
reason near the script or in the relevant config file.

Custom validation scripts are appropriate when the project has domain-specific
rules that generic tools cannot know, such as draft exclusion, duplicate slugs,
legacy permalink separation, article image validation, and generated output
checks. Those scripts should be small, deterministic, and focused on one class
of invariant.

## Output And Noise Policy

Tool output should be useful, quiet, and action-oriented.

This matters for human developers and for coding agents. Agents will run these
tools often, and noisy output wastes review time and context. Prefer tooling
configuration that emits enough information to fix real problems without dumping
large volumes of irrelevant detail.

Local scripts should:

- use concise reporters where available;
- fail with clear actionable messages;
- avoid verbose logs on success;
- avoid watch mode in check scripts;
- avoid printing generated file contents;
- avoid stack traces for expected validation failures;
- summarize counts and file paths for content validation failures;
- use deterministic ordering for diagnostics;
- treat warnings as failures instead of letting warnings accumulate.

CI may collect more artifacts than local checks, such as Playwright traces,
Lighthouse reports, coverage reports, and screenshots. Even in CI, command logs
should stay readable and point to artifacts for detail instead of flooding the
main job output.

## Auto-Fix Policy

Use safe automatic fixes before spending time diagnosing mechanical issues.

Agents should usually run the safe fixer before the normal check when the task
touches code, config, or formatted docs:

```sh
bun run fix
bun run check
```

This avoids wasting time and context on issues that tools can repair
deterministically, such as import ordering, class ordering, formatting, and
simple lint autofixes.

Safe fixers are allowed to modify files. Before running them, be aware of the
worktree and do not stage, revert, or overwrite unrelated user changes.

Auto-fix should not be used to hide semantic problems. If a fix changes behavior
or touches content whose exact text must be preserved, inspect the diff before
continuing.

Do not autoformat migrated article bodies while content fidelity remains a
migration invariant.

## Gridgen Patterns To Adopt

These Gridgen patterns transfer well:

- `check` for the normal PR loop.
- `check:release` for the heavier pre-release gate.
- `fix` as the safe automatic repair command.
- ESLint flat config.
- `eslint . --max-warnings=0`.
- `--report-unused-disable-directives-severity error`.
- Type-aware `typescript-eslint` strict configs.
- Separate TypeScript configs for app/source code and scripts/tests.
- Strict compiler flags such as `noUncheckedIndexedAccess`,
  `exactOptionalPropertyTypes`, `noImplicitReturns`,
  `noPropertyAccessFromIndexSignature`, and `noUncheckedSideEffectImports`.
- `simple-import-sort`.
- `sonarjs` complexity and duplicate-branch checks.
- `unicorn` modern JavaScript correctness rules.
- `regexp` linting.
- `no-unsanitized` for code that writes HTML or uses DOM sinks.
- `knip` dead-code checks.
- randomized unit tests when useful.
- Playwright `forbidOnly`.
- gitleaks.
- `bun audit`.

## Gridgen Patterns To Adapt Or Avoid

Some Gridgen choices need project-specific handling:

- Do not copy React/Vite-only tooling unless React components are actually
  added.
- Do not lint `dist/`, generated content mirrors, or copied legacy assets.
- Do not apply aggressive Markdown autoformatting to migrated article bodies
  while content fidelity is still a migration invariant.
- Do not require JSDoc on every Astro UI component. Require useful docs on
  exported library helpers, public types, and non-obvious scripts instead.
- Do not ban default exports in config files where the ecosystem expects them.
- Do not use package publishing checks unless this site later ships a package.
- Do not let shadcn-generated files set the standard for the rest of the code.
  If generated UI files are added, lint them with targeted exceptions.

## TypeScript

Target:

- Keep `astro check` as a required gate because Astro build does not typecheck.
- Move from `astro/tsconfigs/strict` to `astro/tsconfigs/strictest` if it is
  practical.
- Add explicit strict compiler options where Astro's preset does not cover them.
- Add `tsconfig.tools.json` for scripts, tests, and Playwright config.
- Add `src/env.d.ts` only for real global type extensions.
- Use type-only imports consistently.
- Avoid `any`; prefer `unknown` plus validation.
- Avoid non-null assertions.
- Avoid unchecked index access.
- Normalize raw content into typed domain objects before passing it into UI.

Recommended TypeScript options:

```json
{
  "allowJs": false,
  "allowUnreachableCode": false,
  "allowUnusedLabels": false,
  "exactOptionalPropertyTypes": true,
  "forceConsistentCasingInFileNames": true,
  "isolatedModules": true,
  "moduleDetection": "force",
  "noFallthroughCasesInSwitch": true,
  "noImplicitOverride": true,
  "noImplicitReturns": true,
  "noPropertyAccessFromIndexSignature": true,
  "noUncheckedIndexedAccess": true,
  "noUncheckedSideEffectImports": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "strict": true,
  "verbatimModuleSyntax": true
}
```

## Environment Reproducibility

Tooling should run the same way locally, in CI, and for coding agents.

Use:

- `packageManager` in `package.json` to pin the expected Bun major/minor version.
- `engines.node` for the Node version required by Astro and related tools.
- `bun.lock` as the committed lockfile.
- `bun install --frozen-lockfile` in CI.
- exact CI setup versions for Node and Bun where practical.

Avoid:

- relying on globally installed tools;
- mixing npm/yarn/pnpm lockfiles into the active Bun workflow;
- leaving old package-manager artifacts in place after they are no longer part
  of the build.

If a tool requires Node even though scripts are Bun-first, document that in the
script or relevant config.

## ESLint

Use ESLint flat config.

Recommended packages:

- `eslint`
- `@eslint/js`
- `typescript-eslint`
- `eslint-config-prettier`
- `eslint-plugin-astro`
- `eslint-plugin-jsx-a11y`
- `eslint-plugin-simple-import-sort`
- `eslint-plugin-sonarjs`
- `eslint-plugin-unicorn`
- `eslint-plugin-regexp`
- `eslint-plugin-no-unsanitized`
- `eslint-plugin-jsdoc`
- `globals`

If React is added:

- `eslint-plugin-react`
- `eslint-plugin-react-hooks`

Core config approach:

- Apply `@eslint/js` recommended rules.
- Apply `typescript-eslint` `strictTypeChecked`.
- Apply `typescript-eslint` `stylisticTypeChecked`.
- Apply `eslint-plugin-astro` recommended rules.
- Apply Astro-compatible strict accessibility rules from `eslint-plugin-astro`
  and `eslint-plugin-jsx-a11y`.
- Apply project-specific overrides for config files, scripts, tests, generated
  files, and Astro files.

Rules to carry forward from Gridgen where applicable:

- `curly: ["error", "all"]`
- `eqeqeq: ["error", "always"]`
- `no-alert`
- `no-debugger`
- `no-eval`
- `no-new-func`
- `no-var`
- `prefer-const`
- `prefer-object-has-own`
- `radix`
- `require-atomic-updates`
- `simple-import-sort/imports`
- `sonarjs/cognitive-complexity`
- `sonarjs/no-duplicated-branches`
- `sonarjs/no-identical-conditions`
- `unicorn/no-abusive-eslint-disable`
- `unicorn/prefer-add-event-listener`
- `unicorn/prefer-modern-dom-apis`
- `unicorn/prefer-number-properties`
- `unicorn/throw-new-error`
- `regexp` recommended rules

TypeScript-specific rules to enforce:

- `@typescript-eslint/no-explicit-any` with `fixToUnknown`
- `@typescript-eslint/no-floating-promises`
- `@typescript-eslint/no-misused-promises`
- `@typescript-eslint/no-non-null-assertion`
- `@typescript-eslint/no-unsafe-assignment`
- `@typescript-eslint/no-unsafe-member-access`
- `@typescript-eslint/no-unsafe-call`
- `@typescript-eslint/no-unsafe-return`
- `@typescript-eslint/no-unnecessary-condition`
- `@typescript-eslint/strict-boolean-expressions`
- `@typescript-eslint/switch-exhaustiveness-check`
- `@typescript-eslint/consistent-type-imports`
- `@typescript-eslint/consistent-type-exports`
- `@typescript-eslint/restrict-template-expressions`
- `@typescript-eslint/restrict-plus-operands`
- `@typescript-eslint/prefer-nullish-coalescing`
- `@typescript-eslint/prefer-optional-chain`

Project-specific restrictions:

- Ban focused tests: `test.only`, `describe.only`, `it.only`.
- Ban `console` in `src/` except where explicitly allowed.
- Ban unsafe HTML sinks except in audited rendering code.
- Ban unnecessary client hydration once React/MDX islands exist, either through
  lint rules or a custom verifier.
- Ban direct imports from generated content directories.

## Config File Validation

Configuration files should be formatted and validated too. Config mistakes are
build mistakes.

Use Prettier for ordinary formatting of JSON, YAML, Markdown, CSS, and config
files. Add stricter linting where it catches real mistakes without becoming
noisy.

Consider:

- `eslint-plugin-jsonc` for JSON and JSONC files.
- `eslint-plugin-yml` plus `yaml-eslint-parser` for YAML files.
- `sort-package-json` for deterministic `package.json` ordering.
- JSON Schema comments or `$schema` fields where supported by the config file.

Start with the config files that affect CI and builds:

- `package.json`
- `tsconfig*.json`
- `.prettierrc*`
- `astro.config.*`
- `eslint.config.*`
- `playwright.config.*`
- `lighthouserc.*`
- `.github/**/*.yml`
- `dependabot.yml`

Do not add config linting that fights the documented format expected by a tool.

## Formatting

Use Prettier as the only formatter.

Recommended packages:

- `prettier`
- `prettier-plugin-astro`
- `prettier-plugin-tailwindcss`

Configuration:

- Include `prettier-plugin-astro`.
- Put `prettier-plugin-tailwindcss` last.
- Use `format` for checking and `format:write` for modification.
- Keep formatting deterministic and boring.

Important project-specific decision:

- Format repository docs such as `README.md`, `CHECKLIST.md`,
  `DESIGN_PHILOSOPHY.md`, and `QUALITY_TOOLING.md`.
- Do not automatically reformat migrated article bodies while exact content
  preservation remains a requirement.

That likely means `.prettierignore` should ignore article source folders, not
all Markdown files globally.

## Tailwind

When Tailwind lands:

- Use `prettier-plugin-tailwindcss` for canonical class ordering.
- Use Tailwind utilities in components by default.
- Keep global CSS tiny and foundational.
- Use `@tailwindcss/typography` for Markdown prose.
- Use `class-variance-authority`, `clsx`, and `tailwind-merge` only when they
  reduce real component complexity.

Consider `eslint-plugin-tailwindcss` only if it supports the Tailwind version
and Astro syntax cleanly enough to be strict without noise.

## Tests

Use Bun's test runner for pure TypeScript logic unless a specific need appears
for Vitest.

Test:

- article slug derivation;
- topic derivation;
- draft filtering;
- frontmatter normalization;
- route helper output;
- duplicate slug detection;
- image path validation;
- RSS/sitemap/search source filtering;
- migration helpers;
- any custom Markdown/content transforms.

Borrow from Gridgen:

- `bun test --randomize --concurrent` for normal logic tests.
- `test:flake` for repeated randomized test runs when helper logic becomes
  important enough to justify it.
- coverage output for release checks.

## Browser Tests

Use Playwright for real browser behavior.

Recommended packages:

- `@playwright/test`
- `@axe-core/playwright`

Playwright should verify:

- homepage renders;
- article archive renders;
- representative article renders;
- article with images renders;
- topic page renders;
- about page renders;
- mobile navigation opens, closes, and traps/returns focus where appropriate;
- theme toggle works;
- search UI works after build;
- no horizontal overflow across viewport matrix;
- major content blocks do not overlap;
- representative screenshots remain structurally sane.

Use `forbidOnly: true`.

Prefer running Playwright against built output with `bun run build` and
`bun run preview` so tests reflect deployable static output.

## Accessibility

Use both lint-time and browser-time accessibility checks.

Lint-time:

- Astro accessibility rules.
- JSX accessibility rules when React/MDX components exist.

Browser-time:

- `@axe-core/playwright` against representative pages.
- Fail on serious and critical violations.
- Keep manual review for things automated a11y cannot prove, such as link text
  quality, heading clarity, and visual reading rhythm.

## Performance

Use Lighthouse CI.

Recommended package:

- `@lhci/cli`

Run performance checks against production output, not the dev server. The
performance test should build the site, serve `dist/` through Astro preview or a
static server, and audit that output.

Audit representative pages:

- `/`
- `/articles/`
- one long article;
- one article with images;
- one topic page;
- `/about/`

Track:

- category scores;
- LCP;
- CLS;
- TBT;
- JavaScript size;
- CSS size;
- image transfer size;
- total request count.

Performance should have high thresholds and budgets. Accessibility, SEO, and
Best Practices should move toward hard 100 gates once the site is stable.

Lighthouse budgets should track the things this project can directly control:

- Astro-managed JavaScript transfer size.
- Pagefind JavaScript transfer size on the search page.
- CSS transfer size.
- image transfer size.
- number of render-blocking resources.
- Largest Contentful Paint candidate size and loading behavior.
- Cumulative Layout Shift.
- third-party requests.

The target implementation should normally ship no Astro client JavaScript on
static reading pages. When a page needs JavaScript, keep it route-local and
measure it.

## Build Output Validation

The build verifier should keep production output honest.

Checks should confirm:

- `dist/` exists after `bun run build`.
- expected routes render to static HTML.
- project CSS is emitted as hashed `_astro/*.css` assets or intentionally
  inlined by Astro.
- no unexpected Astro client JavaScript appears on static reading pages.
- Pagefind output exists only under `dist/pagefind/`.
- built HTML does not contain unresolved Liquid/Jekyll tokens.
- built pages do not reference missing local assets.
- draft and unpublished articles do not appear in routes, RSS, sitemap, search,
  topic pages, or archives.
- generated search files exist after the Pagefind step.

These checks should report concise file paths and counts. They should not dump
large HTML, CSS, or search index contents into command output.

## Content Validation

Generic tooling will not understand this site's authoring model, so
project-specific verification is mandatory.

Expand `scripts/verify-build.mjs` or split it into focused validators:

- source article validation;
- generated route validation;
- built output validation;
- RSS/sitemap/search validation;
- asset validation.

Checks should include:

- every source article has required metadata;
- drafts stay unpublished;
- duplicate slugs fail;
- topic folders derive valid topics;
- reserved folders are not topics;
- article images exist;
- meaningful images have alt text where detectable;
- generated article URLs are stable;
- old Jekyll fields do not drive core routing;
- `legacyPermalink` is preserved but isolated;
- no Liquid/Jekyll artifacts appear in output;
- generated content mirrors are not hand-edited;
- no old dated pages accidentally appear unless explicitly generated as isolated
  redirect fallback pages.

This is the main place to make invalid content state unrepresentable.

## Dead Code And Dependency Hygiene

Use `knip`.

Recommended package:

- `knip`

Knip should catch:

- unused files;
- unused exports;
- unused dependencies;
- unused binaries;
- stale scripts.

Configure intentional exceptions for:

- Astro route files;
- generated content;
- config files detected by tools but not imported;
- shadcn-generated components if added.

Also consider:

- `sort-package-json` for package ordering.
- `npm-package-json-lint` if we want strict package metadata policy.

## Markdown And Docs

Use Markdown linting for project docs, not legacy article bodies during the
content-fidelity phase.

Recommended package:

- `markdownlint-cli2`

Apply to:

- root project docs;
- future authored technical docs;
- migration plans.

Exclude or carefully scope:

- migrated article bodies;
- legacy content that must remain byte-for-byte stable.

## Security

Use both local scripts and GitHub-native security checks.

Local/release scripts:

- `bun audit --audit-level=high`
- `gitleaks git --redact --no-banner`

GitHub:

- secret scanning;
- push protection;
- Dependency Review Action;
- CodeQL for JavaScript/TypeScript;
- Dependabot or Renovate.

CI should fail when a PR introduces high-risk dependency issues or secrets.

## Git Hygiene

Keep repository state boring and reviewable.

Use:

- `.gitignore` entries for generated output, local caches, coverage, traces, and
  OS/editor artifacts.
- committed config files for every tool that affects checks.
- branch protection for required CI checks.
- Dependabot or Renovate for dependency updates.

Avoid:

- committing generated build output unless there is an explicit deploy reason;
- committing `.DS_Store`, local screenshots, traces, or temporary browser
  output;
- relying on local-only hooks for required validation.

Local git hooks may be useful as convenience, but CI and Bun scripts must remain
the source of truth. If hooks are added, prefer a simple tool such as Lefthook
and have it call existing repository scripts rather than duplicate logic.

## Suggested Scripts

Target script shape:

These scripts should stay boring. If a command grows enough that it is hard to
read in `package.json`, move the logic into a focused script file with tests or
clear validation output. Do not hide tool failures behind wrapper scripts.

```json
{
  "dev": "bun run sync:content && astro dev",
  "sync:content": "node scripts/sync-content.mjs",
  "build": "bun run sync:content && ASTRO_TELEMETRY_DISABLED=1 astro build && pagefind --site dist",
  "preview": "ASTRO_TELEMETRY_DISABLED=1 astro preview",

  "format": "prettier --check . --log-level warn",
  "format:write": "prettier --write .",
  "lint": "eslint . --max-warnings=0 --report-unused-disable-directives-severity error --no-cache",
  "lint:fix": "eslint . --fix --max-warnings=0 --report-unused-disable-directives-severity error --no-cache",
  "fix": "bun run lint:fix && bun run format:write",

  "typecheck": "bun run sync:content && ASTRO_TELEMETRY_DISABLED=1 astro check",
  "deadcode": "knip",
  "test": "bun test tests --randomize --concurrent",
  "test:flake": "bun run scripts/check-flaky-tests.ts",
  "test:e2e": "bun run build && playwright test",
  "test:a11y": "bun run build && playwright test tests/a11y",
  "test:perf": "bun run build && lhci autorun",
  "coverage": "bun run test --coverage --coverage-reporter=text --coverage-reporter=lcov",

  "verify": "node scripts/verify-build.mjs",
  "audit": "bun audit --audit-level=high",
  "secrets": "gitleaks git --redact --no-banner",

  "check": "bun run typecheck && bun run lint && bun run format && bun run deadcode && bun run test",
  "check:release": "bun run check && bun run build && bun run verify && bun run test:e2e && bun run test:a11y && bun run test:perf && bun run coverage && bun run audit && bun run secrets"
}
```

The exact script order can be adjusted for speed, but `check:release` should be
the canonical heavy gate. When adopting the scripts, verify each flag against
the tool documentation instead of copying it mechanically.

## CI Shape

GitHub Actions should live in this repository under `.github/workflows/`.

Local Bun scripts should define the canonical checks. GitHub Actions should call
those scripts instead of duplicating long command logic in workflow YAML.

The current baseline CI should run at least:

- install with Bun and frozen lockfile;
- `bun run check`;
- `bun run build`;
- `bun run verify`.

As tooling lands, split heavier checks into separate jobs:

- unit/type/lint/format/deadcode;
- build/verify;
- Playwright;
- axe;
- Lighthouse CI;
- security audit;
- gitleaks;
- Dependency Review;
- CodeQL.

Use branch protection so the required checks must pass before merge.

Recommended GitHub configuration:

- `.github/workflows/ci.yml` for normal PR checks.
- `.github/workflows/codeql.yml` for GitHub CodeQL.
- `.github/workflows/dependency-review.yml` for dependency review on pull
  requests.
- `.github/dependabot.yml` or `renovate.json` for dependency updates.

Once Ruby/Jekyll is fully removed from the active build path, remove legacy
Bundler dependency tracking from Dependabot.

## Adoption Order

Add tooling in this order to avoid creating an unmanageable wall of failures:

1. Prettier config cleanup, EditorConfig, and Tailwind class sorting once
   Tailwind lands.
2. TypeScript strictest settings and `tsconfig.tools.json`.
3. ESLint flat config with Astro, TypeScript, import sorting, and a11y.
4. Content validation improvements.
5. Bun unit tests for content and route helpers.
6. Knip dead-code checks.
7. Playwright smoke/responsive tests.
8. axe accessibility tests.
9. Lighthouse CI.
10. gitleaks, audit, Dependency Review, and CodeQL.

Each phase should leave the repo passing `bun run check` before the next phase
starts.
