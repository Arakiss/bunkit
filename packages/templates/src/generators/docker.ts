import { join } from 'pathe';
import { writeFile, type TemplateContext } from '@bunkit/core';

/**
 * Setup Docker configuration
 */
export async function setupDocker(
  projectPath: string,
  context: TemplateContext
): Promise<void> {
  // Dockerfile for Bun
  const dockerfile = `# Use Bun official image
FROM oven/bun:1 AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

${context.preset === 'web' || context.preset === 'full' ? '# Build Next.js app\nRUN bun run build\n' : '# No build step needed for API/minimal'}
# Production image
FROM base AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 bunuser && \\
    adduser --system --uid 1001 bunuser

${context.preset === 'web' || context.preset === 'full' ? `# Copy Next.js build
COPY --from=builder --chown=bunuser:bunuser /app/.next/standalone ./
COPY --from=builder --chown=bunuser:bunuser /app/.next/static ./.next/static
COPY --from=builder --chown=bunuser:bunuser /app/public ./public
` : `# Copy application
COPY --from=builder --chown=bunuser:bunuser /app/src ./src
COPY --from=builder --chown=bunuser:bunuser /app/package.json ./package.json
`}
USER bunuser

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

${context.preset === 'web' || context.preset === 'full' ? 'CMD ["bun", "run", "start"]' : 'CMD ["bun", "run", "src/index.ts"]'}
`;

  await writeFile(join(projectPath, 'Dockerfile'), dockerfile);

  // docker-compose.yml
  const dockerCompose = `version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      ${context.database && context.database !== 'none' && context.database !== 'supabase' ? '- DATABASE_URL=${DATABASE_URL:-postgres://postgres:postgres@db:5432/${context.projectName}}' : ''}
    ${context.database && context.database !== 'none' && context.database !== 'supabase' ? 'depends_on:\n      - db' : ''}
    restart: unless-stopped

  ${context.database && context.database !== 'none' && context.database !== 'supabase' ? `db:
    image: ${context.database === 'sqlite-drizzle' ? 'alpine:latest' : 'postgres:16-alpine'}
    ${context.database !== 'sqlite-drizzle' ? `environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=${context.projectName}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"` : 'volumes:\n      - sqlite_data:/data'}
    restart: unless-stopped
` : ''}
${context.database && context.database !== 'none' && context.database !== 'supabase' ? `volumes:
  ${context.database === 'sqlite-drizzle' ? 'sqlite_data:' : 'postgres_data:'}` : ''}
`;

  await writeFile(join(projectPath, 'docker-compose.yml'), dockerCompose);

  // .dockerignore
  const dockerignore = `# Dependencies
node_modules/
bun.lock

# Build
dist/
build/
.next/
.turbo/

# Environment
.env
.env*.local

# Logs
*.log
npm-debug.log*

# OS
.DS_Store

# IDEs
.vscode/
.idea/

# Git
.git/
.gitignore

# Documentation
README.md
CLAUDE.md
.cursorrules
.windsurfrules

# Tests
*.test.ts
*.test.tsx
*.spec.ts
*.spec.tsx
coverage/
`;

  await writeFile(join(projectPath, '.dockerignore'), dockerignore);
}
