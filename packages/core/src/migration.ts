/**
 * Preset migration utilities for bunkit v2.0.0
 *
 * Handles two categories:
 * 1. REMOVED presets — hard errors with migration guidance
 * 2. DEPRECATED aliases — warnings that map to canonical names
 */

/**
 * Presets that were removed in v2.0.0 with error messages and suggestions.
 */
export const REMOVED_PRESETS: Record<string, { message: string; suggestion: string }> = {
  'bun-api': {
    message:
      'The "bun-api" preset was removed in bunkit v2.0.0. ' +
      'It overlapped with "hono-api" which provides the same features with a better middleware ecosystem.',
    suggestion: 'hono-api',
  },
  'bun-fullstack': {
    message:
      'The "bun-fullstack" preset was removed in bunkit v2.0.0. ' +
      'Use "bun-monorepo" for full-stack Bun projects without Next.js.',
    suggestion: 'bun-monorepo',
  },
  'enterprise-monorepo': {
    message:
      'The "enterprise-monorepo" preset was removed in bunkit v2.0.0. ' +
      'Use "nextjs-monorepo --enterprise" for enterprise features (additional apps, services, packages).',
    suggestion: 'nextjs-monorepo',
  },
};

/**
 * Aliases that still work but emit deprecation warnings.
 * Maps alias → canonical preset name.
 */
export const DEPRECATED_ALIASES: Record<string, { canonical: string; warning: string }> = {
  web: {
    canonical: 'nextjs',
    warning: 'The "web" alias is deprecated. Use "nextjs" instead.',
  },
  api: {
    canonical: 'hono-api',
    warning: 'The "api" alias is deprecated. Use "hono-api" instead.',
  },
  full: {
    canonical: 'nextjs-monorepo',
    warning: 'The "full" alias is deprecated. Use "nextjs-monorepo" instead.',
  },
  'monorepo-nextjs': {
    canonical: 'nextjs-monorepo',
    warning: 'The "monorepo-nextjs" alias is deprecated. Use "nextjs-monorepo" instead.',
  },
  'monorepo-bun': {
    canonical: 'bun-monorepo',
    warning: 'The "monorepo-bun" alias is deprecated. Use "bun-monorepo" instead.',
  },
};

/**
 * Check if a preset name was removed in v2.0.0.
 * Returns the removal info or null if not removed.
 */
export function getRemovedPresetInfo(
  preset: string
): { message: string; suggestion: string } | null {
  return REMOVED_PRESETS[preset] || null;
}

/**
 * Check if a preset name is a deprecated alias.
 * Returns the alias info or null if not deprecated.
 */
export function getDeprecatedAliasInfo(
  preset: string
): { canonical: string; warning: string } | null {
  return DEPRECATED_ALIASES[preset] || null;
}
