---
"bunkit-cli": minor
"@bunkit/core": minor
"@bunkit/templates": minor
"@bunkit/generators": patch
---

🚀 **v0.5.0: Maximum Customization** - Transform bunkit into a fully customizable Bun project generator

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
- Path aliases (@/*)

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
  "extends": [
    "ultracite/core",
    "ultracite/react",
    "ultracite/next"
  ],
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
  db:  # If database configured
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
import { Button } from '@/components/ui/button';
import { db } from '@/db';
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
} from '@bunkit/templates';
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

---

**Philosophy:** Bun-first, opinioned, maximum customization. No regrets. 🍞
