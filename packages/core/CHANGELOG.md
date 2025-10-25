# @bunkit/core

## 0.4.1

### Patch Changes

- 39ce898: Implement Bun dependency catalog for centralized version management

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

## 0.4.0

### Minor Changes

- 7c17734: 🚀 **v0.5.0: Maximum Customization** - Transform bunkit into a fully customizable Bun project generator

  ## Major Features

  ### 1. **Comprehensive Project Customization**

  Added 10+ new configuration options for maximum project customization:

  **Database Options:**

  - PostgreSQL + Drizzle ORM (production-ready, type-safe)
  - Supabase (PostgreSQL + Auth + Storage + Realtime)
  - SQLite + Drizzle ORM (local-first, embedded)
  - None (add later)

  **Code Quality:**

  - **Ultracite** (NEW) - AI-optimized Biome preset that syncs rules across:
    - Cursor AI (`.cursorrules`)
    - Windsurf (`.windsurfrules`)
    - Claude Code (`CLAUDE.md`)
    - Zed
  - Biome (standard)

  **TypeScript Strictness:**

  - Strict (maximum type safety, recommended)
  - Moderate (balanced)
  - Loose (quick prototyping)

  **CSS Framework (web/full presets):**

  - Tailwind CSS 4 (recommended)
  - Vanilla CSS
  - CSS Modules

  **UI Library (with Tailwind):**

  - shadcn/ui (64+ accessible components)
  - None (custom components)

  **Testing Framework:**

  - Bun Test (built-in, recommended)
  - Vitest (Vite-powered)
  - None

  **Additional Options:**

  - Docker configuration (Dockerfile + docker-compose.yml)
  - GitHub Actions CI/CD (lint, typecheck, test, build)
  - .env.example generation
  - Path aliases (@/\*)

  ### 2. **Enhanced CLI Experience**

  **Interactive Mode:**

  ```bash
  bunkit init

  📦 Project name? → my-saas
  🎨 Preset? → 📦 Full-stack Monorepo
  🗄️  Database? → Supabase
  🤖 Code quality? → Ultracite (AI-optimized)
  🔒 TypeScript strictness? → Strict
  🎨 CSS framework? → Tailwind CSS 4
  🧩 UI library? → shadcn/ui
  🧪 Testing? → Bun Test
  🐳 Add Docker? → Yes
  ⚙️  Add CI/CD? → Yes
  📥 Install dependencies? → Yes
  🔧 Initialize git? → Yes
  ```

  **Configuration Summary:** Shows all choices before proceeding with confirmation

  **Non-Interactive Mode:**

  ```bash
  bunkit init \
    --name my-saas \
    --preset full \
    --database supabase \
    --code-quality ultracite \
    --ts-strictness strict \
    --css-framework tailwind \
    --ui-library shadcn \
    --testing bun-test \
    --docker \
    --cicd
  ```

  **Environment Variables Support:**

  ```bash
  BUNKIT_PROJECT_NAME=my-saas \
  BUNKIT_PRESET=full \
  BUNKIT_DATABASE=supabase \
  BUNKIT_CODE_QUALITY=ultracite \
  bunkit init --non-interactive
  ```

  ### 3. **Database Integration**

  **Automatic Setup:**

  - Drizzle ORM configuration (`drizzle.config.ts`)
  - Database client with native Bun drivers (`bun:postgres`, `bun:sqlite`)
  - Example schema with proper types
  - Migration directory structure
  - `.env.example` with database connection strings

  **API Preset:**

  - Auto-generates CRUD routes if database selected
  - Error handling for database operations
  - Type-safe queries with Drizzle

  **Full Preset:**

  - Creates `packages/db` workspace
  - Integrates with `apps/api`
  - Shared database types across monorepo

  **Supabase Specific:**

  - Supabase client setup
  - RLS-ready schema examples
  - Auth integration points
  - Realtime subscription examples

  ### 4. **Ultracite Integration**

  **What is Ultracite?**
  AI-optimized Biome preset that ensures consistent code generation across all AI editors.

  **Files Generated:**

  **`biome.jsonc`:**

  ```jsonc
  {
    "extends": ["ultracite/core", "ultracite/react", "ultracite/next"]
    // ... optimized rules
  }
  ```

  **`.cursorrules`:**
  Comprehensive coding guidelines for Cursor AI:

  - Code style enforcement
  - TypeScript strictness rules
  - React/Next.js best practices
  - Database query patterns
  - File naming conventions
  - AI code generation guidelines

  **`.windsurfrules`:**
  Windsurf-specific guidelines synced with Cursor rules

  **`CLAUDE.md`:**
  Quick reference for Claude Code with:

  - Project tech stack
  - Code quality commands
  - Critical rules
  - AI development guidelines

  ### 5. **Docker Support**

  **Multi-stage Dockerfile:**

  - Bun official base image
  - Optimized for production
  - Non-root user (bunuser:1001)
  - Works with Next.js and Hono APIs

  **docker-compose.yml:**

  **Single App:**

  ```yaml
  services:
    app:
      build: .
      ports:
        - "3000:3000"
    db: # If database configured
      image: postgres:16-alpine
      # ...
  ```

  **Monorepo (Full Preset):**

  ```yaml
  services:
    web: ports 3000
    platform: ports 3001
    api: ports 3002
    db: postgres/sqlite
  ```

  **`.dockerignore`:**
  Excludes unnecessary files for smaller images

  ### 6. **GitHub Actions CI/CD**

  **`.github/workflows/ci.yml`:**

  Jobs:

  1. **lint** - Biome/Ultracite linting
  2. **typecheck** - TypeScript validation
  3. **test** - Run test suite (if configured)
  4. **build** - Build application
  5. **docker** - Build Docker image (if configured)

  **`.github/workflows/deploy.yml.example`:**
  Template for deployment workflow (commented out)

  **`.github/dependabot.yml`:**

  - npm dependencies (weekly)
  - Docker images (weekly)
  - GitHub Actions (weekly)

  ### 7. **TypeScript Strictness Levels**

  **Strict Mode:**

  ```json
  {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true
  }
  ```

  **Moderate Mode:**

  ```json
  {
    "strict": true,
    "noFallthroughCasesInSwitch": true
  }
  ```

  **Loose Mode:**

  ```json
  {
    "strict": false,
    "noImplicitAny": false
  }
  ```

  Applied consistently across all presets and workspaces.

  ### 8. **Path Aliases**

  Optional `@/*` path aliases in `tsconfig.json`:

  ```typescript
  import { Button } from "@/components/ui/button";
  import { db } from "@/db";
  ```

  Can be disabled via `--no-path-aliases` flag.

  ## Breaking Changes

  **NONE** - Fully backward compatible. Old `bunkit init` command still works with sensible defaults.

  ## Technical Improvements

  ### Core (`@bunkit/core`)

  - Extended `ProjectConfig` schema with 10+ new optional fields
  - Extended `TemplateContext` to pass configuration to builders
  - All new fields use Zod validation

  ### Templates (`@bunkit/templates`)

  **New Generators:**

  - `generators/database.ts` - Database setup (PostgreSQL, Supabase, SQLite)
  - `generators/ultracite.ts` - Ultracite/Biome configuration
  - `generators/docker.ts` - Docker configuration
  - `generators/cicd.ts` - GitHub Actions workflows

  **Updated Builders:**

  - `builders/web.ts` - TypeScript strictness, Ultracite, Docker, CI/CD
  - `builders/api.ts` - Database integration, TypeScript strictness, all generators
  - `builders/full.ts` - Monorepo database package, all generators for all apps

  **Exports:**

  ```typescript
  export {
    getDatabaseDependencies,
    getCodeQualityDependencies,
  } from "@bunkit/templates";
  ```

  ### CLI (`bunkit-cli`)

  **New Command:**

  - `commands/init.enhanced.ts` - Full customization with 12 interactive prompts

  **Updated:**

  - `commands/init.real.ts` - Backward compatibility with defaults
  - `index.ts` - New CLI flags for all options

  **New CLI Flags:**

  ```
  --database <type>
  --code-quality <type>
  --ts-strictness <level>
  --ui-library <lib>
  --css-framework <framework>
  --testing <framework>
  --docker
  --cicd
  ```

  ## Bug Fixes

  - ✅ Fixed Next.js 16 TypeScript configuration warnings
    - Set `jsx: "react-jsx"` (React automatic runtime)
    - Update `include` to `.next/dev/types/**/*.ts`
  - ✅ Dynamic dependency installation based on selected options
  - ✅ Proper TypeScript strictness in all presets

  ## Dependencies

  **New:**

  - `ultracite` (optional - when selected)
  - Database drivers based on choice
  - Testing frameworks based on choice
  - UI library dependencies based on choice

  **Auto-installed based on configuration** - No manual dependency management needed.

  ## Documentation

  - `.cursorrules` - 200+ lines of AI coding guidelines
  - `.windsurfrules` - Synced rules for Windsurf
  - `CLAUDE.md` - Quick reference for Claude Code
  - `README.md` - Updated with new options
  - `.github/workflows/` - Inline comments in CI/CD files

  ## Migration Guide

  **No migration needed** - Fully backward compatible.

  To use new features:

  ```bash
  bunkit init  # Interactive mode with all new options
  ```

  Existing projects:

  ```bash
  bunkit add <feature>  # Future enhancement
  ```

  ## What's Next (v0.6.0)

  - Authentication presets (Supabase Auth, NextAuth.js, Lucia)
  - Payment integration (Stripe, LemonSqueezy)
  - Email setup (Resend, SendGrid)
  - Storage configuration (Supabase Storage, Uploadthing)
  - Deployment presets (Vercel, Railway, Fly.io)

  ***

  **Philosophy:** Bun-first, opinioned, maximum customization. No regrets. 🍞

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
