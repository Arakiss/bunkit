# @bunkit/core

## 0.3.0

### Minor Changes

- de87a5a: Make CLI 100% AI-controllable and fix cross-platform banner rendering

  **Major Improvements:**

  1. **Fixed Broken Banner (Cross-Platform)**

     - Replaced manual unicode box-drawing characters (╔═╗║) with professional `boxen` library
     - Banner now renders perfectly on all terminals (macOS, Linux, Windows)
     - Uses standard ASCII art (figlet-style) instead of custom unicode fonts
     - Added `boxen`, `chalk`, and `ora` for robust CLI presentation

  2. **Non-Interactive Mode (AI-Friendly)**

     - Added full env var support: `BUNKIT_PROJECT_NAME`, `BUNKIT_PRESET`, `BUNKIT_GIT`, `BUNKIT_INSTALL`, `BUNKIT_NON_INTERACTIVE`
     - Added CLI flags: `--name`, `--preset`, `--no-git`, `--no-install`, `--non-interactive`
     - Priority system: env vars > flags > interactive prompts
     - AI agents (like Claude Code) can now create projects autonomously without human intervention

  3. **Enhanced Developer Experience**
     - Configuration summary displayed in non-interactive mode
     - Clear error messages when required options are missing
     - Comprehensive documentation in README.md
     - Examples for both env vars and CLI flags

  **Technical Changes:**

  - Added `boxen@^8.0.1`, `chalk@^5.4.1`, `ora@^8.2.0` to dependency catalog
  - Rewrote `packages/core/src/banner.ts` with boxen
  - Updated `packages/cli/src/commands/init.real.ts` with `InitOptions` interface
  - Added `getOptionValue()` helper for env var > flag > prompt priority
  - Updated `packages/cli/src/index.ts` to pass options from Commander
  - Documented non-interactive mode in `packages/cli/README.md`

  **Breaking Changes:**
  None. All changes are backward compatible. Interactive mode still works as before.

  **Migration:**
  No migration needed. This is a pure feature addition with bug fixes.

## 0.2.0

### Minor Changes

- 21a0329: Enhance CLI presentation and discoverability

  **Banner Improvements:**

  - Redesigned ASCII banner with professional box drawing characters
  - Added 10 random inspirational quotes for variety ("Don't Panic", indie hacker wisdom, shipping culture)
  - Repositioned bread mascot to footer with version number
  - Added "Modern. Fast. Opinionated." tagline
  - Dynamic version reading from package.json using Bun.file()

  **README & Documentation:**

  - Created comprehensive README.md for npmjs.com package page
  - Added installation instructions for both global and bunx usage
  - Documented all commands (init, create, add) with examples
  - Included tech stack overview and project structure
  - Added badges (npm version, license, Bun compatibility)

  **SEO Optimization:**

  - Expanded keywords from 12 to 40+ terms for better discoverability
  - Added targeted keywords: bunkit, scaffolding, fullstack, saas-boilerplate, indie-hacker, rapid-development
  - Included framework-specific terms: next.js, react-19, hono, drizzle-orm, tailwindcss, shadcn-ui
  - Added context keywords: production-ready, enterprise, typescript-template, bun-template

  These improvements significantly enhance the CLI's professional appearance and make it easier for developers to discover bunkit through npm search.

## 0.1.0

### Minor Changes

- # 🍞 Initial Alpha Release (v0.1.0-alpha.1)

  Complete implementation of bunkit CLI with all 4 presets and beautiful interactive experience.

  ## ✨ Features

  ### CLI Experience

  - Beautiful interactive prompts powered by @clack/prompts (same as Astro)
  - Colorful emoji-rich feedback for better UX
  - Comprehensive error handling
  - Quick non-interactive mode with `bunkit create`

  ### Project Presets

  **⚡ Minimal** - Single Bun project

  - Bun runtime with hot reload (`bun --hot`)
  - TypeScript configured
  - Clean folder structure
  - Perfect for CLIs, scripts, and utilities

  **🌐 Web** - Next.js 15 Frontend

  - Next.js 15 with App Router
  - React 19 (Server Components by default)
  - Tailwind CSS 4 (CSS-first configuration)
  - Biome (linting + formatting)
  - TypeScript strict mode

  **🚀 API** - Hono Backend

  - Hono v4 web framework
  - Bun.serve() with HMR enabled
  - Example routes and middleware
  - CORS and logging configured

  **📦 Full** - Full-Stack Monorepo

  - Bun workspaces configured
  - Dependency catalogs (centralized versions)
  - Isolated installs (no phantom deps)
  - Apps: web/ (Next.js) + api/ (Hono)
  - Packages: types/ + utils/
  - Biome for code quality

  ### Technology Stack

  - **Runtime**: Bun 1.3+
  - **Frontend**: Next.js 15.5+ | React 19.1+
  - **Backend**: Hono 4.7+
  - **Styling**: Tailwind CSS 4.1+
  - **Language**: TypeScript 5.7+
  - **Code Quality**: Biome 2.3+

  ### Developer Experience

  - Dependency installation with bun
  - Git initialization support
  - Hot module replacement
  - Fast iteration cycles
  - Enterprise-grade patterns

  ## 🔧 Commands

  - `bunx @bunkit/cli init` - Interactive project creation
  - `bunx @bunkit/cli create <preset> <name>` - Quick project creation
  - `bunx @bunkit/cli add <feature>` - Add features (placeholder)

  ## 🎯 Alpha Status

  This is an **alpha release** (v0.1.0-alpha.1) suitable for testing and early adoption.

  **What works:**

  - ✅ All 4 presets (minimal, web, api, full)
  - ✅ Interactive CLI with beautiful prompts
  - ✅ Dependency installation
  - ✅ Git initialization
  - ✅ Real file generation

  **Coming soon:**

  - Feature system (`bunkit add auth`, `database`, `ui`, etc.)
  - Tests and CI/CD
  - npm registry publication
  - Example projects

  ## 📝 Versioning

  Now using Changesets for semantic versioning and changelog management:

  - `bun run changeset` - Add changeset
  - `bun run version` - Bump versions from changesets
  - `bun run release` - Build and publish

  ## 🎨 UI Improvements

  Enhanced CLI experience with:

  - Emoji-rich prompts (📦, 🎨, 📥, 🔧)
  - Preset-specific emojis (⚡ minimal, 🌐 web, 🚀 api, 📦 full)
  - Colored output with picocolors
  - Better error messages
  - Visual spinners with status updates
  - Clear next steps with syntax highlighting

  ## 📚 Documentation

  Comprehensive README with:

  - Quick start guide
  - All 4 presets explained
  - Command reference
  - Project structure
  - Technology stack
  - Philosophy and comparisons

  ***

  **Ready to bake production-ready apps! 🍞**
