# bunkit CLI Reference

Complete command reference for the bunkit CLI.

## Table of Contents

- [Installation](#installation)
- [Commands](#commands)
  - [init](#bunkit-init)
  - [create](#bunkit-create)
  - [add](#bunkit-add)
  - [preset](#bunkit-preset)
  - [catalog](#bunkit-catalog)
- [Options Reference](#options-reference)
- [Examples](#examples)

## Installation

### Using bunx (Recommended)

```bash
bunx bunkit-cli init
```

### Global Installation

```bash
bun add -g bunkit-cli
bunkit init
```

### Requirements

- [Bun](https://bun.sh) v1.3.0+ (required for catalogs, isolated installs, native MySQL/Redis)
- Node.js v20.9.0+ (required for Next.js 16)

---

## Commands

### `bunkit init`

**Alias:** `bunkit i`

Interactive project creation with beautiful prompts. Guides you through 21+ configuration options.

```bash
bunkit init
bunkit i                    # Short alias
```

#### Options

| Option | Description | Values |
|--------|-------------|--------|
| `--name <name>` | Project name | Any kebab-case string |
| `--preset <preset>` | Project template | See [Presets](./PRESETS.md) |
| `--database <db>` | Database configuration | `postgres-drizzle`, `postgres-prisma`, `mysql-drizzle`, `mysql-prisma`, `sqlite-drizzle`, `sqlite-prisma`, `supabase`, `supabase-drizzle`, `supabase-prisma`, `none` |
| `--auth <auth>` | Authentication system | `better-auth`, `nextauth`, `supabase`, `none` |
| `--redis` | Enable Redis cache | Flag |
| `--use-bun-secrets` | Use Bun.secrets API | Flag |
| `--supabase-preset <preset>` | Supabase preset | `full-stack`, `auth-only`, `database-only`, `custom` |
| `--supabase-features <features>` | Supabase features | Comma-separated: `auth,storage,realtime,edge-functions,database` |
| `--code-quality <tool>` | Linting/formatting | `ultracite`, `biome` |
| `--ts-strictness <level>` | TypeScript config | `strict`, `moderate`, `loose` |
| `--ui-library <library>` | UI components | `shadcn`, `none` |
| `--css-framework <framework>` | CSS approach | `tailwind`, `vanilla`, `css-modules` |
| `--shadcn-style <style>` | shadcn/ui style | `new-york`, `default` |
| `--shadcn-base-color <color>` | shadcn/ui color | `neutral`, `gray`, `zinc`, `stone`, `slate` |
| `--shadcn-radius <radius>` | Border radius | e.g., `0.5rem`, `8px` |
| `--testing <framework>` | Testing setup | `bun-test`, `vitest`, `none` |
| `--docker` | Include Docker setup | Flag |
| `--cicd` | Include GitHub Actions | Flag |
| `--no-git` | Skip git init | Flag |
| `--no-install` | Skip dependency install | Flag |
| `--non-interactive` | No prompts (requires flags) | Flag |
| `--save-preset <name>` | Save configuration | Preset name |
| `--load-preset <name>` | Load configuration | Preset name |

#### Examples

```bash
# Interactive mode (recommended)
bunkit init

# Quick with preset
bunkit init --name my-app --preset nextjs

# Full customization
bunkit init --name my-saas --preset nextjs-monorepo --database supabase --docker --cicd

# Save configuration for reuse
bunkit init --save-preset my-api-preset

# Reuse saved configuration
bunkit init --load-preset my-api-preset
```

---

### `bunkit create`

**Alias:** `bunkit c`

Quick, non-interactive project creation with sensible defaults.

```bash
bunkit create <preset> <name> [options]
bunkit c <preset> <name>    # Short alias
```

#### Arguments

| Argument | Description | Required |
|----------|-------------|----------|
| `preset` | Project template | Yes |
| `name` | Project name | Yes |

#### Options

| Option | Description |
|--------|-------------|
| `--no-git` | Skip git initialization |
| `--no-install` | Skip dependency installation |

#### Examples

```bash
bunkit create nextjs my-app
bunkit create hono-api my-api --no-git
bunkit create nextjs-monorepo my-saas --no-install

# Aliases still work
bunkit create web my-app        # Same as: bunkit create nextjs my-app
bunkit create api my-api        # Same as: bunkit create hono-api my-api
bunkit create full my-saas      # Same as: bunkit create nextjs-monorepo my-saas
```

---

### `bunkit add`

**Alias:** `bunkit a`

Add workspaces, packages, or components to existing monorepos.

```bash
bunkit add <feature> [options]
bunkit a <feature>          # Short alias
```

#### Features

##### `workspace` - Add a new app to monorepo

```bash
bunkit add workspace                              # Interactive
bunkit add workspace --name apps/admin --preset nextjs
bunkit add workspace --name apps/docs --preset nextjs
bunkit add workspace --name apps/api --preset hono
```

| Option | Description | Values |
|--------|-------------|--------|
| `--name <name>` | Workspace path | e.g., `apps/admin`, `apps/docs` |
| `--preset <preset>` | Workspace type | `nextjs`, `hono`, `library` |

##### `package` - Add a shared package to monorepo

```bash
bunkit add package                                # Interactive
bunkit add package --name @myapp/email --type library
bunkit add package --name utils --type utils
bunkit add package --name types --type types
```

| Option | Description | Values |
|--------|-------------|--------|
| `--name <name>` | Package name | e.g., `@myapp/email`, `utils` |
| `--type <type>` | Package type | `library`, `utils`, `types`, `config` |

##### `component` - Add shadcn/ui components

```bash
bunkit add component --components button,card,input
bunkit add component --all                        # Interactive browser
```

| Option | Description |
|--------|-------------|
| `--components <list>` | Comma-separated component names |
| `--all` | Show interactive component browser |

---

### `bunkit preset`

Manage custom presets for reusing project configurations.

```bash
bunkit preset <subcommand>
```

#### Subcommands

| Subcommand | Description |
|------------|-------------|
| `list` | List all saved presets |
| `delete [name]` | Delete a preset (interactive if no name) |

#### Examples

```bash
# List saved presets
bunkit preset list

# Delete a preset
bunkit preset delete my-api-preset

# Save a preset during init
bunkit init --save-preset my-custom-preset

# Use a saved preset
bunkit init --load-preset my-custom-preset
```

---

### `bunkit catalog`

**Alias:** `bunkit cat`

Manage dependency versions across monorepo workspaces using Bun's catalog feature.

```bash
bunkit catalog <subcommand>
bunkit cat <subcommand>     # Short alias
```

#### Subcommands

##### `add <package> [version]` - Add package to catalog

```bash
bunkit catalog add                    # Interactive
bunkit catalog add zod ^3.24.1
bunkit catalog add hono ^4.11.1
bunkit catalog add @prisma/client latest
```

##### `sync` - Sync catalog across workspaces

Updates all workspace `package.json` files to use `catalog:` for packages in the catalog.

```bash
bunkit catalog sync
```

##### `list` - List catalog contents

```bash
bunkit catalog list
```

#### How It Works

1. **Define versions in root `package.json`:**
   ```json
   {
     "catalog": {
       "react": "^19.2.3",
       "hono": "^4.11.1"
     }
   }
   ```

2. **Reference in workspace `package.json`:**
   ```json
   {
     "dependencies": {
       "react": "catalog:",
       "hono": "catalog:"
     }
   }
   ```

3. **Keep in sync:**
   ```bash
   bunkit catalog sync
   bun install
   ```

---

## Options Reference

### Global Options

These options work with most commands:

| Option | Description |
|--------|-------------|
| `--help`, `-h` | Show help for command |
| `--version`, `-v` | Show CLI version |

### Database Options

| Value | Description |
|-------|-------------|
| `postgres-drizzle` | PostgreSQL with Drizzle ORM |
| `postgres-prisma` | PostgreSQL with Prisma ORM |
| `mysql-drizzle` | MySQL with Drizzle ORM (Bun 1.3 native) |
| `mysql-prisma` | MySQL with Prisma ORM |
| `sqlite-drizzle` | SQLite with Drizzle ORM |
| `sqlite-prisma` | SQLite with Prisma ORM |
| `supabase` | Supabase client only |
| `supabase-drizzle` | Supabase with Drizzle ORM |
| `supabase-prisma` | Supabase with Prisma ORM |
| `none` | No database |

### Authentication Options

| Value | Description |
|-------|-------------|
| `better-auth` | Modern, flexible auth library |
| `nextauth` | NextAuth.js for Next.js |
| `supabase` | Supabase built-in auth |
| `none` | No authentication |

### Code Quality Options

| Value | Description |
|-------|-------------|
| `ultracite` | AI-optimized linting (Cursor, Windsurf, Claude Code) |
| `biome` | Fast linting + formatting |

### TypeScript Strictness

| Value | Description |
|-------|-------------|
| `strict` | Full strict mode (recommended) |
| `moderate` | Balanced strictness |
| `loose` | Minimal type checking |

---

## Examples

### Quick Start Examples

```bash
# Create a Next.js app
bunkit create nextjs my-app

# Create an API server
bunkit create hono-api my-api

# Create a full-stack monorepo
bunkit create nextjs-monorepo my-saas

# Create with all the bells and whistles
bunkit init --name my-platform \
  --preset enterprise-monorepo \
  --database supabase-drizzle \
  --auth better-auth \
  --redis \
  --docker \
  --cicd
```

### Monorepo Management Examples

```bash
# Start with a monorepo
bunkit create nextjs-monorepo my-saas
cd my-saas

# Add an admin dashboard
bunkit add workspace --name apps/admin --preset nextjs

# Add shared email package
bunkit add package --name @myapp/email --type library

# Add UI components
bunkit add component --components button,card,input,dialog

# Manage dependencies
bunkit catalog add lodash ^4.17.21
bunkit catalog sync
bun install
```

### Custom Preset Workflow

```bash
# Create and save a custom configuration
bunkit init --save-preset my-api-stack

# Later, reuse it
bunkit init --load-preset my-api-stack --name new-api

# List your presets
bunkit preset list

# Clean up old presets
bunkit preset delete old-preset
```

---

## Environment Variables

bunkit respects these environment variables:

| Variable | Description |
|----------|-------------|
| `BUNKIT_NO_COLOR` | Disable colored output |
| `BUNKIT_DEBUG` | Enable debug logging |

---

## Troubleshooting

### Common Issues

**"catalog: not resolved"**
- Run `bun install` after adding catalog entries
- Ensure you're using Bun 1.3+

**"Cannot find module"**
- Run `bunkit catalog sync` to update workspace references
- Run `bun install` to update lockfile

**shadcn/ui components not working**
- Ensure Tailwind CSS is configured
- Check that `components.json` exists in the workspace

---

[Back to README](../README.md) | [Presets Reference](./PRESETS.md)
