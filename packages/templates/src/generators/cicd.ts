import { join } from 'pathe';
import { writeFile, ensureDirectory, type TemplateContext } from '@bunkit/core';

/**
 * Setup GitHub Actions CI/CD workflow
 */
export async function setupGitHubActions(
  projectPath: string,
  context: TemplateContext
): Promise<void> {
  await ensureDirectory(join(projectPath, '.github/workflows'));

  // Main CI workflow
  const ciWorkflow = `name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    name: Lint & Format Check
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Run linter
        run: bun run lint

  typecheck:
    name: Type Check
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Type check
        run: ${context.preset === 'full' ? 'bun run --filter \'*\' typecheck' : 'bun run typecheck'}

  ${context.testing !== 'none' ? `test:
    name: Run Tests
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Run tests
        run: ${context.testing === 'bun-test' ? 'bun test' : 'bun run test'}
        ${context.database && context.database !== 'none' ? `env:
          DATABASE_URL: sqlite://test.db` : ''}
` : ''}
  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [lint, typecheck${context.testing !== 'none' ? ', test' : ''}]

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install --frozen-lockfile

      ${context.preset === 'web' || context.preset === 'full' ? `- name: Build application
        run: bun run build
        env:
          ${context.database === 'supabase' ? `NEXT_PUBLIC_SUPABASE_URL: \${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: \${{ secrets.SUPABASE_ANON_KEY }}
          ` : ''}NODE_ENV: production` : ''}

      ${context.docker ? `- name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: false
          tags: ${context.projectName}:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max` : ''}
`;

  await writeFile(join(projectPath, '.github/workflows/ci.yml'), ciWorkflow);

  // Deploy workflow (optional, commented out by default)
  const deployWorkflow = `# name: Deploy
#
# on:
#   push:
#     branches: [main]
#
# jobs:
#   deploy:
#     name: Deploy to Production
#     runs-on: ubuntu-latest
#     environment: production
#
#     steps:
#       - name: Checkout code
#         uses: actions/checkout@v4
#
#       - name: Setup Bun
#         uses: oven-sh/setup-bun@v2
#         with:
#           bun-version: latest
#
#       - name: Install dependencies
#         run: bun install --frozen-lockfile
#
#       - name: Build
#         run: bun run build
#         env:
#           NODE_ENV: production
#           ${context.database === 'supabase' ? `NEXT_PUBLIC_SUPABASE_URL: \${{ secrets.SUPABASE_URL }}
#           NEXT_PUBLIC_SUPABASE_ANON_KEY: \${{ secrets.SUPABASE_ANON_KEY }}` : ''}
#
#       # Add your deployment steps here
#       # Examples:
#       # - Deploy to Vercel
#       # - Deploy to Railway
#       # - Deploy to your own server via SSH
#       # - Push Docker image to registry
`;

  await writeFile(join(projectPath, '.github/workflows/deploy.yml.example'), deployWorkflow);

  // Dependabot config
  const dependabotConfig = `version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    reviewers:
      - "your-github-username"
    labels:
      - "dependencies"

  ${context.docker ? `- package-ecosystem: "docker"
    directory: "/"
    schedule:
      interval: "weekly"
    labels:
      - "dependencies"
      - "docker"` : ''}

  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
    labels:
      - "dependencies"
      - "ci"
`;

  await writeFile(join(projectPath, '.github/dependabot.yml'), dependabotConfig);
}
