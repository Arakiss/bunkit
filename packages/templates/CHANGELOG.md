# @bunkit/templates

## 0.3.1

### Patch Changes

- 1adc3f3: HOTFIX: Generate complete project scaffolding with all source files

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

## 0.3.0

### Minor Changes

- e7281d0: Add platform app to full preset for enterprise SaaS trifecta

  The full-stack monorepo preset now creates THREE apps instead of two:

  1. **web** (port 3000) - Customer-facing app (landing, marketing, blog)
  2. **platform** (port 3001) - Dashboard/Admin panel (auth required)
  3. **api** - Backend API with Hono

  This completes the enterprise SaaS architecture pattern. The README now documents the "Enterprise SaaS Trifecta" with detailed explanations of each app's purpose.

  Also updates Next.js from 15.5.6 to 16.0.0 and removes --turbopack flags (now default).

## 0.2.1

### Patch Changes

- Updated dependencies [de87a5a]
  - @bunkit/core@0.3.0

## 0.2.0

### Minor Changes

- 21a0329: Upgrade to Next.js 16 with Turbopack and React Compiler support

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

### Patch Changes

- Updated dependencies [21a0329]
  - @bunkit/core@0.2.0

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

### Patch Changes

- Updated dependencies
  - @bunkit/core@0.1.0
