import { ensureDirectory, type TemplateContext, writeFile } from '@bunkit/core';
import { join } from 'pathe';

/**
 * Setup Better Auth
 * Framework-agnostic authentication library with Bun/Hono support
 */
export async function setupBetterAuth(
  projectPath: string,
  context: TemplateContext,
  isMonorepo: boolean = false
): Promise<void> {
  const authPath = isMonorepo ? join(projectPath, 'packages/auth') : join(projectPath, 'src/auth');

  await ensureDirectory(authPath);

  // Determine database adapter based on context.database
  const dbAdapter = getBetterAuthAdapter(context.database);

  // Better Auth configuration
  const authConfig = `import { betterAuth } from 'better-auth';
${dbAdapter.imports}

export const auth = betterAuth({
  database: ${dbAdapter.config},
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  basePath: '/api/auth',
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production
  },
  socialProviders: {
    // Uncomment and configure providers as needed
    // google: {
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // },
    // github: {
    //   clientId: process.env.GITHUB_CLIENT_ID!,
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    // },
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
`;

  await writeFile(join(authPath, 'index.ts'), authConfig);

  // Hono integration helper
  const honoHelper = `import { Hono } from 'hono';
import { auth } from './index';

/**
 * Mount Better Auth handler to Hono app
 * Usage: app.on(['POST', 'GET'], '/api/auth/*', betterAuthHandler);
 */
export function betterAuthHandler(c: any) {
  return auth.handler(c.req.raw);
}

/**
 * Helper to get session from request
 */
export async function getSession(request: Request) {
  return await auth.api.getSession({ headers: request.headers });
}
`;

  await writeFile(join(authPath, 'hono.ts'), honoHelper);

  // Client-side helper (for Next.js or React apps)
  const clientHelper = `import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000',
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;
`;

  const clientPath = isMonorepo
    ? join(projectPath, 'packages/auth/client')
    : join(authPath, 'client');

  await ensureDirectory(clientPath);
  await writeFile(join(clientPath, 'index.ts'), clientHelper);

  // Example usage
  const examplesContent = `// Better Auth usage examples
import { auth } from './index';
import { getSession } from './hono';

// Server-side: Get session
export async function getCurrentUser(request: Request) {
  const session = await getSession(request);
  return session?.user || null;
}

// Server-side: Protected route example
export async function protectedRoute(request: Request) {
  const session = await getSession(request);
  
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  return new Response(\`Hello, \${session.user.email}!\`);
}

// Client-side (React/Next.js): Use hooks
// import { useSession, signIn, signOut } from './client';
// 
// function MyComponent() {
//   const { data: session } = useSession();
//   
//   if (session) {
//     return <div>Welcome, {session.user.email}</div>;
//   }
//   
//   return <button onClick={() => signIn.email({ email: '...', password: '...' })}>Sign In</button>;
// }
`;

  await writeFile(join(authPath, 'examples.ts'), examplesContent);

  // .env.example addition
  const envExample = `# Better Auth
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-secret-key-here-change-in-production
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000

# Social Providers (optional)
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=
# GITHUB_CLIENT_ID=
# GITHUB_CLIENT_SECRET=
`;

  await writeFile(join(projectPath, '.env.example.auth'), envExample);
}

/**
 * Setup NextAuth.js (Auth.js)
 * Note: NextAuth is primarily designed for Next.js, but can work with other frameworks
 */
export async function setupNextAuth(
  projectPath: string,
  context: TemplateContext,
  isMonorepo: boolean = false
): Promise<void> {
  const authPath = isMonorepo ? join(projectPath, 'packages/auth') : join(projectPath, 'src/auth');

  await ensureDirectory(authPath);

  // Determine database adapter based on context.database
  const dbAdapter = getNextAuthAdapter(context.database);

  // NextAuth configuration
  const authConfig = `import NextAuth from 'next-auth';
${dbAdapter.imports}
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: ${dbAdapter.config},
  providers: [
    // Email/Password provider
    // Credentials({
    //   credentials: {
    //     email: { label: 'Email', type: 'email' },
    //     password: { label: 'Password', type: 'password' },
    //   },
    //   async authorize(credentials) {
    //     // Implement your authorization logic
    //     return null;
    //   },
    // }),
    
    // Social providers (uncomment and configure as needed)
    // Google({
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // }),
    // GitHub({
    //   clientId: process.env.GITHUB_CLIENT_ID!,
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    // }),
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  callbacks: {
    async session({ session, token }) {
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  session: {
    strategy: 'jwt', // or 'database' if using database adapter
  },
});
`;

  await writeFile(join(authPath, 'index.ts'), authConfig);

  // API route handler (for Next.js App Router)
  const apiRoute = `import { handlers } from '../auth';

export const { GET, POST } = handlers;
`;

  const apiPath = isMonorepo
    ? join(projectPath, 'apps/web/src/app/api/auth/[...nextauth]')
    : join(projectPath, 'src/app/api/auth/[...nextauth]');

  await ensureDirectory(apiPath);
  await writeFile(join(apiPath, 'route.ts'), apiRoute);

  // Example usage
  const examplesContent = `// NextAuth usage examples
import { auth, signIn, signOut } from './index';

// Server-side: Get session
export async function getCurrentUser() {
  const session = await auth();
  return session?.user || null;
}

// Server-side: Protected route example
export async function protectedRoute() {
  const session = await auth();
  
  if (!session) {
    return { error: 'Unauthorized', status: 401 };
  }
  
  return { message: \`Hello, \${session.user.email}!\` };
}

// Client-side: Use in components
// import { signIn, signOut, useSession } from 'next-auth/react';
// 
// function MyComponent() {
//   const { data: session } = useSession();
//   
//   if (session) {
//     return <div>Welcome, {session.user.email}</div>;
//   }
//   
//   return <button onClick={() => signIn()}>Sign In</button>;
// }
`;

  await writeFile(join(authPath, 'examples.ts'), examplesContent);

  // .env.example addition
  const envExample = `# NextAuth.js
AUTH_SECRET=your-secret-key-here-change-in-production
AUTH_URL=http://localhost:3000

# Social Providers (optional)
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=
# GITHUB_CLIENT_ID=
# GITHUB_CLIENT_SECRET=
`;

  await writeFile(join(projectPath, '.env.example.auth'), envExample);
}

/**
 * Get Better Auth database adapter configuration
 */
function getBetterAuthAdapter(database?: string): { imports: string; config: string } {
  switch (database) {
    case 'postgres-drizzle':
    case 'postgres-prisma':
    case 'supabase':
    case 'supabase-drizzle':
    case 'supabase-prisma':
      return {
        imports: `import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../db';`,
        config: 'drizzleAdapter(db)',
      };
    case 'mysql-drizzle':
    case 'mysql-prisma':
      return {
        imports: `import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../db';`,
        config: 'drizzleAdapter(db)',
      };
    case 'sqlite-drizzle':
    case 'sqlite-prisma':
      return {
        imports: `import { Database } from 'bun:sqlite';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../db';`,
        config: 'drizzleAdapter(db)',
      };
    default:
      // Default to SQLite for Bun
      return {
        imports: `import { Database } from 'bun:sqlite';`,
        config: 'new Database("auth.sqlite")',
      };
  }
}

/**
 * Get NextAuth database adapter configuration
 */
function getNextAuthAdapter(database?: string): { imports: string; config: string } {
  switch (database) {
    case 'postgres-drizzle':
    case 'postgres-prisma':
    case 'supabase':
    case 'supabase-drizzle':
    case 'supabase-prisma':
      return {
        imports: `import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '../db';`,
        config: 'DrizzleAdapter(db)',
      };
    case 'mysql-drizzle':
    case 'mysql-prisma':
      return {
        imports: `import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '../db';`,
        config: 'DrizzleAdapter(db)',
      };
    case 'sqlite-drizzle':
    case 'sqlite-prisma':
      return {
        imports: `import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '../db';`,
        config: 'DrizzleAdapter(db)',
      };
    default:
      return {
        imports: '',
        config: 'undefined', // Use JWT strategy by default
      };
  }
}

/**
 * Get authentication-specific package dependencies
 */
export function getAuthDependencies(authProvider: string): Record<string, string> {
  switch (authProvider) {
    case 'better-auth':
      return {
        'better-auth': '^1.3.34',
      };
    case 'nextauth':
      return {
        'next-auth': '^4.24.13',
        '@auth/drizzle-adapter': '^2.4.0',
      };
    default:
      return {};
  }
}
