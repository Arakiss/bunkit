/**
 * PresetRegistry - Single source of truth for all bunkit presets
 *
 * This is the canonical definition of what each preset can do.
 * NO MORE duplicate switch statements, NO MORE scattered alias handling.
 */

/**
 * Primary preset names (excluding aliases)
 * Aliases are handled via the aliases array in each definition
 */
export type PrimaryPresetType =
  | 'minimal'
  | 'nextjs'
  | 'hono-api'
  | 'bun-api'
  | 'bun-fullstack'
  | 'nextjs-monorepo'
  | 'bun-monorepo'
  | 'enterprise-monorepo';

// Import the full PresetType for external use
import type { PresetType } from '../types';

/**
 * Preset capabilities - what features each preset supports
 */
export interface PresetCapabilities {
  /** Supports database configuration */
  database: boolean;
  /** Supports CSS framework selection */
  cssFramework: boolean;
  /** Supports UI library (shadcn) */
  uiLibrary: boolean;
  /** Supports authentication providers */
  auth: boolean;
  /** Supports Redis cache */
  redis: boolean;
  /** Supports Docker configuration */
  docker: boolean;
  /** Supports CI/CD setup */
  cicd: boolean;
  /** Is a monorepo preset */
  isMonorepo: boolean;
  /** Has API/backend functionality */
  hasApi: boolean;
  /** Has web frontend */
  hasWeb: boolean;
}

/**
 * Workspace structure for monorepo presets
 */
export interface WorkspaceStructure {
  apps: string[];
  packages: string[];
  tooling: string[];
}

/**
 * Complete preset definition
 */
export interface PresetDefinition {
  /** Canonical name (used internally) */
  name: PrimaryPresetType;
  /** Display name for UI */
  displayName: string;
  /** Short description */
  description: string;
  /** Hint shown in selection menu */
  hint: string;
  /** Emoji for display */
  emoji: string;
  /** All accepted aliases for this preset */
  aliases: string[];
  /** What this preset can do */
  capabilities: PresetCapabilities;
  /** Workspace structure (only for monorepos) */
  workspaceStructure?: WorkspaceStructure;
  /** Dev command to run */
  devCommand: string;
  /** Required dependencies in root (for monorepos) or project (for single) */
  rootDependencies: Record<string, string>;
  /** Required devDependencies in root */
  rootDevDependencies: Record<string, string>;
  /** Catalog entries (for monorepos) */
  catalogEntries?: Record<string, string>;
}

/**
 * All preset definitions - THE source of truth
 * Keyed by primary preset names only (aliases resolved via PresetRegistry.normalize())
 */
export const PRESET_DEFINITIONS: Record<PrimaryPresetType, PresetDefinition> = {
  minimal: {
    name: 'minimal',
    displayName: 'Minimal',
    description: 'Single-file Bun project',
    hint: 'Single-file Bun project - perfect for CLIs and scripts',
    emoji: '⚡',
    aliases: [],
    capabilities: {
      database: false,
      cssFramework: false,
      uiLibrary: false,
      auth: false,
      redis: false,
      docker: true,
      cicd: true,
      isMonorepo: false,
      hasApi: false,
      hasWeb: false,
    },
    devCommand: 'bun run dev',
    rootDependencies: {},
    rootDevDependencies: {
      '@types/bun': 'latest',
      typescript: '^5.9.3',
    },
  },

  nextjs: {
    name: 'nextjs',
    displayName: 'Next.js Application',
    description: 'Next.js 16 + React 19 + Tailwind CSS 4',
    hint: 'Next.js 16 + React 19 + Tailwind CSS 4 - production-ready web app (single repo)',
    emoji: '🌐',
    aliases: ['web'],
    capabilities: {
      database: true,
      cssFramework: true,
      uiLibrary: true,
      auth: true,
      redis: false,
      docker: true,
      cicd: true,
      isMonorepo: false,
      hasApi: false,
      hasWeb: true,
    },
    devCommand: 'bun dev',
    rootDependencies: {
      react: '^19.2.3',
      'react-dom': '^19.2.3',
      next: '^16.0.10',
    },
    rootDevDependencies: {
      '@types/bun': 'latest',
      '@types/react': '^19.2.7',
      '@types/react-dom': '^19.2.3',
      '@types/node': '^25.0.3',
      typescript: '^5.9.3',
      tailwindcss: '^4.1.18',
      '@tailwindcss/postcss': '^4.1.18',
      postcss: '^8.5.6',
    },
  },

  'hono-api': {
    name: 'hono-api',
    displayName: 'Hono API Server',
    description: 'Hono 4 + Bun.serve()',
    hint: 'Hono 4 + Bun.serve() - full-featured API with middleware ecosystem (single repo)',
    emoji: '🚀',
    aliases: ['api'],
    capabilities: {
      database: true,
      cssFramework: false,
      uiLibrary: false,
      auth: true,
      redis: true,
      docker: true,
      cicd: true,
      isMonorepo: false,
      hasApi: true,
      hasWeb: false,
    },
    devCommand: 'bun run dev',
    rootDependencies: {
      hono: '^4.11.1',
    },
    rootDevDependencies: {
      '@types/bun': 'latest',
      typescript: '^5.9.3',
    },
  },

  'bun-api': {
    name: 'bun-api',
    displayName: 'Bun Native API',
    description: 'Bun.serve() native routing',
    hint: 'Bun.serve() native routing - ultra-fast API with zero dependencies (single repo)',
    emoji: '⚡',
    aliases: [],
    capabilities: {
      database: true,
      cssFramework: false,
      uiLibrary: false,
      auth: true,
      redis: true,
      docker: true,
      cicd: true,
      isMonorepo: false,
      hasApi: true,
      hasWeb: false,
    },
    devCommand: 'bun run dev',
    rootDependencies: {},
    rootDevDependencies: {
      '@types/bun': 'latest',
      typescript: '^5.9.3',
    },
  },

  'bun-fullstack': {
    name: 'bun-fullstack',
    displayName: 'Bun Full-Stack',
    description: 'Bun.serve() + HTML imports',
    hint: 'Bun.serve() + HTML imports - full-stack app without Next.js (single repo)',
    emoji: '🔥',
    aliases: [],
    capabilities: {
      database: true,
      cssFramework: true,
      uiLibrary: true,
      auth: true,
      redis: true,
      docker: true,
      cicd: true,
      isMonorepo: false,
      hasApi: true,
      hasWeb: true,
    },
    devCommand: 'bun run dev',
    rootDependencies: {},
    rootDevDependencies: {
      '@types/bun': 'latest',
      typescript: '^5.9.3',
      tailwindcss: '^4.1.18',
      '@tailwindcss/postcss': '^4.1.18',
      postcss: '^8.5.6',
    },
  },

  'nextjs-monorepo': {
    name: 'nextjs-monorepo',
    displayName: 'Next.js Monorepo',
    description: 'Next.js + Hono + shared packages',
    hint: 'Next.js + Hono + shared packages - enterprise SaaS architecture',
    emoji: '📦',
    aliases: ['full', 'monorepo-nextjs'],
    capabilities: {
      database: true,
      cssFramework: true,
      uiLibrary: true,
      auth: true,
      redis: true,
      docker: true,
      cicd: true,
      isMonorepo: true,
      hasApi: true,
      hasWeb: true,
    },
    workspaceStructure: {
      apps: ['web', 'platform', 'api'],
      packages: ['ui', 'types', 'utils'],
      tooling: ['typescript'],
    },
    devCommand: 'bun dev',
    rootDependencies: {},
    rootDevDependencies: {
      '@types/bun': 'latest',
      typescript: 'catalog:',
    },
    catalogEntries: {
      // React ecosystem
      react: '^19.2.3',
      'react-dom': '^19.2.3',
      next: '^16.0.10',
      '@types/react': '^19.2.7',
      '@types/react-dom': '^19.2.3',
      // API
      hono: '^4.11.1',
      // Database
      'drizzle-orm': '^0.45.1',
      'drizzle-kit': '^0.31.8',
      postgres: '^3.4.7',
      '@supabase/supabase-js': '^2.88.0',
      // Styling - Tailwind CSS 4
      tailwindcss: '^4.1.18',
      '@tailwindcss/postcss': '^4.1.18',
      postcss: '^8.5.6',
      autoprefixer: '^10.4.23',
      // shadcn/ui dependencies (December 2025 - new create feature)
      'radix-ui': '^1.4.3', // Unified Radix UI package (replaces @radix-ui/react-*)
      '@radix-ui/react-slot': '^1.2.4', // Legacy support
      '@base-ui/react': '^1.0.0', // Base UI alternative to Radix
      shadcn: '^3.6.2', // shadcn package for CSS/theming
      'class-variance-authority': '^0.7.1',
      clsx: '^2.1.1',
      'tailwind-merge': '^3.4.0',
      'tw-animate-css': '^1.4.0', // Animation library
      // Icons - Multiple options for shadcn/ui
      '@phosphor-icons/react': '^2.1.10', // Default for modern styles
      'iconoir-react': '^7.11.0', // Alternative option
      // Code quality
      ultracite: '^6.4.2',
      '@biomejs/biome': '^2.3.10',
      // Testing
      vitest: '^4.0.16',
      '@vitest/ui': '^4.0.16',
      // TypeScript
      '@types/node': '^25.0.3',
      typescript: '^5.9.3',
    },
  },

  'bun-monorepo': {
    name: 'bun-monorepo',
    displayName: 'Bun Monorepo',
    description: 'Full-stack monorepo with Bun.serve()',
    hint: 'Full-stack monorepo with Bun.serve() - no Next.js',
    emoji: '🔥',
    aliases: ['monorepo-bun'],
    capabilities: {
      database: true,
      cssFramework: true,
      uiLibrary: true,
      auth: true,
      redis: true,
      docker: true,
      cicd: true,
      isMonorepo: true,
      hasApi: true,
      hasWeb: true,
    },
    workspaceStructure: {
      apps: ['web', 'api'],
      packages: ['ui', 'types', 'utils'],
      tooling: ['typescript'],
    },
    devCommand: 'bun dev',
    rootDependencies: {},
    rootDevDependencies: {
      '@types/bun': 'latest',
      typescript: 'catalog:',
    },
    catalogEntries: {
      // React ecosystem (for web)
      react: '^19.2.3',
      'react-dom': '^19.2.3',
      '@types/react': '^19.2.7',
      '@types/react-dom': '^19.2.3',
      // Database
      'drizzle-orm': '^0.45.1',
      'drizzle-kit': '^0.31.8',
      postgres: '^3.4.7',
      '@supabase/supabase-js': '^2.88.0',
      // Styling - Tailwind CSS 4
      tailwindcss: '^4.1.18',
      '@tailwindcss/postcss': '^4.1.18',
      postcss: '^8.5.6',
      autoprefixer: '^10.4.23',
      // shadcn/ui dependencies (December 2025 - new create feature)
      'radix-ui': '^1.4.3', // Unified Radix UI package
      '@radix-ui/react-slot': '^1.2.4', // Legacy support
      '@base-ui/react': '^1.0.0', // Base UI alternative
      shadcn: '^3.6.2', // shadcn package
      'class-variance-authority': '^0.7.1',
      clsx: '^2.1.1',
      'tailwind-merge': '^3.4.0',
      'tw-animate-css': '^1.4.0', // Animation library
      // Icons
      '@phosphor-icons/react': '^2.1.10', // Default for modern styles
      'iconoir-react': '^7.11.0', // Alternative
      // Code quality
      ultracite: '^6.4.2',
      '@biomejs/biome': '^2.3.10',
      // Testing
      vitest: '^4.0.16',
      '@vitest/ui': '^4.0.16',
      // TypeScript
      '@types/node': '^25.0.3',
      typescript: '^5.9.3',
    },
  },

  'enterprise-monorepo': {
    name: 'enterprise-monorepo',
    displayName: 'Enterprise Monorepo',
    description: 'Multiple Next.js apps + services',
    hint: 'Multiple Next.js apps + services - platform, app, service-identity',
    emoji: '🏢',
    aliases: [],
    capabilities: {
      database: true,
      cssFramework: true,
      uiLibrary: true,
      auth: true,
      redis: true,
      docker: true,
      cicd: true,
      isMonorepo: true,
      hasApi: true,
      hasWeb: true,
    },
    workspaceStructure: {
      apps: ['web', 'platform', 'admin', 'api', 'service-identity'],
      packages: ['ui', 'types', 'utils', 'db', 'auth'],
      tooling: ['typescript', 'testing'],
    },
    devCommand: 'bun dev',
    rootDependencies: {},
    rootDevDependencies: {
      '@types/bun': 'latest',
      typescript: 'catalog:',
    },
    catalogEntries: {
      // React ecosystem
      react: '^19.2.3',
      'react-dom': '^19.2.3',
      next: '^16.0.10',
      '@types/react': '^19.2.7',
      '@types/react-dom': '^19.2.3',
      // API
      hono: '^4.11.1',
      // Database
      'drizzle-orm': '^0.45.1',
      'drizzle-kit': '^0.31.8',
      postgres: '^3.4.7',
      '@supabase/supabase-js': '^2.88.0',
      // Styling - Tailwind CSS 4
      tailwindcss: '^4.1.18',
      '@tailwindcss/postcss': '^4.1.18',
      postcss: '^8.5.6',
      autoprefixer: '^10.4.23',
      // shadcn/ui dependencies (December 2025 - new create feature)
      'radix-ui': '^1.4.3', // Unified Radix UI package
      '@radix-ui/react-slot': '^1.2.4', // Legacy support
      '@base-ui/react': '^1.0.0', // Base UI alternative
      shadcn: '^3.6.2', // shadcn package
      'class-variance-authority': '^0.7.1',
      clsx: '^2.1.1',
      'tailwind-merge': '^3.4.0',
      'tw-animate-css': '^1.4.0', // Animation library
      // Icons
      '@phosphor-icons/react': '^2.1.10', // Default for modern styles
      'iconoir-react': '^7.11.0', // Alternative
      // Code quality
      ultracite: '^6.4.2',
      '@biomejs/biome': '^2.3.10',
      // Testing
      vitest: '^4.0.16',
      '@vitest/ui': '^4.0.16',
      // TypeScript
      '@types/node': '^25.0.3',
      typescript: '^5.9.3',
    },
  },
};

/**
 * PresetRegistry - utilities for working with presets
 */
export class PresetRegistry {
  private static aliasMap: Map<string, PrimaryPresetType> | null = null;

  /**
   * Build alias map lazily
   */
  private static getAliasMap(): Map<string, PrimaryPresetType> {
    if (!this.aliasMap) {
      this.aliasMap = new Map();
      for (const [name, definition] of Object.entries(PRESET_DEFINITIONS)) {
        // Map canonical name to itself
        this.aliasMap.set(name, name as PrimaryPresetType);
        // Map all aliases to canonical name
        for (const alias of definition.aliases) {
          this.aliasMap.set(alias, name as PrimaryPresetType);
        }
      }
    }
    return this.aliasMap;
  }

  /**
   * Normalize any preset name/alias to canonical (primary) name
   */
  static normalize(input: string): PrimaryPresetType | null {
    const map = this.getAliasMap();
    return map.get(input) || null;
  }

  /**
   * Get preset definition by name or alias
   */
  static get(input: string): PresetDefinition | null {
    const normalized = this.normalize(input);
    if (!normalized) return null;
    return PRESET_DEFINITIONS[normalized];
  }

  /**
   * Check if a preset supports a capability
   */
  static hasCapability(
    input: string,
    capability: keyof PresetCapabilities
  ): boolean {
    const preset = this.get(input);
    if (!preset) return false;
    return preset.capabilities[capability];
  }

  /**
   * Check if preset is a monorepo
   */
  static isMonorepo(input: string): boolean {
    return this.hasCapability(input, 'isMonorepo');
  }

  /**
   * Get all preset names for select menu
   */
  static getSelectOptions(): Array<{
    value: PresetType;
    label: string;
    hint: string;
  }> {
    return Object.values(PRESET_DEFINITIONS).map((preset) => ({
      value: preset.name,
      label: `${preset.emoji} ${preset.displayName}`,
      hint: preset.hint,
    }));
  }

  /**
   * Get all presets that support a capability
   */
  static getPresetsWithCapability(
    capability: keyof PresetCapabilities
  ): PresetDefinition[] {
    return Object.values(PRESET_DEFINITIONS).filter(
      (preset) => preset.capabilities[capability]
    );
  }

  /**
   * Validate that a preset name/alias is valid
   */
  static isValid(input: string): boolean {
    return this.normalize(input) !== null;
  }

  /**
   * Get all valid preset names and aliases
   */
  static getAllValidNames(): string[] {
    return Array.from(this.getAliasMap().keys());
  }
}
