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
 * Setup Supabase only (without Drizzle ORM)
 * Includes client setup for selected features (auth, storage, realtime, etc.)
 */
export async function setupSupabaseOnly(
  projectPath: string,
  context: TemplateContext,
  isMonorepo: boolean = false
): Promise<void> {
  const dbPath = isMonorepo
    ? join(projectPath, 'packages/db')
    : join(projectPath, 'src/db');

  await ensureDirectory(dbPath);

  const features = context.supabaseFeatures || ['auth', 'storage', 'realtime', 'database'];
  const hasAuth = features.includes('auth');
  const hasStorage = features.includes('storage');
  const hasRealtime = features.includes('realtime');
  const hasEdgeFunctions = features.includes('edge-functions');
  const hasDatabase = features.includes('database');

  // Supabase client with selected features
  const clientContent = `import { createClient } from '@supabase/supabase-js';

// Supabase client
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

${hasAuth ? `// Auth helpers
export const auth = supabase.auth;` : ''}

${hasStorage ? `// Storage helpers
export const storage = supabase.storage;` : ''}

${hasRealtime ? `// Realtime helpers
export const realtime = supabase.realtime;` : ''}

${hasEdgeFunctions ? `// Edge Functions helpers
export const functions = supabase.functions;` : ''}

${hasDatabase ? `// Database helpers (using Supabase client directly)
export const db = supabase.from;` : ''}
`;

  await writeFile(join(dbPath, 'index.ts'), clientContent);

  // Example usage file
  const examplesContent = `// Supabase usage examples
import { supabase${hasAuth ? ', auth' : ''}${hasStorage ? ', storage' : ''}${hasRealtime ? ', realtime' : ''}${hasEdgeFunctions ? ', functions' : ''}${hasDatabase ? ', db' : ''} } from './index';

${hasAuth ? `// Auth example
export async function signUp(email: string, password: string) {
  const { data, error } = await auth.signUp({
    email,
    password,
  });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await auth.signOut();
  return { error };
}` : ''}

${hasStorage ? `// Storage example
export async function uploadFile(bucket: string, path: string, file: File) {
  const { data, error } = await storage.from(bucket).upload(path, file);
  return { data, error };
}

export function getPublicUrl(bucket: string, path: string) {
  const { data } = storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}` : ''}

${hasRealtime ? `// Realtime example
export function subscribeToChannel(channel: string, callback: (payload: any) => void) {
  const channelInstance = realtime.channel(channel);
  channelInstance.on('postgres_changes', { event: '*', schema: 'public', table: '*' }, callback);
  channelInstance.subscribe();
  return channelInstance;
}` : ''}

${hasEdgeFunctions ? `// Edge Functions example
export async function invokeFunction(functionName: string, body?: any) {
  const { data, error } = await functions.invoke(functionName, { body });
  return { data, error };
}` : ''}

${hasDatabase ? `// Database example (using Supabase client directly)
export async function getUsers() {
  const { data, error } = await supabase.from('users').select('*');
  return { data, error };
}` : ''}
`;

  await writeFile(join(dbPath, 'examples.ts'), examplesContent);

  // Supabase directory structure
  if (hasEdgeFunctions) {
    await ensureDirectory(join(projectPath, 'supabase/functions'));
  }

  // .env.example
  const envExample = `# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
${hasDatabase ? 'DATABASE_URL=postgresql://postgres:[password]@db.your-project.supabase.co:5432/postgres' : ''}
`;

  await writeFile(join(projectPath, '.env.example'), envExample);
}

/**
 * Setup Supabase with Drizzle ORM (PostgreSQL + Auth + Storage + Realtime + Drizzle)
 */
export async function setupSupabaseDrizzle(
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

  const features = context.supabaseFeatures || ['auth', 'storage', 'realtime', 'database'];
  const hasAuth = features.includes('auth');
  const hasStorage = features.includes('storage');
  const hasRealtime = features.includes('realtime');
  const hasEdgeFunctions = features.includes('edge-functions');
  const hasDatabase = features.includes('database');

  // Supabase client with Drizzle
  const clientContent = `import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Supabase client for auth, storage, realtime
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

${hasAuth ? `// Auth helpers
export const auth = supabase.auth;` : ''}

${hasStorage ? `// Storage helpers
export const storage = supabase.storage;` : ''}

${hasRealtime ? `// Realtime helpers
export const realtime = supabase.realtime;` : ''}

${hasEdgeFunctions ? `// Edge Functions helpers
export const functions = supabase.functions;` : ''}

// Drizzle client for type-safe database queries
${hasDatabase ? `const queryClient = postgres(process.env.DATABASE_URL!);
export const db = drizzle(queryClient, { schema });` : '// Database queries via Drizzle ORM'}
`;

  await writeFile(join(dbPath, 'index.ts'), clientContent);

  // Example usage file (similar to setupSupabaseOnly but with Drizzle)
  const examplesContent = `// Supabase + Drizzle usage examples
import { supabase${hasAuth ? ', auth' : ''}${hasStorage ? ', storage' : ''}${hasRealtime ? ', realtime' : ''}${hasEdgeFunctions ? ', functions' : ''}, db } from './index';
import { users } from './schema';
import { eq } from 'drizzle-orm';

${hasAuth ? `// Auth example
export async function signUp(email: string, password: string) {
  const { data, error } = await auth.signUp({
    email,
    password,
  });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await auth.signOut();
  return { error };
}` : ''}

${hasStorage ? `// Storage example
export async function uploadFile(bucket: string, path: string, file: File) {
  const { data, error } = await storage.from(bucket).upload(path, file);
  return { data, error };
}

export function getPublicUrl(bucket: string, path: string) {
  const { data } = storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}` : ''}

${hasRealtime ? `// Realtime example
export function subscribeToChannel(channel: string, callback: (payload: any) => void) {
  const channelInstance = realtime.channel(channel);
  channelInstance.on('postgres_changes', { event: '*', schema: 'public', table: '*' }, callback);
  channelInstance.subscribe();
  return channelInstance;
}` : ''}

${hasEdgeFunctions ? `// Edge Functions example
export async function invokeFunction(functionName: string, body?: any) {
  const { data, error } = await functions.invoke(functionName, { body });
  return { data, error };
}` : ''}

${hasDatabase ? `// Database example (using Drizzle ORM)
export async function getUsers() {
  return await db.select().from(users);
}

export async function getUserById(id: string) {
  return await db.select().from(users).where(eq(users.id, id));
}` : ''}
`;

  await writeFile(join(dbPath, 'examples.ts'), examplesContent);

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

  if (hasEdgeFunctions) {
    await ensureDirectory(join(projectPath, 'supabase/functions'));
  }

  // .env.example
  const envExample = `# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
${hasDatabase ? 'DATABASE_URL=postgresql://postgres:[password]@db.your-project.supabase.co:5432/postgres' : ''}
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
 * Returns direct versions - use catalog: only for monorepos
 */
export function getDatabaseDependencies(databaseType: string): Record<string, string> {
  switch (databaseType) {
    case 'postgres-drizzle':
      return {
        'drizzle-orm': '^0.38.0',
        'drizzle-kit': '^0.30.1',
        'postgres': '^3.4.5',
      };
    case 'supabase':
      // Supabase only (without Drizzle)
      return {
        '@supabase/supabase-js': '^2.48.1',
      };
    case 'supabase-drizzle':
      // Supabase with Drizzle ORM
      return {
        '@supabase/supabase-js': '^2.48.1',
        'drizzle-orm': '^0.38.0',
        'drizzle-kit': '^0.30.1',
        'postgres': '^3.4.5',
      };
    case 'sqlite-drizzle':
      return {
        'drizzle-orm': '^0.38.0',
        'drizzle-kit': '^0.30.1',
      };
    default:
      return {};
  }
}
