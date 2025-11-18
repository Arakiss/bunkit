# Roadmap

## ✅ Completed Features

### Core Foundation (v0.1.0 - v0.8.0)

- ✅ **Core CLI functionality** - Beautiful interactive CLI with @clack/prompts
- ✅ **All 8 presets** - Working with clear naming (minimal, nextjs, hono-api, bun-api, bun-fullstack, nextjs-monorepo, bun-monorepo, enterprise-monorepo)
- ✅ **Beautiful interactive experience** - Colorful emoji-rich feedback
- ✅ **Automated CI/CD** - GitHub Actions workflows
- ✅ **Semantic versioning** - Changesets integration
- ✅ **Dependency catalog management** - Centralized version management
- ✅ **Workspace management** - `bunkit add workspace` command
- ✅ **Package management** - `bunkit add package` command
- ✅ **Dependency management scripts** - `update-deps`, `check-deps`
- ✅ **Enhanced CLI developer experience** - Improved visuals and messaging
- ✅ **Command aliases** - `init|i`, `create|c`, `add|a`

### Database & ORM Support (v0.5.0 - v0.9.0)

- ✅ **PostgreSQL + Drizzle** - Full Drizzle ORM integration
- ✅ **PostgreSQL + Prisma** - Full Prisma ORM integration
- ✅ **MySQL + Drizzle** - Native Bun 1.3 MySQL client with Drizzle
- ✅ **MySQL + Prisma** - Native Bun 1.3 MySQL client with Prisma
- ✅ **SQLite + Drizzle** - SQLite with Drizzle ORM
- ✅ **SQLite + Prisma** - SQLite with Prisma ORM
- ✅ **Supabase integration** - Complete Supabase support
  - Supabase client-only
  - Supabase + Drizzle ORM
  - Supabase + Prisma ORM
  - Supabase presets: full-stack, auth-only, database-only, custom
  - Configurable features: auth, storage, realtime, edge-functions, database

### Authentication Systems (v0.9.0)

- ✅ **better-auth** - Modern, flexible authentication library
  - Database adapters for Drizzle and Prisma
  - Hono integration helpers
  - Client-side React hooks
- ✅ **NextAuth.js** - Popular Next.js authentication solution
  - Database adapters for Drizzle and Prisma
  - Next.js App Router integration
  - JWT and database session strategies
- ✅ **Supabase Auth** - Built-in Supabase authentication

### Redis Support (v0.9.0)

- ✅ **Redis integration** - Native Bun 1.3 Redis client
  - Caching support
  - Session storage
  - Docker Compose setup

### New Presets (v0.9.0)

- ✅ **`bun-api`** - Bun.serve() native routing (zero dependencies)
- ✅ **`bun-fullstack`** - Bun.serve() + HTML imports (React without Next.js)
- ✅ **`bun-monorepo`** - Monorepo with Bun.serve() (no Next.js)
- ✅ **`enterprise-monorepo`** - Enterprise monorepo with multiple Next.js apps and microservices
  - Multiple Next.js apps (web, app, platform)
  - Microservices architecture (service-identity)
  - Ready for complex SaaS platforms

### Improved Preset Naming (v0.9.0)

- ✅ **Clear, descriptive names** following `{framework}-{architecture}` pattern
  - `nextjs` (was `web`) - Next.js single repo
  - `hono-api` (was `api`) - Hono API single repo
  - `nextjs-monorepo` (was `full`) - Next.js + Hono monorepo
  - `bun-monorepo` (was `monorepo-bun`) - Bun.serve() monorepo
- ✅ **Backwards compatible** - All old names work as aliases

### À la carte CLI Experience (v0.9.0)

- ✅ **Fully interactive `bunkit init`** - 21+ configuration prompts
- ✅ **Custom presets** - Save and reuse project configurations
  - `bunkit preset save <name>` - Save current configuration
  - `bunkit preset load <name>` - Load saved configuration
  - `bunkit preset list` - List all saved presets
  - `bunkit preset delete <name>` - Delete a preset
- ✅ **Step-by-step configuration** - Choose exactly what you need

### Developer Experience (v0.5.0 - v0.9.0)

- ✅ **VSCode debugging** - Complete debugging configuration
  - `launch.json` with Bun debug configurations
  - `settings.json` with recommended settings
  - `extensions.json` with recommended extensions
- ✅ **bunfig.toml defaults** - Comprehensive Bun configuration
  - Customizable defaults with explanatory comments
  - Debugging settings
  - Performance optimizations
- ✅ **Enhanced Hono defaults** - More middleware and utilities
  - Security middleware (CORS, rate limiting, helmet)
  - Request validation
  - Error handling patterns
  - Performance utilities
- ✅ **Improved Bun.serve() configuration** - Full-stack dev server features

### Bun.secrets Integration (v0.9.0)

- ✅ **Secure credential management** - Use Bun.secrets API instead of .env files
- ✅ **Type-safe helpers** - With fallback to environment variables
- ✅ **Integration examples** - Documentation and examples

### Dependency Management (v0.9.0)

- ✅ **`bunkit catalog add`** - Add packages to dependency catalog
- ✅ **`bunkit catalog sync`** - Sync catalog versions across workspaces
- ✅ **`bunkit catalog list`** - List all packages in catalog

### shadcn/ui Integration (v0.7.0)

- ✅ **Complete UI component system** - Full shadcn/ui integration
- ✅ **5 base color themes** - Neutral, gray, zinc, stone, slate with OKLCH color values
- ✅ **Style options** - new-york, default configurable via CLI
- ✅ **Customizable border radius** - Per-project customization
- ✅ **Auto-installation** - Default components (button, card)
- ✅ **`bunkit add component`** - Command for adding shadcn/ui components
- ✅ **Example components** - Comprehensive documentation

### Docker Support (v0.5.0)

- ✅ **Multi-stage Dockerfiles** - Bun official images
- ✅ **Docker Compose** - Basic setup for apps and databases
- ✅ **Production-ready** - Optimized builds

### GitHub Actions CI/CD (v0.5.0)

- ✅ **Automated workflows** - Lint, typecheck, test, build
- ✅ **Docker builds** - Automated Docker image builds
- ✅ **Release automation** - Changesets integration

### AI-Optimized Code Quality (v0.5.0)

- ✅ **Ultracite integration** - AI-optimized code quality
  - `.cursorrules` for Cursor
  - `.windsurfrules` for Windsurf
  - `CLAUDE.md` for Claude Code
- ✅ **Biome support** - Alternative code quality tool

### TypeScript Configuration (v0.5.0 - v1.0.0)

- ✅ **TypeScript strictness levels** - strict, moderate, loose
- ✅ **Shared TypeScript Tooling** (v1.0.0) - `tooling/typescript/` directory
  - `base.json` - Base TypeScript configuration
  - `nextjs.json` - Configuration for Next.js applications
  - `api.json` - Configuration for API/Hono services
  - `library.json` - Configuration for shared packages/libraries
  - All workspace `tsconfig.json` files extend from these shared configs
  - Centralized TypeScript configuration management

### Testing Framework (v0.5.0)

- ✅ **Bun Test** - Built-in testing support
- ✅ **Vitest** - Alternative testing framework option

### Enterprise Monorepo Improvements (v1.0.0)

- ✅ **Enhanced `enterprise-monorepo` preset** - Improved structure
  - `apps/web` (port 3000) - Marketing/Landing site
  - `apps/app` (port 3002) - Main SaaS product application
  - `apps/platform` (port 3001) - Admin/Dashboard
  - `apps/service-identity` (port 3003) - Identity service API
  - Better separation of concerns for enterprise SaaS platforms
- ✅ **Individual app scripts** - In all monorepos
  - `bun run dev:web` - Start web app only
  - `bun run dev:app` - Start app only
  - `bun run dev:platform` - Start platform only
  - `bun run dev:api` - Start API only
  - `bun run dev:identity` - Start identity service only
- ✅ **Improved documentation** - Updated README files in all monorepo presets

## 🔄 In Progress (v1.0.0+)

- 🔄 **Local-first development** - Docker Compose with Supabase local and Redis local
  - Supabase local development setup
  - Redis local development setup
  - Everything works locally without cloud dependencies
  - Perfect for chatbots and AI applications requiring both Supabase and Redis

## 🚀 Planned Features

### Type Safety & Advanced Features

- `bunkit add trpc` - tRPC setup for type-safe APIs
- `bunkit generate types` - Generate types from schema
- Enhanced workspace TypeScript project references
- Example projects
- Production-ready monorepo toolkit
- Full test coverage
- Complete documentation

### Functional Packages

- `@myapp/email` - Email sending package (Resend integration)
- `@myapp/logger` - Structured logging package
- `@myapp/kv` - Key-value store package (Redis wrapper)

### SaaS Integrations

- Resend integration - Email sending
- Sentry integration - Error tracking
- Stripe integration - Payments
- Other popular SaaS services

### Local Development Enhancements

- Supabase local development - Full Docker Compose setup
- Redis local development - Docker Compose integration
- MinIO local development - S3-compatible storage
- Complete local-first development experience

### Advanced Monorepo Features

- Workspace dependency graph visualization
- Build caching strategies
- Parallel build execution
- Advanced workspace management tools

---

**Last Updated**: v1.0.0
