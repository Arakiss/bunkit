import { ensureDirectory, type TemplateContext, writeFile } from '@bunkit/core';
import { join } from 'pathe';

/**
 * Setup Bun.secrets for secure credential management
 */
export async function setupBunSecrets(
  projectPath: string,
  context: TemplateContext,
  isMonorepo: boolean = false
): Promise<void> {
  const secretsPath = isMonorepo
    ? join(projectPath, 'packages/config')
    : join(projectPath, 'src/config');

  await ensureDirectory(secretsPath);

  // Secrets configuration helper
  const secretsConfig = `/**
 * Bun.secrets Configuration
 * 
 * Bun.secrets provides secure credential management.
 * Set secrets using: bun secret set KEY_NAME=value
 * Access secrets via: Bun.secrets.KEY_NAME
 * 
 * For production, use environment-specific secret management:
 * - Development: bun secret set DATABASE_URL=...
 * - Production: Use your hosting platform's secret management
 */

export interface Secrets {
  DATABASE_URL?: string;
  REDIS_HOST?: string;
  REDIS_PORT?: string;
  REDIS_PASSWORD?: string;
  AUTH_SECRET?: string;
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  [key: string]: string | undefined;
}

/**
 * Get secret value with fallback to environment variable
 * This allows graceful fallback for development
 */
export function getSecret(key: keyof Secrets, fallback?: string): string {
  // Bun.secrets is available at runtime
  // @ts-ignore - Bun.secrets is a runtime global
  const secret = typeof Bun !== 'undefined' && Bun.secrets?.[key];
  
  if (secret) {
    return secret;
  }
  
  // Fallback to environment variable
  const envValue = process.env[key];
  if (envValue) {
    return envValue;
  }
  
  if (fallback) {
    return fallback;
  }
  
  throw new Error(\`Secret \${key} is not set. Set it using: bun secret set \${key}=value\`);
}

/**
 * Type-safe secret accessor
 */
export const secrets = {
  get databaseUrl(): string {
    return getSecret('DATABASE_URL');
  },
  
  get redisHost(): string {
    return getSecret('REDIS_HOST', 'localhost');
  },
  
  get redisPort(): string {
    return getSecret('REDIS_PORT', '6379');
  },
  
  get redisPassword(): string | undefined {
    try {
      return getSecret('REDIS_PASSWORD');
    } catch {
      return undefined;
    }
  },
  
  get authSecret(): string {
    return getSecret('AUTH_SECRET');
  },
  
  get betterAuthSecret(): string {
    return getSecret('BETTER_AUTH_SECRET');
  },
  
  get betterAuthUrl(): string {
    return getSecret('BETTER_AUTH_URL', 'http://localhost:3000');
  },
  
  get supabaseUrl(): string | undefined {
    try {
      return getSecret('NEXT_PUBLIC_SUPABASE_URL');
    } catch {
      return undefined;
    }
  },
  
  get supabaseAnonKey(): string | undefined {
    try {
      return getSecret('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    } catch {
      return undefined;
    }
  },
  
  get googleClientId(): string | undefined {
    try {
      return getSecret('GOOGLE_CLIENT_ID');
    } catch {
      return undefined;
    }
  },
  
  get googleClientSecret(): string | undefined {
    try {
      return getSecret('GOOGLE_CLIENT_SECRET');
    } catch {
      return undefined;
    }
  },
  
  get githubClientId(): string | undefined {
    try {
      return getSecret('GITHUB_CLIENT_ID');
    } catch {
      return undefined;
    }
  },
  
  get githubClientSecret(): string | undefined {
    try {
      return getSecret('GITHUB_CLIENT_SECRET');
    } catch {
      return undefined;
    }
  },
};

export default secrets;
`;

  await writeFile(join(secretsPath, 'secrets.ts'), secretsConfig);

  // Example usage
  const examplesContent = `// Bun.secrets usage examples
import secrets from './secrets';

// Database connection using secrets
export async function getDatabaseConnection() {
  const url = secrets.databaseUrl;
  // Use URL for database connection
  return url;
}

// Redis connection using secrets
export async function getRedisConnection() {
  return {
    host: secrets.redisHost,
    port: parseInt(secrets.redisPort),
    password: secrets.redisPassword,
  };
}

// Auth configuration using secrets
export const authConfig = {
  secret: secrets.authSecret,
  url: secrets.betterAuthUrl,
};

// Social providers using secrets
export const socialProviders = {
  google: secrets.googleClientId && secrets.googleClientSecret ? {
    clientId: secrets.googleClientId,
    clientSecret: secrets.googleClientSecret,
  } : undefined,
  github: secrets.githubClientId && secrets.githubClientSecret ? {
    clientId: secrets.githubClientId,
    clientSecret: secrets.githubClientSecret,
  } : undefined,
};
`;

  await writeFile(join(secretsPath, 'examples.ts'), examplesContent);

  // README for secrets management
  const secretsReadme = `# Bun.secrets Management

This project uses Bun.secrets for secure credential management.

## Setting Secrets

### Development
\`\`\`bash
# Set individual secrets
bun secret set DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
bun secret set AUTH_SECRET=your-secret-key-here

# Set multiple secrets
bun secret set DATABASE_URL=... AUTH_SECRET=... REDIS_PASSWORD=...
\`\`\`

### Production
In production, use your hosting platform's secret management:
- **Vercel**: Environment variables in dashboard
- **Railway**: Environment variables in project settings
- **Fly.io**: \`fly secrets set KEY=value\`
- **Cloudflare Workers**: Wrangler secrets (\`wrangler secret put KEY\`)

## Accessing Secrets

\`\`\`typescript
import secrets from './config/secrets';

// Type-safe access
const dbUrl = secrets.databaseUrl;
const authSecret = secrets.authSecret;

// Or use getSecret for custom keys
import { getSecret } from './config/secrets';
const customSecret = getSecret('CUSTOM_KEY', 'fallback-value');
\`\`\`

## Secret List

Required secrets (set these for your project):
${context.database && context.database !== 'none' ? '- `DATABASE_URL` - Database connection string' : ''}
${context.redis ? '- `REDIS_HOST` - Redis host (default: localhost)' : ''}
${context.redis ? '- `REDIS_PORT` - Redis port (default: 6379)' : ''}
${context.redis ? '- `REDIS_PASSWORD` - Redis password (optional)' : ''}
${context.auth === 'better-auth' ? '- `BETTER_AUTH_SECRET` - Better Auth secret key' : ''}
${context.auth === 'nextauth' ? '- `AUTH_SECRET` - NextAuth secret key' : ''}
${context.database === 'supabase' || context.database === 'supabase-drizzle' || context.database === 'supabase-prisma' ? '- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL' : ''}
${context.database === 'supabase' || context.database === 'supabase-drizzle' || context.database === 'supabase-prisma' ? '- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key' : ''}

Optional secrets (for social auth):
- \`GOOGLE_CLIENT_ID\` - Google OAuth client ID
- \`GOOGLE_CLIENT_SECRET\` - Google OAuth client secret
- \`GITHUB_CLIENT_ID\` - GitHub OAuth client ID
- \`GITHUB_CLIENT_SECRET\` - GitHub OAuth client secret

## Security Best Practices

1. **Never commit secrets** - Use \`.gitignore\` to exclude secret files
2. **Use different secrets** for development and production
3. **Rotate secrets regularly** - Especially after team member changes
4. **Use environment-specific secret management** in production
5. **Limit secret access** - Only grant access to team members who need it

## Migration from .env

If you're migrating from \`.env\` files:

1. Export secrets from .env:
   \`\`\`bash
   cat .env | grep -v '^#' | grep '=' | while IFS='=' read -r key value; do
     bun secret set "$key=$value"
   done
   \`\`\`

2. Update your code to use \`secrets\` helper instead of \`process.env\`

3. Remove \`.env\` file (keep \`.env.example\` for documentation)
`;

  await writeFile(join(secretsPath, 'README.md'), secretsReadme);
}
