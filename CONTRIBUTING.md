# Contributing to bunkit 🍞

Thank you for your interest in contributing to bunkit! This guide will help you get started.

## Development Setup

### Prerequisites

- [Bun](https://bun.sh) v1.3.0 or higher (required for catalogs, isolated installs, MySQL, Redis)
- [Node.js](https://nodejs.org) v20.9.0 or higher (required for Next.js 16)
- Git

### Getting Started

```bash
# Clone the repository
git clone https://github.com/Arakiss/bunkit.git
cd bunkit

# Install dependencies
bun install

# Build all packages
bun run build

# Run the CLI locally
bun run cli -- --help
```

## Project Structure

```
bunkit/
├── packages/
│   ├── cli/          # Main CLI package (@bunkit/cli)
│   ├── core/         # Core utilities (@bunkit/core)
│   ├── templates/    # Project templates (@bunkit/templates)
│   └── generators/   # Code generators (@bunkit/generators)
├── .github/
│   └── workflows/    # CI/CD workflows
└── .changeset/       # Changesets configuration
```

## Development Workflow

### Making Changes

1. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** in the appropriate package

3. **Test your changes**:
   ```bash
   bun run build      # Build all packages
   bun run typecheck  # Type check
   bun run lint       # Lint code
   bun run format     # Format code
   ```

4. **Create a changeset** to describe your changes:
   ```bash
   bun run changeset
   ```

   This will prompt you to:
   - Select which packages are affected
   - Choose the bump type (major/minor/patch)
   - Write a summary of the changes

   Example changeset:
   ```markdown
   ---
   "@bunkit/cli": minor
   "@bunkit/core": patch
   ---

   Add new feature X to CLI and fix bug Y in core
   ```

### Changeset Guidelines

- **Major** (1.0.0) - Breaking changes that require user action
- **Minor** (0.1.0) - New features, backwards compatible
- **Patch** (0.0.1) - Bug fixes, no new features
- **Prerelease** (0.1.0-alpha.1) - Alpha/beta releases for testing

### Commit Messages

Follow conventional commits format:

```
type(scope): description

[optional body]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```bash
git commit -m "feat(cli): add new preset for SvelteKit"
git commit -m "fix(core): resolve path validation issue"
git commit -m "docs: update README with new examples"
```

## Release Process

bunkit uses **GitHub Actions + Changesets** for automated releases.

### Automated Release (Recommended)

1. **Add your changes** with a changeset (see above)

2. **Push to main** (via PR merge):
   ```bash
   git push origin your-branch
   # Create PR and merge
   ```

3. **GitHub Actions** will automatically:
   - Detect the changeset
   - Create a "Release: Version Packages" PR
   - Update package versions and CHANGELOGs

4. **Merge the release PR**:
   - GitHub Actions will automatically publish to npm ✨

### Manual Release (Emergency)

If automated release fails:

```bash
# 1. Update versions from changesets
bun run version

# 2. Commit the version bump
git add .
git commit -m "Release version packages"

# 3. Build and publish
bun run build
bun run release
```

### Semantic Versioning

We follow [SemVer 2.0.0](https://semver.org/):
- **Major** (1.0.0) - Breaking changes that require user action
- **Minor** (0.1.0) - New features, backwards compatible
- **Patch** (0.0.1) - Bug fixes, no new features
- **Prerelease** (0.1.0-alpha.1) - Alpha/beta releases for testing

## CI/CD Setup

### GitHub Actions Workflow

- **Workflow**: `.github/workflows/release.yml`
- **Triggers**: Push to `main` branch
- **Process**:
  1. Detects changesets
  2. Creates release PR with version bumps
  3. Publishes to npm on PR merge

### GitHub Secrets

The following secrets must be configured in GitHub Settings → Secrets:

- **`NPM_TOKEN`** - npm automation token for publishing
  - Create at: https://www.npmjs.com/settings/USERNAME/tokens
  - Type: "Automation" (no 2FA required)
  - Permissions: "Read and write"

### Workflow Files

- `.github/workflows/release.yml` - Automated release workflow
  - Triggers on push to `main`
  - Creates release PR or publishes packages
  - Requires `NPM_TOKEN` secret

## Keeping Dependencies Updated

bunkit maintains all dependencies at their latest stable versions. To keep dependencies up to date:

**Check for outdated dependencies:**
```bash
bun run check-deps
```

**Update all dependencies to latest versions:**
```bash
bun run update-deps
```

This will:
- Update all dependencies to their latest compatible versions
- Update the lockfile (`bun.lock`)
- Verify everything still builds correctly

**Note:** Major version updates (e.g., Zod 3 → 4, Vitest 2 → 4) are kept at stable versions to avoid breaking changes. These are updated manually after thorough testing.

## Testing

### Running Tests

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch

# Run tests for specific package
bun --filter @bunkit/core test
```

### Adding Tests

Place test files next to source files:

```
src/
├── utils.ts
└── utils.test.ts
```

## Code Quality

### Linting

We use [Biome](https://biomejs.dev/) for linting and formatting:

```bash
# Check code
bun run lint

# Fix issues automatically
bun run format
```

### Type Checking

```bash
# Check types
bun run typecheck
```

## Package Publishing

### Access Control

All packages are configured for **public access** in `.changeset/config.json`:

```json
{
  "access": "public"
}
```

### Package.json Configuration

Each package must have:

```json
{
  "name": "@bunkit/package-name",
  "version": "x.y.z",
  "description": "Package description",
  "author": "Arakiss",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/Arakiss/bunkit.git",
    "directory": "packages/package-name"
  }
}
```

## Monorepo Management

### Workspace Commands

```bash
# Install dependencies for all workspaces
bun install

# Run command in specific workspace
bun --filter @bunkit/cli dev

# Run command in all workspaces
bun run --filter './packages/*' build

# Add dependency to specific workspace
bun --filter @bunkit/cli add package-name

# Add to catalog (for shared versions)
bun add package-name  # In root
```

### Dependency Catalogs

Shared dependency versions are managed in root `package.json`:

```json
{
  "catalog": {
    "react": "^19.1.0",
    "next": "^15.5.6"
  }
}
```

Reference in workspace:

```json
{
  "dependencies": {
    "react": "catalog:"
  }
}
```

## Getting Help

- **Issues**: [GitHub Issues](https://github.com/Arakiss/bunkit/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Arakiss/bunkit/discussions)
- **Documentation**: [README.md](./README.md)

## License

By contributing to bunkit, you agree that your contributions will be licensed under the MIT License.
