---
"bunkit-cli": major
"@bunkit/core": major
"@bunkit/templates": major
---

DX overhaul: reduce presets from 8 to 5, simplify init flow from ~25 to ~8-10 prompts

**Breaking Changes:**
- Remove `bun-api` preset (use `hono-api` instead)
- Remove `bun-fullstack` preset (use `bun-monorepo` instead)
- Remove `enterprise-monorepo` preset (use `nextjs-monorepo --enterprise` instead)
- Remove legacy `buildFullPreset`, `buildBunApiPreset`, `buildBunFullstackPreset`, `buildEnterprisePreset` exports from `@bunkit/templates`
- Rename `getScriptsForPreset` switch cases from aliases (`web`, `api`, `full`) to canonical names (`nextjs`, `hono-api`, `nextjs-monorepo`)

**Added:**
- Theme presets: `modern-clean`, `bold-vibrant`, `minimalist`, `elegant`, `custom` (replaces 7 individual shadcn/ui prompts)
- `--enterprise` flag for `nextjs-monorepo` preset (adds additional apps and services)
- `--theme` flag for `init` and `create` commands
- Migration module with `REMOVED_PRESETS` (error + suggestion) and `DEPRECATED_ALIASES` (warning + auto-resolve)
- "Advanced configuration?" gate that hides rarely-used options (code quality, testing, Docker, CI/CD, Redis, Bun.secrets)

**Changed:**
- Init flow reduced from ~25 prompts to ~8-10 prompts
- 5 canonical presets: `minimal`, `nextjs`, `hono-api`, `nextjs-monorepo`, `bun-monorepo`
- Deprecated aliases (`web`, `api`, `full`, `monorepo-nextjs`, `monorepo-bun`) still work with deprecation warnings
- Enterprise features integrated into `buildFullPresetV2` via `context.enterprise` flag
