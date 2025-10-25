import { join } from 'pathe';
import { writeFile, ensureDirectory, type TemplateContext } from '@bunkit/core';

/**
 * Setup PostgreSQL + Drizzle ORM
 */
export async function setupPostgresDrizzle(
  projectPath: string,
  context: TemplateContext,
  isMonorepo: boolean = false
): Promise<void> {
  const dbPath = isMonorepo
    ? join(projectPath, 'packages/db')
    : join(projectPath, 'src/db');

  await ensureDirectory(join(dbPath, 'schema'));

  // Drizzle config
  const drizzleConfig = `import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
`;

  await writeFile(
    join(isMonorepo ? join(projectPath, 'packages/db') : projectPath, 'drizzle.config.ts'),
    drizzleConfig
  );

  // Database client
  const clientContent = `import { drizzle } from 'drizzle-orm/bun-postgres';
import { Database } from 'bun:postgres';
import * as schema from './schema';

const client = new Database(process.env.DATABASE_URL!);
export const db = drizzle(client, { schema });
`;

  await writeFile(join(dbPath, 'index.ts'), clientContent);

  // Example schema
  const schemaContent = `import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
`;

  await writeFile(join(dbPath, 'schema/index.ts'), schemaContent);

  // Package.json dependencies (will be added by caller)
  // Required: drizzle-orm, drizzle-kit

  // .env.example
  const envExample = `# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/${context.projectName}
`;

  await writeFile(join(projectPath, '.env.example'), envExample);
}

/**
 * Setup Supabase (PostgreSQL + Auth + Storage + Realtime)
 */
export async function setupSupabase(
  projectPath: string,
  context: TemplateContext,
  isMonorepo: boolean = false
): Promise<void> {
  const dbPath = isMonorepo
    ? join(projectPath, 'packages/db')
    : join(projectPath, 'src/db');

  await ensureDirectory(join(dbPath, 'schema'));

  // Drizzle config for Supabase
  const drizzleConfig = `import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './supabase/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
`;

  await writeFile(
    join(isMonorepo ? join(projectPath, 'packages/db') : projectPath, 'drizzle.config.ts'),
    drizzleConfig
  );

  // Supabase client
  const clientContent = `import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Supabase client for auth, storage, realtime
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Drizzle client for type-safe database queries
const queryClient = postgres(process.env.DATABASE_URL!);
export const db = drizzle(queryClient, { schema });
`;

  await writeFile(join(dbPath, 'index.ts'), clientContent);

  // Example schema with RLS
  const schemaContent = `import { pgTable, text, timestamp, uuid, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().references(() => users.id),
  username: text('username').unique(),
  bio: text('bio'),
  website: text('website'),
  isPublic: boolean('is_public').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
`;

  await writeFile(join(dbPath, 'schema/index.ts'), schemaContent);

  // Supabase directory structure
  await ensureDirectory(join(projectPath, 'supabase/migrations'));

  // .env.example
  const envExample = `# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=postgresql://postgres:[password]@db.your-project.supabase.co:5432/postgres
`;

  await writeFile(join(projectPath, '.env.example'), envExample);
}

/**
 * Setup SQLite + Drizzle ORM
 */
export async function setupSQLiteDrizzle(
  projectPath: string,
  context: TemplateContext,
  isMonorepo: boolean = false
): Promise<void> {
  const dbPath = isMonorepo
    ? join(projectPath, 'packages/db')
    : join(projectPath, 'src/db');

  await ensureDirectory(join(dbPath, 'schema'));

  // Drizzle config
  const drizzleConfig = `import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL || './local.db',
  },
});
`;

  await writeFile(
    join(isMonorepo ? join(projectPath, 'packages/db') : projectPath, 'drizzle.config.ts'),
    drizzleConfig
  );

  // Database client
  const clientContent = `import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import * as schema from './schema';

const sqlite = new Database(process.env.DATABASE_URL || './local.db');
export const db = drizzle(sqlite, { schema });
`;

  await writeFile(join(dbPath, 'index.ts'), clientContent);

  // Example schema
  const schemaContent = `import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql\`(unixepoch())\`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql\`(unixepoch())\`).notNull(),
});
`;

  await writeFile(join(dbPath, 'schema/index.ts'), schemaContent);

  // .env.example
  const envExample = `# Database
DATABASE_URL=./local.db
`;

  await writeFile(join(projectPath, '.env.example'), envExample);

  // .gitignore entry for local.db
  const gitignoreAddition = `\n# SQLite
*.db
*.db-shm
*.db-wal
`;

  // Note: In actual implementation, append to existing .gitignore
  await writeFile(join(projectPath, '.gitignore.db'), gitignoreAddition);
}

/**
 * Get database-specific package dependencies
 */
export function getDatabaseDependencies(databaseType: string): string[] {
  switch (databaseType) {
    case 'postgres-drizzle':
      return ['drizzle-orm', 'drizzle-kit'];
    case 'supabase':
      return ['@supabase/supabase-js', 'drizzle-orm', 'drizzle-kit', 'postgres'];
    case 'sqlite-drizzle':
      return ['drizzle-orm', 'drizzle-kit'];
    default:
      return [];
  }
}
