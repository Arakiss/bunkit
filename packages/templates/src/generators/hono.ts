import { join } from 'pathe';
import { writeFile, ensureDirectory, type TemplateContext } from '@bunkit/core';

/**
 * Setup enhanced Hono defaults with middleware and utilities
 */
export async function setupEnhancedHono(
  projectPath: string,
  context: TemplateContext,
  isMonorepo: boolean = false
): Promise<void> {
  const middlewarePath = isMonorepo
    ? join(projectPath, 'apps/api/src/middleware')
    : join(projectPath, 'src/middleware');

  const utilsPath = isMonorepo
    ? join(projectPath, 'apps/api/src/utils')
    : join(projectPath, 'src/utils');

  await ensureDirectory(middlewarePath);
  await ensureDirectory(utilsPath);

  // Rate limiting middleware
  const rateLimitMiddleware = `import { Context, Next } from 'hono';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
  message?: string;
  skipSuccessfulRequests?: boolean;
}

const store = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(options: RateLimitOptions) {
  const {
    windowMs = 60000, // 1 minute default
    max = 100,
    message = 'Too many requests, please try again later.',
    skipSuccessfulRequests = false,
  } = options;

  return async (c: Context, next: Next) => {
    const key = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
    const now = Date.now();
    const record = store.get(key);

    // Clean up old entries periodically
    if (Math.random() < 0.01) {
      for (const [k, v] of store.entries()) {
        if (v.resetTime < now) {
          store.delete(k);
        }
      }
    }

    if (!record || record.resetTime < now) {
      store.set(key, { count: 1, resetTime: now + windowMs });
      await next();
      return;
    }

    if (record.count >= max) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      c.header('Retry-After', retryAfter.toString());
      c.header('X-RateLimit-Limit', max.toString());
      c.header('X-RateLimit-Remaining', '0');
      c.header('X-RateLimit-Reset', new Date(record.resetTime).toISOString());
      return c.json({ error: message }, 429);
    }

    record.count++;
    
    if (!skipSuccessfulRequests) {
      await next();
      const status = c.res.status;
      if (status >= 200 && status < 300) {
        record.count--;
      }
    } else {
      await next();
    }

    c.header('X-RateLimit-Limit', max.toString());
    c.header('X-RateLimit-Remaining', Math.max(0, max - record.count).toString());
    c.header('X-RateLimit-Reset', new Date(record.resetTime).toISOString());
  };
}
`;

  await writeFile(join(middlewarePath, 'rate-limit.ts'), rateLimitMiddleware);

  // Security headers middleware
  const securityMiddleware = `import { Context, Next } from 'hono';

interface SecurityHeadersOptions {
  contentSecurityPolicy?: string;
  frameOptions?: string;
  xssProtection?: boolean;
  noSniff?: boolean;
  referrerPolicy?: string;
}

export function securityHeaders(options: SecurityHeadersOptions = {}) {
  const {
    contentSecurityPolicy = "default-src 'self'",
    frameOptions = 'DENY',
    xssProtection = true,
    noSniff = true,
    referrerPolicy = 'strict-origin-when-cross-origin',
  } = options;

  return async (c: Context, next: Next) => {
    await next();

    c.header('X-Content-Type-Options', noSniff ? 'nosniff' : '');
    c.header('X-Frame-Options', frameOptions);
    c.header('Referrer-Policy', referrerPolicy);
    
    if (xssProtection) {
      c.header('X-XSS-Protection', '1; mode=block');
    }
    
    if (contentSecurityPolicy) {
      c.header('Content-Security-Policy', contentSecurityPolicy);
    }
  };
}
`;

  await writeFile(join(middlewarePath, 'security.ts'), securityMiddleware);

  // Request ID middleware
  const requestIdMiddleware = `import { Context, Next } from 'hono';
import { randomBytes } from 'crypto';

export function requestId() {
  return async (c: Context, next: Next) => {
    const id = c.req.header('x-request-id') || randomBytes(16).toString('hex');
    c.header('X-Request-ID', id);
    c.set('requestId', id);
    await next();
  };
}
`;

  await writeFile(join(middlewarePath, 'request-id.ts'), requestIdMiddleware);

  // Timing middleware
  const timingMiddleware = `import { Context, Next } from 'hono';

export function timing() {
  return async (c: Context, next: Next) => {
    const start = Date.now();
    await next();
    const duration = Date.now() - start;
    c.header('X-Response-Time', \`\${duration}ms\`);
  };
}
`;

  await writeFile(join(middlewarePath, 'timing.ts'), timingMiddleware);

  // Body size limit middleware
  const bodySizeMiddleware = `import { Context, Next } from 'hono';

interface BodySizeLimitOptions {
  maxSize: number; // in bytes
  message?: string;
}

export function bodySizeLimit(options: BodySizeLimitOptions) {
  const { maxSize = 1024 * 1024, message = 'Request body too large' } = options;

  return async (c: Context, next: Next) => {
    const contentLength = c.req.header('content-length');
    
    if (contentLength && parseInt(contentLength) > maxSize) {
      return c.json({ error: message }, 413);
    }

    await next();
  };
}
`;

  await writeFile(join(middlewarePath, 'body-size-limit.ts'), bodySizeMiddleware);

  // Compression middleware (using Bun's built-in compression)
  const compressionMiddleware = `import { Context, Next } from 'hono';

export function compression() {
  return async (c: Context, next: Next) => {
    await next();
    
    const acceptEncoding = c.req.header('accept-encoding') || '';
    const response = c.res;
    
    // Bun handles compression automatically, but we can add headers
    if (acceptEncoding.includes('gzip') || acceptEncoding.includes('deflate')) {
      // Response will be compressed by Bun automatically
      c.header('Vary', 'Accept-Encoding');
    }
  };
}
`;

  await writeFile(join(middlewarePath, 'compression.ts'), compressionMiddleware);

  // Error handler utility
  const errorHandler = `import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

export function errorHandler(error: Error, c: Context) {
  const requestId = c.get('requestId') || 'unknown';
  
  console.error(\`[Error] [\${requestId}]\`, {
    message: error.message,
    stack: error.stack,
    path: c.req.path,
    method: c.req.method,
  });

  if (error instanceof HTTPException) {
    return c.json(
      {
        error: error.message,
        requestId,
      },
      error.status
    );
  }

  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return c.json(
    {
      error: isDevelopment ? error.message : 'Internal server error',
      requestId,
      ...(isDevelopment && { stack: error.stack }),
    },
    500
  );
}
`;

  await writeFile(join(middlewarePath, 'error-handler.ts'), errorHandler);

  // Validation utility
  const validationUtil = `import { Context } from 'hono';
import { z } from 'zod';

export async function validateBody<T extends z.ZodType>(
  c: Context,
  schema: T
): Promise<z.infer<T>> {
  try {
    const body = await c.req.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(
        {
          error: 'Validation failed',
          details: error.errors,
        },
        400
      ) as never;
    }
    throw error;
  }
}

export function validateQuery<T extends z.ZodType>(
  c: Context,
  schema: T
): z.infer<T> {
  try {
    const query = c.req.query();
    return schema.parse(query);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(
        {
          error: 'Validation failed',
          details: error.errors,
        },
        400
      ) as never;
    }
    throw error;
  }
}

export function validateParam<T extends z.ZodType>(
  c: Context,
  schema: T,
  paramName: string
): z.infer<T> {
  try {
    const param = c.req.param(paramName);
    return schema.parse(param);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(
        {
          error: 'Validation failed',
          details: error.errors,
        },
        400
      ) as never;
    }
    throw error;
  }
}
`;

  await writeFile(join(utilsPath, 'validation.ts'), validationUtil);

  // Response utilities
  const responseUtil = `import { Context } from 'hono';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  requestId?: string;
  timestamp?: string;
}

export function successResponse<T>(c: Context, data: T, status: number = 200) {
  const requestId = c.get('requestId');
  
  return c.json<ApiResponse<T>>(
    {
      success: true,
      data,
      requestId,
      timestamp: new Date().toISOString(),
    },
    status
  );
}

export function errorResponse(c: Context, error: string, status: number = 400) {
  const requestId = c.get('requestId');
  
  return c.json<ApiResponse>(
    {
      success: false,
      error,
      requestId,
      timestamp: new Date().toISOString(),
    },
    status
  );
}
`;

  await writeFile(join(utilsPath, 'response.ts'), responseUtil);

  // Middleware index
  const middlewareIndex = `export { rateLimit } from './rate-limit';
export { securityHeaders } from './security';
export { requestId } from './request-id';
export { timing } from './timing';
export { bodySizeLimit } from './body-size-limit';
export { compression } from './compression';
export { errorHandler } from './error-handler';
`;

  await writeFile(join(middlewarePath, 'index.ts'), middlewareIndex);

  // Utils index
  const utilsIndex = `export { validateBody, validateQuery, validateParam } from './validation';
export { successResponse, errorResponse, type ApiResponse } from './response';
`;

  await writeFile(join(utilsPath, 'index.ts'), utilsIndex);
}

