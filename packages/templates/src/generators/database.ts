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
 * Setup Supabase with Prisma ORM
 */
export async function setupSupabasePrisma(
  projectPath: string,
  context: TemplateContext,
  isMonorepo: boolean = false
): Promise<void> {
  const dbPath = isMonorepo
    ? join(projectPath, 'packages/db')
    : join(projectPath, 'prisma');

  await ensureDirectory(dbPath);

  const features = context.supabaseFeatures || ['auth', 'storage', 'realtime', 'database'];
  const hasAuth = features.includes('auth');
  const hasStorage = features.includes('storage');
  const hasRealtime = features.includes('realtime');
  const hasEdgeFunctions = features.includes('edge-functions');
  const hasDatabase = features.includes('database');

  // Prisma schema for Supabase PostgreSQL
  const prismaSchema = `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("users")
}
`;

  await writeFile(join(dbPath, 'schema.prisma'), prismaSchema);

  // Supabase client + Prisma wrapper
  const clientContent = `import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';

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

// Prisma client for type-safe database queries
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
`;

  const clientPath = isMonorepo
    ? join(projectPath, 'packages/db/src')
    : join(projectPath, 'src/db');

  await ensureDirectory(clientPath);
  await writeFile(join(clientPath, 'index.ts'), clientContent);

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
 * Setup PostgreSQL + Prisma ORM
 */
export async function setupPostgresPrisma(
  projectPath: string,
  context: TemplateContext,
  isMonorepo: boolean = false
): Promise<void> {
  const dbPath = isMonorepo
    ? join(projectPath, 'packages/db')
    : join(projectPath, 'prisma');

  await ensureDirectory(dbPath);

  // Prisma schema
  const prismaSchema = `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("users")
}
`;

  await writeFile(join(dbPath, 'schema.prisma'), prismaSchema);

  // Prisma client wrapper
  const clientContent = `import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
`;

  const clientPath = isMonorepo
    ? join(projectPath, 'packages/db/src')
    : join(projectPath, 'src/db');

  await ensureDirectory(clientPath);
  await writeFile(join(clientPath, 'index.ts'), clientContent);

  // .env.example
  const envExample = `# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/${context.projectName}
`;

  await writeFile(join(projectPath, '.env.example'), envExample);
}

/**
 * Setup MySQL + Prisma ORM
 */
export async function setupMySQLPrisma(
  projectPath: string,
  context: TemplateContext,
  isMonorepo: boolean = false
): Promise<void> {
  const dbPath = isMonorepo
    ? join(projectPath, 'packages/db')
    : join(projectPath, 'prisma');

  await ensureDirectory(dbPath);

  // Prisma schema
  const prismaSchema = `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique @db.VarChar(255)
  name      String?  @db.VarChar(255)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("users")
}
`;

  await writeFile(join(dbPath, 'schema.prisma'), prismaSchema);

  // Prisma client wrapper
  const clientContent = `import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
`;

  const clientPath = isMonorepo
    ? join(projectPath, 'packages/db/src')
    : join(projectPath, 'src/db');

  await ensureDirectory(clientPath);
  await writeFile(join(clientPath, 'index.ts'), clientContent);

  // .env.example
  const envExample = `# Database
DATABASE_URL=mysql://root:password@localhost:3306/${context.projectName}
`;

  await writeFile(join(projectPath, '.env.example'), envExample);
}

/**
 * Setup MySQL + Drizzle ORM (using Bun native MySQL client)
 */
export async function setupMySQLDrizzle(
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
  dialect: 'mysql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
`;

  await writeFile(
    join(isMonorepo ? join(projectPath, 'packages/db') : projectPath, 'drizzle.config.ts'),
    drizzleConfig
  );

  // Database client using MySQL connection URL (compatible with Drizzle)
  // Note: Drizzle ORM for MySQL uses mysql2 driver, but we can use connection URL
  const clientContent = `import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

// Create MySQL connection pool
const connection = mysql.createPool({
  uri: process.env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const db = drizzle(connection, { schema, mode: 'default' });
`;

  await writeFile(join(dbPath, 'index.ts'), clientContent);

  // Example schema
  const schemaContent = `import { mysqlTable, varchar, timestamp, char } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: char('id', { length: 36 }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});
`;

  await writeFile(join(dbPath, 'schema/index.ts'), schemaContent);

  // .env.example
  const envExample = `# Database
DATABASE_URL=mysql://root:password@localhost:3306/${context.projectName}
# Or use individual connection parameters:
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=${context.projectName}
`;

  await writeFile(join(projectPath, '.env.example'), envExample);
}

/**
 * Setup SQLite + Prisma ORM
 */
export async function setupSQLitePrisma(
  projectPath: string,
  context: TemplateContext,
  isMonorepo: boolean = false
): Promise<void> {
  const dbPath = isMonorepo
    ? join(projectPath, 'packages/db')
    : join(projectPath, 'prisma');

  await ensureDirectory(dbPath);

  // Prisma schema
  const prismaSchema = `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("users")
}
`;

  await writeFile(join(dbPath, 'schema.prisma'), prismaSchema);

  // Prisma client wrapper
  const clientContent = `import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
`;

  const clientPath = isMonorepo
    ? join(projectPath, 'packages/db/src')
    : join(projectPath, 'src/db');

  await ensureDirectory(clientPath);
  await writeFile(join(clientPath, 'index.ts'), clientContent);

  // .env.example
  const envExample = `# Database
DATABASE_URL="file:./dev.db"
`;

  await writeFile(join(projectPath, '.env.example'), envExample);

  // .gitignore entry for local.db
  const gitignoreAddition = `\n# SQLite
*.db
*.db-shm
*.db-wal
`;

  await writeFile(join(projectPath, '.gitignore.db'), gitignoreAddition);
}

/**
 * Setup Redis (using Bun native Redis client)
 */
export async function setupRedis(
  projectPath: string,
  context: TemplateContext,
  isMonorepo: boolean = false
): Promise<void> {
  const redisPath = isMonorepo
    ? join(projectPath, 'packages/redis')
    : join(projectPath, 'src/redis');

  await ensureDirectory(redisPath);

  // Redis client wrapper
  const clientContent = `import { Redis } from 'bun:redis';

// Redis client configuration
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
});

export default redis;

// Helper functions
export async function get(key: string): Promise<string | null> {
  return await redis.get(key);
}

export async function set(key: string, value: string, ttl?: number): Promise<void> {
  if (ttl) {
    await redis.set(key, value, { EX: ttl });
  } else {
    await redis.set(key, value);
  }
}

export async function del(key: string): Promise<void> {
  await redis.del(key);
}

export async function exists(key: string): Promise<boolean> {
  return (await redis.exists(key)) === 1;
}

// Cache helper
export async function cache<T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  const cached = await get(key);
  if (cached) {
    return JSON.parse(cached) as T;
  }

  const result = await fn();
  await set(key, JSON.stringify(result), ttl);
  return result;
}
`;

  await writeFile(join(redisPath, 'index.ts'), clientContent);

  // Example usage
  const examplesContent = `// Redis usage examples
import redis, { get, set, del, exists, cache } from './index';

// Basic operations
export async function exampleBasic() {
  await set('user:1', JSON.stringify({ name: 'John', email: 'john@example.com' }));
  const user = await get('user:1');
  console.log('User:', user);
}

// With TTL (time to live)
export async function exampleWithTTL() {
  await set('session:abc123', 'user-id-123', 3600); // Expires in 1 hour
}

// Cache pattern
export async function exampleCache() {
  const expensiveData = await cache(
    'expensive:data',
    async () => {
      // Expensive operation
      return { data: 'expensive result' };
    },
    3600 // Cache for 1 hour
  );
}

// Delete
export async function exampleDelete() {
  await del('user:1');
}

// Check existence
export async function exampleExists() {
  const hasKey = await exists('user:1');
  console.log('Key exists:', hasKey);
}
`;

  await writeFile(join(redisPath, 'examples.ts'), examplesContent);

  // .env.example addition
  const envExample = `# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
`;

  // Note: In actual implementation, append to existing .env.example
  await writeFile(join(projectPath, '.env.example.redis'), envExample);
}

/**
 * Get database-specific package dependencies
 * Returns direct versions - use catalog: only for monorepos
 */
export function getDatabaseDependencies(databaseType: string): Record<string, string> {
  switch (databaseType) {
    case 'postgres-drizzle':
      return {
        'drizzle-orm': '^0.44.7',
        'drizzle-kit': '^0.31.7',
        'postgres': '^3.4.7',
      };
    case 'postgres-prisma':
      return {
        '@prisma/client': '^6.19.0',
        'prisma': '^6.19.0',
      };
    case 'mysql-drizzle':
      return {
        'drizzle-orm': '^0.44.7',
        'drizzle-kit': '^0.31.7',
        'mysql2': '^3.11.5',
      };
    case 'mysql-prisma':
      return {
        '@prisma/client': '^6.19.0',
        'prisma': '^6.19.0',
      };
    case 'supabase':
      // Supabase only (without Drizzle)
      return {
        '@supabase/supabase-js': '^2.81.1',
      };
    case 'supabase-drizzle':
      // Supabase with Drizzle ORM
      return {
        '@supabase/supabase-js': '^2.81.1',
        'drizzle-orm': '^0.44.7',
        'drizzle-kit': '^0.31.7',
        'postgres': '^3.4.7',
      };
    case 'supabase-prisma':
      // Supabase with Prisma ORM
      return {
        '@supabase/supabase-js': '^2.81.1',
        '@prisma/client': '^6.19.0',
        'prisma': '^6.19.0',
      };
    case 'sqlite-drizzle':
      return {
        'drizzle-orm': '^0.44.7',
        'drizzle-kit': '^0.31.7',
      };
    case 'sqlite-prisma':
      return {
        '@prisma/client': '^6.19.0',
        'prisma': '^6.19.0',
      };
    default:
      return {};
  }
}
