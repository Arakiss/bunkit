# @bunkit/templates

## 0.8.1

### Patch Changes

- Updated dependencies [4a9a8e8]
  - @bunkit/core@0.8.1

## 0.8.0

### Minor Changes

- 8ed1dd6: # v0.9.0 - Bun 1.3 Integration, Database Expansion & Auth Systems 🚀

  ## Major Features

  ### 🗄️ Database Expansion

  - **Prisma ORM support** - Full Prisma integration as alternative to Drizzle
    - PostgreSQL + Prisma
    - MySQL + Prisma
    - SQLite + Prisma
    - Supabase + Prisma
  - **MySQL support** - Native Bun 1.3 MySQL client
    - MySQL + Drizzle ORM
    - MySQL + Prisma ORM
  - **Redis support** - Native Bun 1.3 Redis client for caching and session storage

  ### 🔐 Authentication Systems

  - **better-auth** - Modern, flexible authentication library
    - Database adapters for Drizzle and Prisma
    - Hono integration helpers
    - Client-side React hooks
  - **NextAuth.js** - Popular Next.js authentication solution
    - Database adapters for Drizzle and Prisma
    - Next.js App Router integration
    - JWT and database session strategies

  ### ⚡ New Presets

  - **`bun-api`** - Bun.serve() native routing (zero dependencies)
  - **`bun-fullstack`** - Bun.serve() + HTML imports (React without Next.js)
  - **`bun-monorepo`** - Monorepo with Bun.serve() (no Next.js)
  - **`enterprise-monorepo`** - Enterprise monorepo with multiple Next.js apps and microservices
    - Multiple Next.js apps (platform, app)
    - Microservices architecture (service-identity)
    - Ready for complex SaaS platforms

  ### 🎯 Improved Preset Naming

  - **Clear, descriptive names** following `{framework}-{architecture}` pattern
    - `nextjs` (was `web`) - Next.js single repo
    - `hono-api` (was `api`) - Hono API single repo
    - `nextjs-monorepo` (was `full`) - Next.js + Hono monorepo
    - `bun-monorepo` (was `monorepo-bun`) - Bun.serve() monorepo
  - **Backwards compatible** - All old names work as aliases

  ### 🍽️ À la carte CLI Experience

  - **Fully interactive `bunkit init`** - 21+ configuration prompts
  - **Custom presets** - Save and reuse project configurations
    - `bunkit preset save <name>` - Save current configuration
    - `bunkit preset load <name>` - Load saved configuration
    - `bunkit preset list` - List all saved presets
    - `bunkit preset delete <name>` - Delete a preset
  - **Step-by-step configuration** - Choose exactly what you need

  ### 🛠️ Developer Experience

  - **VSCode debugging** - Complete debugging configuration
    - `launch.json` with Bun debug configurations
    - `settings.json` with recommended settings
    - `extensions.json` with recommended extensions
  - **bunfig.toml defaults** - Comprehensive Bun configuration
    - Customizable defaults with explanatory comments
    - Debugging settings
    - Performance optimizations
  - **Enhanced Hono defaults** - More middleware and utilities
    - Security middleware (CORS, rate limiting, helmet)
    - Request validation
    - Error handling patterns
    - Performance utilities

  ### 🔑 Bun.secrets Integration

  - **Secure credential management** - Use Bun.secrets API instead of .env files
  - Type-safe helpers with fallback to environment variables
  - Integration examples and documentation

  ### 📦 Dependency Management

  - **`bunkit catalog add`** - Add packages to dependency catalog
  - **`bunkit catalog sync`** - Sync catalog versions across workspaces
  - **`bunkit catalog list`** - List all packages in catalog

  ## Breaking Changes

  - None - All changes are additive and backwards compatible

  ## Migration Guide

  No migration needed - all existing projects continue to work. New features are opt-in via interactive prompts or CLI flags.

- # v0.9.0 - Bun 1.3 Integration, Database Expansion & Auth Systems 🚀

  ## Major Features

  ### 🗄️ Database Expansion

  - **Prisma ORM support** - Full Prisma integration as alternative to Drizzle
    - PostgreSQL + Prisma
    - MySQL + Prisma
    - SQLite + Prisma
    - Supabase + Prisma
  - **MySQL support** - Native Bun 1.3 MySQL client
    - MySQL + Drizzle ORM
    - MySQL + Prisma ORM
  - **Redis support** - Native Bun 1.3 Redis client for caching and session storage

  ### 🔐 Authentication Systems

  - **better-auth** - Modern, flexible authentication library
    - Database adapters for Drizzle and Prisma
    - Hono integration helpers
    - Client-side React hooks
  - **NextAuth.js** - Popular Next.js authentication solution
    - Database adapters for Drizzle and Prisma
    - Next.js App Router integration
    - JWT and database session strategies

  ### ⚡ New Presets

  - **`bun-api`** - Bun.serve() native routing (zero dependencies)
  - **`bun-fullstack`** - Bun.serve() + HTML imports (React without Next.js)
  - **`bun-monorepo`** - Monorepo with Bun.serve() (no Next.js)
  - **`enterprise-monorepo`** - Enterprise monorepo with multiple Next.js apps and microservices
    - Multiple Next.js apps (platform, app)
    - Microservices architecture (service-identity)
    - Ready for complex SaaS platforms

  ### 🎯 Improved Preset Naming

  - **Clear, descriptive names** following `{framework}-{architecture}` pattern
    - `nextjs` (was `web`) - Next.js single repo
    - `hono-api` (was `api`) - Hono API single repo
    - `nextjs-monorepo` (was `full`) - Next.js + Hono monorepo
    - `bun-monorepo` (was `monorepo-bun`) - Bun.serve() monorepo
  - **Backwards compatible** - All old names work as aliases

  ### 🍽️ À la carte CLI Experience

  - **Fully interactive `bunkit init`** - 21+ configuration prompts
  - **Custom presets** - Save and reuse project configurations
    - `bunkit preset save <name>` - Save current configuration
    - `bunkit preset load <name>` - Load saved configuration
    - `bunkit preset list` - List all saved presets
    - `bunkit preset delete <name>` - Delete a preset
  - **Step-by-step configuration** - Choose exactly what you need

  ### 🛠️ Developer Experience

  - **VSCode debugging** - Complete debugging configuration
    - `launch.json` with Bun debug configurations
    - `settings.json` with recommended settings
    - `extensions.json` with recommended extensions
  - **bunfig.toml defaults** - Comprehensive Bun configuration
    - Customizable defaults with explanatory comments
    - Debugging settings
    - Performance optimizations
  - **Enhanced Hono defaults** - More middleware and utilities
    - Security middleware (CORS, rate limiting, helmet)
    - Request validation
    - Error handling patterns
    - Performance utilities

  ### 🔑 Bun.secrets Integration

  - **Secure credential management** - Use Bun.secrets API instead of .env files
  - Type-safe helpers with fallback to environment variables
  - Integration examples and documentation

  ### 📦 Dependency Management

  - **`bunkit catalog add`** - Add packages to dependency catalog
  - **`bunkit catalog sync`** - Sync catalog versions across workspaces
  - **`bunkit catalog list`** - List all packages in catalog

  ## Breaking Changes

  - None - All changes are additive and backwards compatible

  ## Migration Guide

  No migration needed - all existing projects continue to work. New features are opt-in via interactive prompts or CLI flags.

### Patch Changes

- ef9b673: Fix Ultracite integration to follow official documentation structure. Updated preset selection logic to dynamically apply ultracite/core, ultracite/react, and ultracite/next based on project type. Fixed file paths for AI editor rules (.cursor/rules/, .windsurf/rules/, .claude/). Updated Ultracite version to 6.3.4. Corrected package.json scripts to use ultracite check and ultracite fix commands. Added preset to TemplateContext for proper configuration.
- Updated dependencies [ef9b673]
- Updated dependencies [8ed1dd6]
- Updated dependencies
  - @bunkit/core@0.8.0

## 0.7.0

### Minor Changes

- f2019f2: Major release: Supabase integration, dependency updates, and CLI improvements

  ## Supabase Integration

  - Complete Supabase integration with granular feature selection
  - New database options: `supabase` (client-only) and `supabase-drizzle` (with Drizzle ORM)
  - Supabase presets: full-stack, auth-only, database-only, and custom
  - Configurable Supabase features: auth, storage, realtime, edge-functions, database
  - Interactive CLI prompts for Supabase configuration
  - Dynamic code generation based on selected features
  - Proper Docker and CI/CD configuration for Supabase projects

  ## Dependency Updates

  - React: 19.1.0 → 19.2.0
  - Next.js: 16.0.0 → 16.0.3
  - Hono: 4.7.12 → 4.10.6
  - Drizzle ORM: 0.38.0 → 0.44.7
  - Drizzle Kit: 0.30.1 → 0.31.7
  - Supabase JS: 2.48.1 → 2.81.1
  - Tailwind CSS: 4.1.7 → 4.1.17
  - Biome: 2.3.0 → 2.3.6
  - Commander: 14.0.1 → 14.0.2
  - Postgres: 3.4.5 → 3.4.7
  - TypeScript types updated to latest versions

  ## Dependency Management

  - New `update-deps` script for automated dependency updates
  - New `check-deps` script to check for outdated dependencies
  - Documentation for keeping dependencies updated

  ## CLI Developer Experience Improvements

  - Enhanced banner with better styling, colors, and professional appearance
  - Improved progress messages with colored emojis and more descriptive context
  - Redesigned configuration summary with organized sections and visual separators
  - Enhanced final project summary with comprehensive next steps and contextual tips
  - Better error handling with troubleshooting tips and helpful suggestions
  - Improved command descriptions and help text with examples
  - Consistent visual design throughout all CLI interactions
  - Better spacing, padding, and organization of information
  - More informative hints and labels for all interactive prompts
  - Professional nomenclature improvements across all commands
  - Command aliases added (init|i, create|c, add|a)

### Patch Changes

- Updated dependencies [f2019f2]
  - @bunkit/core@0.7.0

## 0.6.0

### Minor Changes

- 8fbd579: Deep shadcn/ui integration with full customization

  Added comprehensive shadcn/ui integration with:

  - Full theme system with 5 base colors (neutral, gray, zinc, stone, slate) and OKLCH color values
  - Style options (new-york, default) configurable via CLI
  - Customizable border radius
  - Automatic installation of default components (button, card)
  - New `bunkit add component` command for adding shadcn/ui components
  - Example components and comprehensive documentation (SHADCN.md)
  - Support for both single-repo and monorepo setups
  - Interactive CLI prompts for all shadcn/ui customization options
  - CLI flags for non-interactive usage

  This provides a complete, production-ready shadcn/ui setup out of the box.

### Patch Changes

- Updated dependencies [8fbd579]
  - @bunkit/core@0.6.0

## 0.5.0

### Minor Changes

- 00ab74d: Add workspace and package management commands

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

### Patch Changes

- Updated dependencies [00ab74d]
  - @bunkit/core@0.5.0

## 0.4.2

### Patch Changes

- 59c76f1: Fix catalog dependency resolution in generated projects

  **Fixed:**

  - Add complete dependency catalog to generated monorepo root package.json
  - Fix single-repo presets (web, api) to use direct versions instead of catalog:
  - Update ultracite version from ^1.0.0 to ^6.0.1 (correct npm version)
  - Fix init.enhanced.ts to skip additional dependency installation for monorepos
  - Prevent duplicate dependencies in generated projects

  **Improved:**

  - Monorepo catalog now includes all possible dependencies:
    - Frontend: React, Next.js
    - Backend: Hono
    - Database: Drizzle ORM, Drizzle Kit, Postgres, Supabase
    - Styling: Tailwind CSS, PostCSS, Autoprefixer
    - UI: shadcn/ui dependencies (Radix, CVA, clsx, tailwind-merge, iconoir)
    - Code Quality: Biome, Ultracite
    - Testing: Vitest
    - Types: All @types packages
  - Single repos now use direct versions matching catalog
  - Database and code quality generators return direct versions

  **Tested:**

  - ✅ Full preset with SQLite + Biome: bun install successful
  - ✅ Web preset: bun install successful
  - ✅ API preset: bun install successful
  - ✅ All dependency resolution working correctly

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

- Updated dependencies [39ce898]
  - @bunkit/core@0.4.1

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

### Patch Changes

- Updated dependencies [7c17734]
  - @bunkit/core@0.4.0

## 0.3.2

### Patch Changes

- 182671a: Fix Next.js 16 TypeScript configuration warnings

  Updated tsconfig.json templates to match Next.js 16 requirements, eliminating auto-reconfiguration warnings on first `bun dev` run.

  **Changes:**

  - Set `jsx` to `"react-jsx"` (Next.js 16 uses React automatic runtime)
  - Updated `include` path to `.next/dev/types/**/*.ts` (correct development types location)

  **Impact:**
  Projects scaffolded with `web` or `full` presets now start cleanly without TypeScript reconfiguration messages.

  **Files updated:**

  - `packages/templates/src/builders/web.ts` - Standalone web preset
  - `packages/templates/src/builders/full.ts` - Monorepo web and platform apps

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
