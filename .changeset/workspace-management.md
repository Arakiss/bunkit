---
"bunkit-cli": minor
"@bunkit/core": minor
"@bunkit/templates": minor
---

Add workspace and package management commands

**Added:**
- `bunkit add workspace` command - Add Next.js, Hono, or library workspaces to monorepos
- `bunkit add package` command - Add shared packages (library, utils, types, config) to monorepos
- Monorepo detection and validation utilities in @bunkit/core
- Workspace builders for Next.js, Hono, and library presets in @bunkit/templates
- Interactive and non-interactive modes for all commands
- Automatic catalog integration for new workspaces and packages
- TypeScript project references support

**Changed:**
- Update README.md to emphasize architecture-first philosophy
- Update CLI README.md with actual capabilities
- Remove non-existent examples directory reference

**Features:**
- Complete monorepo management system
- Workspace management with dependency catalog integration
- Shared package creation system (library, utils, types, config)
- Proper Bun workspace integration with isolated installs
