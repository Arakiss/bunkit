/**
 * Shared UI Package Builder
 *
 * Generates the packages/ui structure for monorepo presets.
 *
 * Updated February 2026 for shadcn/ui integration:
 * - Radix UI styles: radix-maia, radix-vega, radix-nova, radix-lyra, radix-mira
 * - Base UI styles: base-maia, base-vega, base-nova, base-lyra, base-mira
 * - Unified radix-ui package (replaces @radix-ui/react-*)
 * - Iconoir as bunkit default icon library
 * - RTL support via components.json
 * - New CSS imports: tw-animate-css, shadcn/tailwind.css
 * - OKLCH color values
 */

import type {
  ShadcnBase,
  ShadcnBaseColor,
  ShadcnIconLibrary,
  ShadcnMenuAccent,
  ShadcnMenuColor,
  ShadcnStyle,
} from '@bunkit/core';
import { ensureDirectory, inferShadcnBase, isModernShadcnStyle, writeFile } from '@bunkit/core';
import { join } from 'pathe';
import { generateModernThemeCSS, generateThemeCSS, themes } from '../generators/shadcn-themes';
import { writeUiPackageJson } from './package-json';

export interface UiPackageOptions {
  scopeName: string;
  shadcnStyle?: ShadcnStyle;
  shadcnBase?: ShadcnBase;
  shadcnBaseColor?: ShadcnBaseColor;
  shadcnIconLibrary?: ShadcnIconLibrary;
  shadcnMenuAccent?: ShadcnMenuAccent;
  shadcnMenuColor?: ShadcnMenuColor;
  shadcnRadius?: string;
  shadcnRtl?: boolean;
  appsToScan?: string[];
}

/**
 * Build the complete packages/ui structure
 */
export async function buildUiPackage(
  packagesPath: string,
  options: UiPackageOptions
): Promise<void> {
  const uiPath = join(packagesPath, 'ui');

  // Create directory structure
  await ensureDirectory(join(uiPath, 'src/components'));
  await ensureDirectory(join(uiPath, 'src/hooks'));
  await ensureDirectory(join(uiPath, 'src/lib'));
  await ensureDirectory(join(uiPath, 'src/styles'));

  // Determine default values based on style
  const style = options.shadcnStyle || 'radix-maia';
  const useModernStyle = isModernShadcnStyle(style);
  const shadcnBase = options.shadcnBase || inferShadcnBase(style);
  const iconLibrary = options.shadcnIconLibrary || 'iconoir'; // bunkit default

  // Write package.json with parameterized deps
  await writeUiPackageJson(uiPath, options.scopeName, {
    shadcnBase,
    shadcnIconLibrary: iconLibrary,
  });

  // Write tsconfig.json
  // IMPORTANT: Must override rootDir since inherited paths are resolved relative to the config that defines them
  await writeFile(
    join(uiPath, 'tsconfig.json'),
    JSON.stringify(
      {
        extends: '../../tooling/typescript/library.json',
        compilerOptions: {
          jsx: 'react-jsx',
          rootDir: './src',
          outDir: './dist',
          baseUrl: '.',
          paths: {
            '@/*': ['./src/*'],
          },
        },
        include: ['src/**/*'],
        exclude: ['node_modules'],
      },
      null,
      2
    )
  );

  // Write components.json for shadcn CLI
  // December 2025: Added menuColor, menuAccent, registries for new shadcn/ui features
  const componentsJson: Record<string, unknown> = {
    $schema: 'https://ui.shadcn.com/schema.json',
    style,
    rsc: true,
    tsx: true,
    tailwind: {
      config: '',
      css: './src/styles/globals.css',
      baseColor: options.shadcnBaseColor || 'zinc',
      cssVariables: true,
      prefix: '',
    },
    iconLibrary,
    // IMPORTANT: shadcn CLI v3.6+ uses tsconfig-paths to resolve these aliases
    // They MUST use the @/ format that matches tsconfig.json paths configuration
    // The CLI will then resolve @/components -> ./src/components via tsconfig
    aliases: {
      components: '@/components',
      utils: '@/lib/utils',
      ui: '@/components/ui',
      lib: '@/lib',
      hooks: '@/hooks',
    },
  };

  // Add options for modern styles
  if (useModernStyle) {
    componentsJson.menuColor = options.shadcnMenuColor || 'default';
    componentsJson.menuAccent = options.shadcnMenuAccent || 'subtle';
    componentsJson.registries = {};
  }

  // Add RTL support if enabled (February 2026+)
  if (options.shadcnRtl) {
    componentsJson.rtl = true;
  }

  await writeFile(join(uiPath, 'components.json'), JSON.stringify(componentsJson, null, 2));

  // Write postcss.config.mjs
  await writeFile(
    join(uiPath, 'postcss.config.mjs'),
    `export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
`
  );

  // Generate globals.css with theme
  const appsToScan = options.appsToScan || ['web', 'platform'];
  const appSourcePaths = appsToScan.map(
    (app) => `@source "../../../apps/${app}/src/**/*.{ts,tsx}";`
  );

  // Look up theme by baseColor (zinc, gray, slate, stone, neutral)
  const baseColor = options.shadcnBaseColor || 'zinc';
  const customRadius = options.shadcnRadius || '0.625rem';

  let globalsCss: string;

  if (useModernStyle) {
    // Modern approach: Use tw-animate-css and (for Radix) shadcn/tailwind.css
    // Base UI styles don't use shadcn/tailwind.css — they have their own theming
    const modernThemeCSS = generateModernThemeCSS(baseColor, customRadius);

    const shadcnImport = shadcnBase === 'base-ui' ? '' : '\n@import "shadcn/tailwind.css";';

    globalsCss = `@import "tailwindcss";
@import "tw-animate-css";${shadcnImport}
${appSourcePaths.join('\n')}
@source "../**/*.{ts,tsx}";

@custom-variant dark (&:is(.dark *));

${modernThemeCSS}
`;
  } else {
    // Legacy approach: Generate theme CSS directly (for new-york, default styles)
    const theme = themes[baseColor] || themes.zinc;
    const themeCSS = generateThemeCSS(theme, customRadius);

    globalsCss = `@import "tailwindcss";
${appSourcePaths.join('\n')}
@source "../**/*.{ts,tsx}";

${themeCSS}
`;
  }

  await writeFile(join(uiPath, 'src/styles/globals.css'), globalsCss);

  // Write lib/utils.ts
  await writeFile(
    join(uiPath, 'src/lib/utils.ts'),
    `import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`
  );

  // Write components/index.ts (must have export to be a valid module)
  await writeFile(
    join(uiPath, 'src/components/index.ts'),
    `/**
 * UI Components
 *
 * Add shadcn/ui components using:
 * bunx shadcn@latest add button card dialog ...
 *
 * Then export them here for use across apps.
 */

// Export components as they are added
// Example: export { Button } from './ui/button';

// Empty export to make this a valid ES module
export {};
`
  );

  // Write hooks/index.ts (must have export to be a valid module)
  await writeFile(
    join(uiPath, 'src/hooks/index.ts'),
    `/**
 * Shared Hooks
 *
 * Custom React hooks shared across apps.
 */

// Export hooks as they are added
// Example: export { useMediaQuery } from './use-media-query';

// Empty export to make this a valid ES module
export {};
`
  );

  // Write main index.ts
  await writeFile(
    join(uiPath, 'src/index.ts'),
    `/**
 * @${options.scopeName}/ui - Shared UI Components
 *
 * This package provides:
 * - shadcn/ui components (add with: bunx shadcn@latest add <component>)
 * - Tailwind CSS v4 configuration
 * - Shared hooks and utilities
 *
 * Usage in apps:
 * - Import globals.css: import '@${options.scopeName}/ui/globals.css';
 * - Import components: import { Button } from '@${options.scopeName}/ui/components';
 * - Import utils: import { cn } from '@${options.scopeName}/ui/lib/utils';
 */

export * from './lib/utils';
export * from './hooks';
export * from './components';
`
  );
}

/**
 * Build the types package
 */
export async function buildTypesPackage(packagesPath: string, scopeName: string): Promise<void> {
  const typesPath = join(packagesPath, 'types');

  await ensureDirectory(join(typesPath, 'src'));

  // Write package.json (imported from package-json.ts)
  const { writeTypesPackageJson } = await import('./package-json');
  await writeTypesPackageJson(typesPath, scopeName);

  // Write tsconfig.json
  // IMPORTANT: Must override rootDir since inherited paths are resolved relative to the config that defines them
  await writeFile(
    join(typesPath, 'tsconfig.json'),
    JSON.stringify(
      {
        extends: '../../tooling/typescript/library.json',
        compilerOptions: {
          rootDir: './src',
          outDir: './dist',
        },
        include: ['src/**/*'],
        exclude: ['node_modules'],
      },
      null,
      2
    )
  );

  // Write index.ts
  await writeFile(
    join(typesPath, 'src/index.ts'),
    `/**
 * @${scopeName}/types - Shared TypeScript Types
 *
 * Define types that are shared across multiple packages/apps here.
 */

// Example types - replace with your actual types

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}
`
  );
}

/**
 * Build the utils package
 */
export async function buildUtilsPackage(packagesPath: string, scopeName: string): Promise<void> {
  const utilsPath = join(packagesPath, 'utils');

  await ensureDirectory(join(utilsPath, 'src'));

  // Write package.json
  const { writeUtilsPackageJson } = await import('./package-json');
  await writeUtilsPackageJson(utilsPath, scopeName);

  // Write tsconfig.json
  // IMPORTANT: Must override rootDir since inherited paths are resolved relative to the config that defines them
  await writeFile(
    join(utilsPath, 'tsconfig.json'),
    JSON.stringify(
      {
        extends: '../../tooling/typescript/library.json',
        compilerOptions: {
          rootDir: './src',
          outDir: './dist',
        },
        include: ['src/**/*'],
        exclude: ['node_modules'],
      },
      null,
      2
    )
  );

  // Write index.ts with useful utilities
  await writeFile(
    join(utilsPath, 'src/index.ts'),
    `/**
 * @${scopeName}/utils - Shared Utilities
 *
 * Utility functions shared across packages and apps.
 */

/**
 * Format a date to a human-readable string
 */
export function formatDate(date: Date | string, locale = 'en-US'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format a number as currency
 */
export function formatCurrency(
  amount: number,
  currency = 'USD',
  locale = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Sleep for a specified number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Safely parse JSON with a fallback value
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Generate a random ID
 */
export function generateId(length = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Check if running on server
 * Uses a type-safe approach that works without DOM types
 */
export function isServer(): boolean {
  return !(typeof window !== 'undefined' && window.document);
}

/**
 * Check if running on client
 * Uses a type-safe approach that works without DOM types
 */
export function isClient(): boolean {
  return typeof window !== 'undefined' && !!window.document;
}

// Declare window for environments without DOM types
declare const window: { document?: unknown } | undefined;
`
  );
}
