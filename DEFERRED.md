# Deferred Work

The milestone blocks below were copied from the previous `CHECKLIST.md` so
deferred work keeps its exact original wording and checkbox state.

## Milestone 70: Asset Inlining Delivery Strategy Follow-Up

- [ ] Design whether `assetsInlineLimit: 0` is desirable despite changing
      Astro processed scripts from inlined page scripts into external static
      assets.
- [ ] Evaluate the tradeoff with Lighthouse, browser network waterfalls,
      repeat-page cache behavior, no-JavaScript fallback behavior, and existing
      static-page client-script verification policy.
- [ ] If the delivery model is approved, update build verification to encode
      the new allowed script contract instead of treating the extra scripts as
      accidental hydration.
- [ ] Rerun `bun run payload:vite:experiments`, browser tests, accessibility
      tests, and release checks before adopting the config.
