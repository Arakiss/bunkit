---
"@bunkit/cli": minor
"@bunkit/core": patch
"@bunkit/templates": minor
---

### Major Improvements

#### shadcn/ui Monorepo Integration
- **Full monorepo support**: shadcn/ui components are now properly configured in `packages/ui` for enterprise and full-stack presets
- **Automatic component installation**: Default components (button, card) are installed automatically
- **Bun workspace integration**: Components use `@workspace/ui` imports with proper exports configuration
- **Tailwind CSS v4 support**: CSS-first configuration using `@theme inline` directive (no tailwind.config.ts needed)
- **Component index auto-update**: Components index file is automatically updated when adding new components

#### Enterprise Preset Enhancements
- **Interactive theme customization**: `bunkit create enterprise-monorepo` now allows quick customization of shadcn/ui theme (style, color, radius)
- **Sensible defaults**: New York style, Zinc color, 0.625rem radius with option to customize
- **Port conflict handling**: All dev scripts support `PORT` environment variable for easy port override
- **Git branch fix**: Default branch is now `main` instead of `master`

#### Developer Experience
- **Simplified command**: `bunkit create enterprise-monorepo myapp` works with production-ready defaults
- **Better error messages**: Clear guidance when ports are in use
- **Documentation**: Comprehensive shadcn/ui documentation in monorepo projects
