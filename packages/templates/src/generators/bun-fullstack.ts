import { ensureDirectory, type TemplateContext, writeFile } from '@bunkit/core';
import { join } from 'pathe';

/**
 * Setup Bun.serve() full-stack application with HTML imports
 * Uses Bun's native HTML imports for frontend bundling
 */
export async function setupBunFullstack(
  projectPath: string,
  context: TemplateContext
): Promise<void> {
  const srcPath = join(projectPath, 'src');
  const publicPath = join(projectPath, 'public');
  const appPath = join(srcPath, 'app');

  await ensureDirectory(srcPath);
  await ensureDirectory(publicPath);
  await ensureDirectory(appPath);

  // Main server file with HTML imports
  const serverContent = `import indexHTML from './app/index.html';
import { setupRoutes } from './routes';
import { errorHandler } from './middleware/error-handler';

const server = Bun.serve({
  port: process.env.PORT || 3000,
  hostname: process.env.HOSTNAME || '0.0.0.0',
  
  routes: {
    // Serve the main HTML app (Bun will handle bundling)
    '/': indexHTML,

    // Health check
    '/health': new Response('OK', {
      headers: { 'Content-Type': 'text/plain' },
    }),

    // API routes
    ...setupRoutes(),
  },

  // Fallback for unmatched routes
  fetch(req, server) {
    return new Response('Not Found', { status: 404 });
  },

  // Error handler
  error(error) {
    return errorHandler(error);
  },
});

console.log(\`🚀 Full-stack server running at \${server.url}\`);
console.log(\`📊 Active requests: \${server.pendingRequests}\`);

export default server;
`;

  await writeFile(join(srcPath, 'index.ts'), serverContent);

  // HTML entry point with React/TypeScript
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${context.projectName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="./client.tsx"></script>
</body>
</html>
`;

  await writeFile(join(appPath, 'index.html'), htmlContent);

  // React client entry point
  const clientContent = `import React from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  const [count, setCount] = React.useState(0);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to ${context.projectName} 🍞
        </h1>
        <p className="text-gray-600 mb-8">
          Built with Bun.serve() + HTML imports
        </p>
        <div className="space-y-4">
          <button
            onClick={() => setCount(count + 1)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Count: {count}
          </button>
          <div className="text-sm text-gray-500">
            Hot Module Replacement (HMR) enabled with \`bun --hot\`
          </div>
        </div>
      </div>
    </div>
  );
}

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<App />);
}
`;

  await writeFile(join(appPath, 'client.tsx'), clientContent);

  // Routes setup
  const routesPath = join(srcPath, 'routes');
  await ensureDirectory(routesPath);

  const routesContent = `import type { BunRequest } from 'bun';
${context.database && context.database !== 'none' ? "import { db } from '../db';\nimport { users } from '../db/schema';\nimport { eq } from 'drizzle-orm';" : ''}

/**
 * Setup all API routes
 */
export function setupRoutes() {
  return {
    '/api/version': () => {
      return Response.json({
        version: '1.0.0',
        runtime: 'Bun',
        framework: 'Bun.serve() + HTML imports',
        timestamp: new Date().toISOString(),
      });
    },

${
  context.database && context.database !== 'none'
    ? `    '/api/users': {
      GET: async () => {
        try {
          const allUsers = await db.select().from(users);
          return Response.json({ users: allUsers });
        } catch (error) {
          console.error('Database error:', error);
          return Response.json({ error: 'Failed to fetch users' }, { status: 500 });
        }
      },
    },`
    : `    '/api/example': {
      GET: () => Response.json({ message: 'Hello from API!' }),
      POST: async (req: Request) => {
        const body = await req.json();
        return Response.json({ received: body }, { status: 201 });
      },
    },`
}

    '/api/*': () => {
      return Response.json({ message: 'API endpoint not found' }, { status: 404 });
    },
  };
}
`;

  await writeFile(join(routesPath, 'index.ts'), routesContent);

  // Error handler
  const middlewarePath = join(srcPath, 'middleware');
  await ensureDirectory(middlewarePath);

  const errorHandlerContent = `/**
 * Global error handler for Bun.serve()
 */
export function errorHandler(error: Error): Response {
  console.error('[Server Error]', {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });

  const isDevelopment = process.env.NODE_ENV === 'development';

  return Response.json(
    {
      error: isDevelopment ? error.message : 'Internal server error',
      ...(isDevelopment && { stack: error.stack }),
      timestamp: new Date().toISOString(),
    },
    { status: 500 }
  );
}
`;

  await writeFile(join(middlewarePath, 'error-handler.ts'), errorHandlerContent);

  // Package.json scripts need to be updated by the builder
  // This generator just creates the structure
}
