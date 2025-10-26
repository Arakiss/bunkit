---
"bunkit-cli": patch
"@bunkit/templates": patch
---

Fix catalog dependency resolution in generated projects

**Fixed:**
- Add complete dependency catalog to generated monorepo root package.json
- Fix single-repo presets (web, api) to use direct versions instead of catalog:
- Update ultracite version from ^1.0.0 to ^6.0.1 (correct npm version)
- Fix init.enhanced.ts to skip additional dependency installation for monorepos
- Prevent duplicate dependencies in generated projects

**Improved:**
- Monorepo catalog now includes all possible dependencies:
  - Frontend: React, Next.js
  - Backend: Hono
  - Database: Drizzle ORM, Drizzle Kit, Postgres, Supabase
  - Styling: Tailwind CSS, PostCSS, Autoprefixer
  - UI: shadcn/ui dependencies (Radix, CVA, clsx, tailwind-merge, iconoir)
  - Code Quality: Biome, Ultracite
  - Testing: Vitest
  - Types: All @types packages
- Single repos now use direct versions matching catalog
- Database and code quality generators return direct versions

**Tested:**
- ✅ Full preset with SQLite + Biome: bun install successful
- ✅ Web preset: bun install successful
- ✅ API preset: bun install successful
- ✅ All dependency resolution working correctly
