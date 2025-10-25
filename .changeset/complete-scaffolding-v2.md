---
"bunkit-cli": patch
"@bunkit/templates": patch
---

HOTFIX: Generate complete project scaffolding with all source files

Fixed critical bug where full preset only created package.json files without any source code. Now generates complete, runnable projects with:

**Next.js Apps (web + platform):**
- src/app/layout.tsx with proper metadata
- src/app/page.tsx with starter content
- src/app/globals.css with Tailwind CSS 4
- next.config.ts configuration
- tailwind.config.ts configuration
- tsconfig.json with Next.js paths

**Hono API:**
- src/index.ts with complete server setup
- Middleware (logger, cors)
- Basic routes (/, /health, /api/users)
- Error handlers
- Bun.serve with HMR enabled
- tsconfig.json for Bun

**Shared Packages:**
- types/src/index.ts with User and ApiResponse interfaces
- utils/src/index.ts with formatDate, validateEmail, generateId functions

All generated projects are now fully functional and can be run immediately with `bun dev`.
