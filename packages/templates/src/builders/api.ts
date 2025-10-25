import { join } from 'pathe';
import { writeFile, ensureDirectory, type TemplateContext } from '@bunkit/core';
import {
  setupPostgresDrizzle,
  setupSupabase,
  setupSQLiteDrizzle,
} from '../generators/database';
import { setupUltracite, setupBiome } from '../generators/ultracite';
import { setupDocker } from '../generators/docker';
import { setupGitHubActions } from '../generators/cicd';

/**
 * Build API (Hono) preset files
 */
export async function buildApiPreset(
  projectPath: string,
  context: TemplateContext
): Promise<void> {
  // Create directories
  await ensureDirectory(join(projectPath, 'src/routes'));
  await ensureDirectory(join(projectPath, 'src/middleware'));

  // src/index.ts - with database integration if configured
  const indexContent = `import { Hono } from 'hono';
import { serve } from 'bun';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
${context.database && context.database !== 'none' ? "import { db } from './db';\nimport { users } from './db/schema';\nimport { eq } from 'drizzle-orm';" : ''}

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors());

// Routes
app.get('/', (context) => {
  return context.json({
    message: 'Welcome to ${context.projectName} API 🍞',
    version: '1.0.0',
    database: '${context.database || 'none'}',
  });
});

app.get('/health', (context) => {
  return context.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

${context.database && context.database !== 'none' ? `// Database example routes
app.get('/users', async (context) => {
  try {
    const allUsers = await db.select().from(users);
    return context.json({ users: allUsers });
  } catch (error) {
    console.error('Database error:', error);
    return context.json({ error: 'Failed to fetch users' }, 500);
  }
});

app.get('/users/:id', async (context) => {
  try {
    const id = context.req.param('id');
    const user = await db.select().from(users).where(eq(users.id, id)).limit(1);

    if (!user.length) {
      return context.json({ error: 'User not found' }, 404);
    }

    return context.json({ user: user[0] });
  } catch (error) {
    console.error('Database error:', error);
    return context.json({ error: 'Failed to fetch user' }, 500);
  }
});

app.post('/users', async (context) => {
  try {
    const body = await context.req.json();
    const newUser = await db.insert(users).values(body).returning();
    return context.json({ user: newUser[0] }, 201);
  } catch (error) {
    console.error('Database error:', error);
    return context.json({ error: 'Failed to create user' }, 500);
  }
});
` : ''}
// 404 handler
app.notFound((context) => {
  return context.json({ error: 'Not found' }, 404);
});

// Error handler
app.onError((error, context) => {
  console.error(\`Error: \${error}\`);
  return context.json({ error: 'Internal server error' }, 500);
});

// Start server
serve({
  fetch: app.fetch,
  port: 3001,
  development: {
    hmr: true,
    console: true,
  },
});

console.log('🚀 ${context.projectName} API running on http://localhost:3001');
${context.database && context.database !== 'none' ? "console.log('📊 Database:', process.env.DATABASE_URL || 'Not configured');" : ''}
`;

  await writeFile(join(projectPath, 'src/index.ts'), indexContent);

  // src/routes/users.ts (example)
  const usersRouteContent = `import { Hono } from 'hono';

const users = new Hono();

users.get('/', (context) => {
  return context.json({
    users: [
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' },
    ],
  });
});

users.get('/:id', (context) => {
  const id = context.req.param('id');
  return context.json({ id, name: 'User ' + id });
});

export default users;
`;

  await writeFile(join(projectPath, 'src/routes/users.ts'), usersRouteContent);

  // tsconfig.json - configurable strictness
  const getTsCompilerOptions = () => {
    const baseOptions = {
      lib: ['ESNext'],
      target: 'ESNext',
      module: 'ESNext',
      moduleDetection: 'force',
      allowJs: true,
      moduleResolution: 'bundler',
      allowImportingTsExtensions: true,
      verbatimModuleSyntax: true,
      noEmit: true,
      skipLibCheck: true,
      types: ['bun'],
      paths: context.pathAliases ? { '@/*': ['./src/*'] } : undefined,
    };

    if (context.tsStrictness === 'strict') {
      return {
        ...baseOptions,
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true,
        noImplicitReturns: true,
      };
    }

    if (context.tsStrictness === 'moderate') {
      return {
        ...baseOptions,
        strict: true,
        noFallthroughCasesInSwitch: true,
      };
    }

    // Loose
    return {
      ...baseOptions,
      strict: false,
    };
  };

  const tsconfigContent = {
    compilerOptions: getTsCompilerOptions(),
  };

  await writeFile(
    join(projectPath, 'tsconfig.json'),
    JSON.stringify(tsconfigContent, null, 2)
  );

  // bunfig.toml
  const bunfigContent = `[install]
frozenLockfile = false

${context.testing !== 'none' ? '[test]\ncoverage = true\n' : ''}`;

  await writeFile(join(projectPath, 'bunfig.toml'), bunfigContent);

  // Setup database if configured
  if (context.database && context.database !== 'none') {
    if (context.database === 'postgres-drizzle') {
      await setupPostgresDrizzle(projectPath, context, false);
    } else if (context.database === 'supabase') {
      await setupSupabase(projectPath, context, false);
    } else if (context.database === 'sqlite-drizzle') {
      await setupSQLiteDrizzle(projectPath, context, false);
    }
  }

  // Setup code quality tools
  if (context.codeQuality === 'ultracite') {
    await setupUltracite(projectPath, context);
  } else {
    await setupBiome(projectPath, context);
  }

  // Setup Docker if requested
  if (context.docker) {
    await setupDocker(projectPath, context);
  }

  // Setup CI/CD if requested
  if (context.cicd) {
    await setupGitHubActions(projectPath, context);
  }
}
