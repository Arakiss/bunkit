---
"bunkit-cli": patch
"@bunkit/templates": patch
---

Fix shadcn CLI component installation (resolvedPaths error)

**Fixed:**
- Change components.json aliases from relative paths (`./src/components`) to TypeScript path aliases (`@/components`)
- shadcn CLI v3.6+ uses `tsconfig-paths` to resolve aliases and requires the `@/` format
- Components now install correctly via `bunx shadcn@latest add button card`

**Root Cause:**
The previous fix (cf01a7c) used relative paths to prevent literal `@` directories, but shadcn CLI v3.6+ changed behavior and now requires aliases that match tsconfig.json paths configuration.

**Testing:**
```bash
cd packages/ui && bunx shadcn@latest add button card -y
# ✅ Creates src/components/ui/button.tsx
# ✅ Creates src/components/ui/card.tsx
```
