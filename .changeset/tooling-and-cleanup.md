---
"bunkit-cli": minor
"@bunkit/core": patch
"@bunkit/templates": minor
---

Add development tooling and clean up dead code

**Added:**
- CI/CD workflow with quality checks, security scanning, and authorship protection
- Husky v9 git hooks for commit message validation
- Commitlint for Conventional Commits enforcement
- Knip configuration for dead code detection
- README generators for all project presets (minimal, Next.js, Hono API, Bun API, Bun fullstack, monorepo)

**Changed:**
- Replace fs-extra with native node:fs/promises in @bunkit/core
- Remove unused dependencies (consola, defu, ora, fs-extra)
- Remove unused exports and internal types
- Improve release workflow with caching and additional checks

**Removed:**
- Dead code: init.real.ts, port-helper.ts
- Unused dependencies from all packages
