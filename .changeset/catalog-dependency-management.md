---
"@bunkit/templates": patch
"@bunkit/core": patch
"bunkit-cli": patch
---

Implement Bun dependency catalog for centralized version management

**Fixed:**
- Replace hardcoded dependency versions with catalog: references
- Add comprehensive dependency catalog in root package.json
- Update installDependencies() to support both string[] and Record<string, string>
- Update getDatabaseDependencies() to return catalog references
- Update getCodeQualityDependencies() to return catalog references
- Update getDependenciesForPreset() to return catalog references
- Fix init.real.ts and init.enhanced.ts to handle Record return types

**Improved:**
- Centralized version management across all generated projects
- Cleaner dependency management following Bun best practices
- All generated projects now use catalog: references for consistency
- Updated TypeScript to 5.9.3

**Catalog includes:**
- Frontend: React 19.1.0, Next.js 16.0.0
- Backend: Hono 4.7.12
- Database: Drizzle ORM 0.38.0, Supabase 2.48.1, Postgres 3.4.5
- Code Quality: Ultracite 1.0.0, Biome 2.3.0
- Styling: Tailwind CSS 4.1.7
- UI: shadcn/ui dependencies (Radix, CVA, clsx, tailwind-merge, iconoir-react)
- Testing: Vitest 2.0.0
- Build Tools: TypeScript 5.9.3
