import { join } from 'pathe';
import { writeFile, ensureDirectory, type TemplateContext } from '@bunkit/core';

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

  // src/index.ts
  const indexContent = `import { Hono } from 'hono';
import { serve } from 'bun';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors());

// Routes
app.get('/', (context) => {
  return context.json({
    message: 'Welcome to ${context.projectName} API 🍞',
    version: '1.0.0',
  });
});

app.get('/health', (context) => {
  return context.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

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

console.log('🚀 API running on http://localhost:3001');
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

  // tsconfig.json
  const tsconfigContent = {
    compilerOptions: {
      lib: ['ESNext'],
      target: 'ESNext',
      module: 'ESNext',
      moduleDetection: 'force',
      allowJs: true,
      moduleResolution: 'bundler',
      allowImportingTsExtensions: true,
      verbatimModuleSyntax: true,
      noEmit: true,
      strict: true,
      skipLibCheck: true,
      noFallthroughCasesInSwitch: true,
      types: ['bun-types'],
    },
  };

  await writeFile(
    join(projectPath, 'tsconfig.json'),
    JSON.stringify(tsconfigContent, null, 2)
  );

  // bunfig.toml
  const bunfigContent = `[install]
frozenLockfile = false

[test]
coverage = true
`;

  await writeFile(join(projectPath, 'bunfig.toml'), bunfigContent);
}
