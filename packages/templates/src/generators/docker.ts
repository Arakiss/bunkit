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
  const isSupabase = context.database === 'supabase' || context.database === 'supabase-drizzle' || context.database === 'supabase-prisma';
  const hasLocalDb = context.database && context.database !== 'none' && !isSupabase;
  const hasRedis = context.redis === true;
  
  const dockerCompose = `version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      ${hasLocalDb ? `- DATABASE_URL=postgres://postgres:postgres@db:5432/${context.projectName}` : ''}
      ${isSupabase ? `- NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
      - SUPABASE_URL=http://localhost:8000
      - SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
      - SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU` : ''}
      ${hasRedis ? '- REDIS_URL=redis://redis:6379' : ''}
    ${hasLocalDb ? 'depends_on:\n      - db' : ''}
    ${isSupabase ? 'depends_on:\n      - supabase-db\n      - supabase-auth\n      - supabase-storage\n      - supabase-realtime' : ''}
    ${hasRedis ? 'depends_on:\n      - redis' : ''}
    restart: unless-stopped
    networks:
      - ${context.projectName}-network

  ${hasLocalDb ? `db:
    image: ${context.database === 'sqlite-drizzle' ? 'alpine:latest' : context.database?.includes('mysql') ? 'mysql:8.0' : 'postgres:16-alpine'}
    ${context.database !== 'sqlite-drizzle' && !context.database?.includes('mysql') ? `environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=${context.projectName}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"` : context.database?.includes('mysql') ? `environment:
      - MYSQL_ROOT_PASSWORD=root
      - MYSQL_DATABASE=${context.projectName}
      - MYSQL_USER=app
      - MYSQL_PASSWORD=app
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"` : 'volumes:\n      - sqlite_data:/data'}
    restart: unless-stopped
    networks:
      - ${context.projectName}-network
` : ''}

  ${isSupabase ? `# Supabase Local Development Stack
  supabase-db:
    image: supabase/postgres:15.1.0.147
    ports:
      - "54322:5432"
    environment:
      POSTGRES_HOST: /var/run/postgresql
      PGPORT: 5432
      POSTGRES_PORT: 5432
      PGDATABASE: postgres
      POSTGRES_DB: postgres
      PGPASSWORD: postgres
      POSTGRES_PASSWORD: postgres
      PGUSER: postgres
      POSTGRES_USER: postgres
      JWT_SECRET: super-secret-jwt-token-with-at-least-32-characters-long
      JWT_EXP: 3600
    volumes:
      - supabase_db_data:/var/lib/postgresql/data
    restart: unless-stopped
    networks:
      - ${context.projectName}-network

  supabase-auth:
    image: supabase/gotrue:v2.99.0
    ports:
      - "9999:9999"
    environment:
      GOTRUE_API_HOST: 0.0.0.0
      GOTRUE_API_PORT: 9999
      API_EXTERNAL_URL: http://localhost:9999
      GOTRUE_DB_DRIVER: postgres
      GOTRUE_DB_DATABASE_URL: postgres://postgres:postgres@supabase-db:5432/postgres
      GOTRUE_SITE_URL: http://localhost:3000
      GOTRUE_URI_ALLOW_LIST: "*"
      GOTRUE_DISABLE_SIGNUP: "false"
      GOTRUE_JWT_SECRET: super-secret-jwt-token-with-at-least-32-characters-long
      GOTRUE_JWT_EXP: 3600
      GOTRUE_JWT_DEFAULT_GROUP_NAME: authenticated
      GOTRUE_EXTERNAL_EMAIL_ENABLED: "true"
      GOTRUE_MAILER_AUTOCONFIRM: "true"
    depends_on:
      - supabase-db
    restart: unless-stopped
    networks:
      - ${context.projectName}-network

  supabase-storage:
    image: supabase/storage-api:v1.8.0
    ports:
      - "5000:5000"
    environment:
      ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
      SERVICE_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
      POSTGREST_URL: http://supabase-rest:3000
      PGRST_JWT_SECRET: super-secret-jwt-token-with-at-least-32-characters-long
      DATABASE_URL: postgres://postgres:postgres@supabase-db:5432/postgres
      FILE_SIZE_LIMIT: 52428800
      STORAGE_BACKEND: file
      FILE_STORAGE_BACKEND_PATH: /var/lib/storage
      TENANT_ID: stub
    volumes:
      - supabase_storage_data:/var/lib/storage
    depends_on:
      - supabase-db
      - supabase-rest
    restart: unless-stopped
    networks:
      - ${context.projectName}-network

  supabase-rest:
    image: postgrest/postgrest:v12.0.1
    ports:
      - "8000:3000"
    environment:
      PGRST_DB_URI: postgres://postgres:postgres@supabase-db:5432/postgres
      PGRST_DB_SCHEMAS: public,storage,graphql_public
      PGRST_DB_ANON_ROLE: anon
      PGRST_JWT_SECRET: super-secret-jwt-token-with-at-least-32-characters-long
      PGRST_DB_USE_LEGACY_GUCS: "false"
      PGRST_APP_SETTINGS_JWT_SECRET: super-secret-jwt-token-with-at-least-32-characters-long
      PGRST_APP_SETTINGS_JWT_EXP: 3600
    depends_on:
      - supabase-db
    restart: unless-stopped
    networks:
      - ${context.projectName}-network

  supabase-realtime:
    image: supabase/realtime:v2.25.35
    ports:
      - "4000:4000"
    environment:
      PORT: 4000
      DB_HOST: supabase-db
      DB_PORT: 5432
      DB_USER: postgres
      DB_PASSWORD: postgres
      DB_NAME: postgres
      DB_AFTER_CONNECT_QUERY: 'SET search_path TO _realtime'
      DB_ENC_KEY: supabaserealtime
      API_JWT_SECRET: super-secret-jwt-token-with-at-least-32-characters-long
      FLY_ALLOC_ID: fly123
      FLY_APP_NAME: realtime
      SECRET_KEY_BASE: UpNVntn3cDxHJpq99YMc1T1AQgQpc8kfYTuRgBiYa15BLrx8etQoXz3gZv1/u2oq
      ERL_AFLAGS: -proto_dist inet_tcp
      ENABLE_TAILSCALE: "false"
      DNS_NODES: "''"
    depends_on:
      - supabase-db
    restart: unless-stopped
    networks:
      - ${context.projectName}-network

  supabase-studio:
    image: supabase/studio:20240415-0b8c736
    ports:
      - "54323:3000"
    environment:
      STUDIO_PG_META_URL: http://supabase-meta:8080
      POSTGRES_PASSWORD: postgres
      DEFAULT_ORGANIZATION_NAME: Default Organization
      DEFAULT_PROJECT_NAME: Default Project
      SUPABASE_URL: http://localhost:8000
      SUPABASE_PUBLIC_URL: http://localhost:8000
      SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
      SUPABASE_SERVICE_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
    depends_on:
      - supabase-db
      - supabase-meta
    restart: unless-stopped
    networks:
      - ${context.projectName}-network

  supabase-meta:
    image: supabase/postgres-meta:v0.80.0
    ports:
      - "8080:8080"
    environment:
      PG_META_PORT: 8080
      PG_META_DB_HOST: supabase-db
      PG_META_DB_PORT: 5432
      PG_META_DB_NAME: postgres
      PG_META_DB_USER: postgres
      PG_META_DB_PASSWORD: postgres
    depends_on:
      - supabase-db
    restart: unless-stopped
    networks:
      - ${context.projectName}-network
` : ''}

  ${hasRedis ? `redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    restart: unless-stopped
    networks:
      - ${context.projectName}-network
` : ''}

${hasLocalDb || isSupabase || hasRedis ? `volumes:
  ${hasLocalDb && !context.database?.includes('mysql') && context.database !== 'sqlite-drizzle' ? 'postgres_data:' : ''}
  ${context.database?.includes('mysql') ? 'mysql_data:' : ''}
  ${context.database === 'sqlite-drizzle' ? 'sqlite_data:' : ''}
  ${isSupabase ? `supabase_db_data:
  supabase_storage_data:` : ''}
  ${hasRedis ? 'redis_data:' : ''}

networks:
  ${context.projectName}-network:
    driver: bridge
` : ''}
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
