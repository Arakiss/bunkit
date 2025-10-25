---
"@bunkit/templates": minor
"bunkit-cli": minor
---

Upgrade to Next.js 16 with Turbopack and React Compiler support

**Breaking Changes:**
- Updated Next.js from v15.5.6 to v16.0.0 in web preset
- Turbopack is now default for both dev and build (no --turbopack flag needed)
- **Minimum Node.js version: 20.9.0+ (was 18.0.0+)**
- All Next.js 15 references updated to Next.js 16 across documentation

**What Changed:**
- `presets.ts`: Updated web preset to use `next: "^16.0.0"`
- `web.ts`: Updated scaffolded page text + added async params note for future dynamic routes
- Scripts: Removed `--turbopack` flag from dev and build commands (now default)
- Documentation: Updated READMEs with Node.js 20.9+ requirement
- Command hints: Updated from "Next.js 15" to "Next.js 16"

**Next.js 16 Key Features:**
- **Turbopack stable**: Default for dev and production (2-5x faster builds, 10x faster HMR)
- **React Compiler**: Stable, opt-in with `reactCompiler: true`
- **Cache Components API**: Opt-in explicit caching with `"use cache"` and `cacheLife()`
- **Async Dynamic APIs**: `params`, `searchParams`, `cookies()`, `headers()` now require `await`

**System Requirements:**
- Node.js 20.9.0+ (LTS) - **REQUIRED**
- TypeScript 5.1.0+ (bundled: 5.7.2) ✅
- React 19.1.0+ ✅
- Bun 1.3+ ✅

**Migration Notes:**
Projects created with this CLI are ready for Next.js 16 out of the box. If you add dynamic routes later, remember to:
1. Make your page/component `async`
2. `await params` and `await searchParams`
3. See inline comments in generated `page.tsx` for examples

**Performance:**
- Turbopack provides 2-5x faster production builds
- 10x faster Hot Module Replacement in development
- No configuration needed - works by default
