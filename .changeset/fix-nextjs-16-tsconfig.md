---
"@bunkit/templates": patch
---

Fix Next.js 16 TypeScript configuration warnings

Updated tsconfig.json templates to match Next.js 16 requirements, eliminating auto-reconfiguration warnings on first `bun dev` run.

**Changes:**
- Set `jsx` to `"react-jsx"` (Next.js 16 uses React automatic runtime)
- Updated `include` path to `.next/dev/types/**/*.ts` (correct development types location)

**Impact:**
Projects scaffolded with `web` or `full` presets now start cleanly without TypeScript reconfiguration messages.

**Files updated:**
- `packages/templates/src/builders/web.ts` - Standalone web preset
- `packages/templates/src/builders/full.ts` - Monorepo web and platform apps
