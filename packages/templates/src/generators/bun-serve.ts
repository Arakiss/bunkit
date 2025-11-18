import { join } from 'pathe';
import { writeFile, ensureDirectory, type TemplateContext } from '@bunkit/core';

/**
 * Setup Bun.serve() native routing for API servers
 * Uses Bun's built-in routing with zero dependencies
 */
export async function setupBunServeNative(
  projectPath: string,
  context: TemplateContext,
  isMonorepo: boolean = false
): Promise<void> {
  // If isMonorepo is true, projectPath is already the app path (e.g., apps/api)
  // If false, projectPath is the root project path
  const srcPath = join(projectPath, 'src');

  const routesPath = join(srcPath, 'routes');
  const middlewarePath = join(srcPath, 'middleware');
  const utilsPath = join(srcPath, 'utils');

  await ensureDirectory(routesPath);
  await ensureDirectory(middlewarePath);
  await ensureDirectory(utilsPath);

  // Main server file with Bun.serve() native routing
  const serverContent = `import { setupRoutes } from './routes';
import { errorHandler } from './middleware/error-handler';

const server = Bun.serve({
  port: process.env.PORT || 3000,
  hostname: process.env.HOSTNAME || '0.0.0.0',
  
  routes: {
    // Health check - static response (zero allocation)
    '/health': new Response('OK', {
      headers: { 'Content-Type': 'text/plain' },
    }),
    
    '/ready': new Response('Ready', {
      headers: {
        'Content-Type': 'text/plain',
        'X-Ready': '1',
      },
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

console.log(\`🚀 Server running at \${server.url}\`);
console.log(\`📊 Active requests: \${server.pendingRequests}\`);
console.log(\`🔌 Active WebSockets: \${server.pendingWebSockets}\`);

export default server;
`;

  await writeFile(join(srcPath, 'index.ts'), serverContent);

  // Routes setup
  const routesSetupContent = `import type { BunRequest } from 'bun';
${context.database && context.database !== 'none' ? "import { db } from '../db';\nimport { users } from '../db/schema';\nimport { eq } from 'drizzle-orm';" : ''}

/**
 * Setup all API routes
 * Returns route handlers for Bun.serve() routes object
 */
export function setupRoutes() {
  return {
    // Root endpoint
    '/': () => {
      return Response.json({
        message: 'Welcome to ${context.projectName} API 🍞',
        version: '1.0.0',
        database: '${context.database || 'none'}',
        framework: 'Bun.serve() native',
      });
    },

    // API version endpoint
    '/api/version': () => {
      return Response.json({
        version: '1.0.0',
        runtime: 'Bun',
        timestamp: new Date().toISOString(),
      });
    },

${context.database && context.database !== 'none' ? `    // Database example routes
    '/api/users': {
      GET: async () => {
        try {
          const allUsers = await db.select().from(users);
          return Response.json({ users: allUsers });
        } catch (error) {
          console.error('Database error:', error);
          return Response.json({ error: 'Failed to fetch users' }, { status: 500 });
        }
      },
    },

    '/api/users/:id': async (req: BunRequest<'/api/users/:id'>) => {
      try {
        const { id } = req.params;
        const user = await db.select().from(users).where(eq(users.id, parseInt(id))).limit(1);

        if (!user.length) {
          return Response.json({ error: 'User not found' }, { status: 404 });
        }

        return Response.json({ user: user[0] });
      } catch (error) {
        console.error('Database error:', error);
        return Response.json({ error: 'Failed to fetch user' }, { status: 500 });
      }
    },` : `    // Example POST route
    '/api/example': {
      POST: async (req: Request) => {
        try {
          const body = await req.json();
          return Response.json({ 
            success: true, 
            received: body 
          }, { status: 201 });
        } catch (error) {
          return Response.json({ error: 'Invalid JSON' }, { status: 400 });
        }
      },
    },`}

    // Wildcard for unmatched API routes
    '/api/*': () => {
      return Response.json({ message: 'API endpoint not found' }, { status: 404 });
    },
  };
}
`;

  await writeFile(join(routesPath, 'index.ts'), routesSetupContent);

  // Error handler middleware
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

  // Request utilities
  const requestUtilsContent = `import type { BunRequest } from 'bun';

/**
 * Get client IP address from request
 */
export function getClientIP(req: Request, server: Bun.Server): string | null {
  const address = server.requestIP(req);
  return address?.address || null;
}

/**
 * Parse JSON body with error handling
 */
export async function parseJSON<T = unknown>(req: Request): Promise<T> {
  try {
    return await req.json();
  } catch (error) {
    throw new Error('Invalid JSON body');
  }
}

/**
 * Parse query parameters
 */
export function parseQuery(url: string): Record<string, string> {
  const query: Record<string, string> = {};
  const urlObj = new URL(url);
  
  urlObj.searchParams.forEach((value, key) => {
    query[key] = value;
  });
  
  return query;
}

/**
 * Create standardized API response
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export function successResponse<T>(data: T, status: number = 200): Response {
  return Response.json<ApiResponse<T>>(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

export function errorResponse(error: string, status: number = 400): Response {
  return Response.json<ApiResponse>(
    {
      success: false,
      error,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}
`;

  await writeFile(join(utilsPath, 'request.ts'), requestUtilsContent);

  // Middleware index
  const middlewareIndex = `export { errorHandler } from './error-handler';
`;

  await writeFile(join(middlewarePath, 'index.ts'), middlewareIndex);

  // Utils index
  const utilsIndex = `export { 
  getClientIP, 
  parseJSON, 
  parseQuery,
  successResponse,
  errorResponse,
  type ApiResponse 
} from './request';
`;

  await writeFile(join(utilsPath, 'index.ts'), utilsIndex);
}

