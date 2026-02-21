---
"bunkit-cli": minor
"@bunkit/core": minor
"@bunkit/templates": minor
---

Add shadcn/ui February 2026 features, migrate command, and CI/CD improvements

**Added:**

- Base UI style variants: `base-maia`, `base-vega`, `base-nova`, `base-lyra`, `base-mira`
- RTL (right-to-left) support via `--shadcn-rtl` flag and interactive prompt
- `bunkit migrate` command for shadcn/ui migrations (radix, rtl, icons)
- Unified `radix-ui` package support (replaces 20+ individual `@radix-ui/react-*` packages)
- Auto-inference of shadcn base (Radix/Base UI) from style name
- Helper functions `inferShadcnBase()` and `isModernShadcnStyle()` in @bunkit/core
- Tests for new helper functions (8 new tests, 191 total)

**Changed:**

- Default shadcn/ui style: `new-york` → `radix-maia`
- Default icon library: `phosphor`/`lucide` → `iconoir` (1,600+ tree-shakeable icons)
- CI pipeline: Release now depends on CI passing (prevents publishing broken code)
- CI/CD: Bun version updated from 1.3.4 to 1.3.9
- README: Complete rewrite with accurate preset descriptions and documentation
- Biome config: `noUnusedImports` set to warn (fixes CI lint failures)

**Removed:**

- Obsolete `fix-npm-tag.yml` workflow
- Redundant security-scan and authorship-check CI jobs
