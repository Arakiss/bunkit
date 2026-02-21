import {
  directoryExists,
  ensureDirectory,
  fileExists,
  inferShadcnBase,
  type ShadcnBaseColor,
  type TemplateContext,
  writeFile,
} from '@bunkit/core';
import { join } from 'pathe';
import { createShadcnExample } from './shadcn-components';
import { createShadcnDocs } from './shadcn-docs';
import { generateThemeCSS, themes } from './shadcn-themes';

/**
 * Setup shadcn/ui for a single-repo web project
 * Creates components.json and initial structure
 */
export async function setupShadcnWeb(projectPath: string, context: TemplateContext): Promise<void> {
  // Create components directory
  await ensureDirectory(join(projectPath, 'src/components/ui'));
  await ensureDirectory(join(projectPath, 'src/lib'));

  // Get theme configuration from context
  const style = context.shadcnStyle || 'radix-maia';
  const baseColor = (context.shadcnBaseColor || 'zinc') as ShadcnBaseColor;
  const radius = context.shadcnRadius || '0.625rem';
  const iconLibrary = context.shadcnIconLibrary || 'iconoir';

  // components.json for single-repo web project
  // Note: For Tailwind CSS v4, config should be empty string ""
  const componentsJson: Record<string, unknown> = {
    $schema: 'https://ui.shadcn.com/schema.json',
    style,
    rsc: true,
    tsx: true,
    tailwind: {
      config: '', // Empty for Tailwind CSS v4
      css: 'src/app/globals.css',
      baseColor,
      cssVariables: true,
    },
    iconLibrary, // bunkit defaults to iconoir
    aliases: {
      components: '@/components',
      utils: '@/lib/utils',
      ui: '@/components/ui',
      lib: '@/lib',
      hooks: '@/hooks',
    },
  };

  // Add RTL support if enabled (February 2026+)
  if (context.shadcnRtl) {
    componentsJson.rtl = true;
  }

  await writeFile(join(projectPath, 'components.json'), JSON.stringify(componentsJson, null, 2));

  // Create lib/utils.ts (cn utility function)
  const utilsContent = `import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`;

  await writeFile(join(projectPath, 'src/lib/utils.ts'), utilsContent);

  // Update package.json to include shadcn/ui dependencies
  const packageJsonPath = join(projectPath, 'package.json');
  let packageJson: any = {};

  try {
    packageJson = JSON.parse(await Bun.file(packageJsonPath).text());
  } catch {
    // Will be created by project builder
  }

  // Add shadcn/ui dependencies
  if (!packageJson.dependencies) {
    packageJson.dependencies = {};
  }

  // Add UI foundation based on shadcn base
  const shadcnBase = inferShadcnBase(context.shadcnStyle);
  if (shadcnBase === 'base-ui') {
    packageJson.dependencies['@base-ui/react'] = 'catalog:';
  } else {
    packageJson.dependencies['radix-ui'] = 'catalog:';
  }
  packageJson.dependencies['class-variance-authority'] = 'catalog:';
  packageJson.dependencies.clsx = 'catalog:';
  packageJson.dependencies['tailwind-merge'] = 'catalog:';

  // Add icon library dependency based on selection
  const iconPackageName =
    iconLibrary === 'iconoir'
      ? 'iconoir-react'
      : iconLibrary === 'phosphor'
        ? '@phosphor-icons/react'
        : 'lucide-react';
  packageJson.dependencies[iconPackageName] = 'catalog:';

  // Add catalog if it doesn't exist
  if (!packageJson.catalog) {
    packageJson.catalog = {};
  }

  if (shadcnBase === 'base-ui') {
    packageJson.catalog['@base-ui/react'] = '^1.2.0';
  } else {
    packageJson.catalog['radix-ui'] = '^1.4.3';
  }
  packageJson.catalog['class-variance-authority'] = '^0.7.1';
  packageJson.catalog.clsx = '^2.1.1';
  packageJson.catalog['tailwind-merge'] = '^3.4.0';
  packageJson.catalog['tw-animate-css'] = '^1.2.9';

  // Add icon catalog entry
  if (iconLibrary === 'iconoir') {
    packageJson.catalog['iconoir-react'] = '^7.11.0';
  } else if (iconLibrary === 'phosphor') {
    packageJson.catalog['@phosphor-icons/react'] = '^2.1.10';
  } else {
    packageJson.catalog['lucide-react'] = '^0.562.0';
  }

  await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));

  // Update globals.css with shadcn/ui CSS variables
  const globalsCssPath = join(projectPath, 'src/app/globals.css');
  let globalsCss = '';

  try {
    globalsCss = await Bun.file(globalsCssPath).text();
  } catch {
    // File doesn't exist yet, will be created by web builder
  }

  // Add shadcn/ui CSS variables if not already present
  if (!globalsCss.includes('--background')) {
    // Get theme based on baseColor
    const theme = themes[baseColor] || themes.zinc;
    const shadcnCss = generateThemeCSS(theme, radius);

    // Append to existing CSS or create new
    if (globalsCss) {
      globalsCss = `${globalsCss}\n${shadcnCss}`;
    } else {
      globalsCss = `@import "tailwindcss";

${shadcnCss}`;
    }

    await writeFile(globalsCssPath, globalsCss);
  }

  // Tailwind CSS v4 does NOT use tailwind.config.ts
  // All configuration is done via CSS using @theme inline directive
  // This is handled in generateThemeCSS function which is called above

  // Install default components (button, card) after setup
  // Only if dependencies are being installed
  if (context.install !== false) {
    // Note: This will be called after dependencies are installed
    // We'll handle this in the builder after install completes
  }

  // Create example component file
  await createShadcnExample(projectPath, false);

  // Create documentation
  await createShadcnDocs(projectPath, false, context);
}

/**
 * Setup shadcn/ui for a monorepo (full preset)
 * Creates packages/ui workspace and configures apps/web and apps/platform
 */
export async function setupShadcnMonorepo(
  projectPath: string,
  context: TemplateContext
): Promise<void> {
  const packageName = context.packageName || context.projectName.toLowerCase().replace(/\s+/g, '-');
  const uiPackageName = `@${packageName}/ui`;

  // Get theme configuration from context
  const style = context.shadcnStyle || 'radix-maia';
  const baseColor = (context.shadcnBaseColor || 'zinc') as ShadcnBaseColor;
  const radius = context.shadcnRadius || '0.625rem';
  const iconLibrary = context.shadcnIconLibrary || 'iconoir';
  const shadcnBase = inferShadcnBase(context.shadcnStyle);

  // Create packages/ui structure
  await ensureDirectory(join(projectPath, 'packages/ui/src/components'));
  await ensureDirectory(join(projectPath, 'packages/ui/src/lib'));
  await ensureDirectory(join(projectPath, 'packages/ui/src/hooks'));
  await ensureDirectory(join(projectPath, 'packages/ui/src/styles'));

  // packages/ui/package.json
  // Configured for Bun workspaces with proper exports for monorepo usage
  const uiPackageJson = {
    name: uiPackageName,
    version: '0.0.0',
    private: true,
    main: './src/index.ts',
    types: './src/index.ts',
    exports: {
      '.': './src/index.ts',
      './components': './src/components/index.ts',
      './components/*': './src/components/ui/*/index.ts',
      './lib/utils': './src/lib/utils.ts',
      './hooks': './src/hooks/index.ts',
      './globals.css': './src/styles/globals.css',
      './postcss.config': './postcss.config.mjs',
      // Direct component imports (e.g., @workspace/ui/components/ui/button)
      './components/ui/*': './src/components/ui/*/index.ts',
    },
    dependencies: {
      ...(shadcnBase === 'base-ui' ? { '@base-ui/react': 'catalog:' } : { 'radix-ui': 'catalog:' }),
      'class-variance-authority': 'catalog:',
      clsx: 'catalog:',
      'tailwind-merge': 'catalog:',
      ...(iconLibrary === 'iconoir'
        ? { 'iconoir-react': 'catalog:' }
        : iconLibrary === 'phosphor'
          ? { '@phosphor-icons/react': 'catalog:' }
          : { 'lucide-react': 'catalog:' }),
      tailwindcss: 'catalog:',
      '@tailwindcss/postcss': 'catalog:',
    },
    devDependencies: {
      '@types/react': 'catalog:',
      '@types/react-dom': 'catalog:',
      typescript: 'catalog:',
    },
  };

  await writeFile(
    join(projectPath, 'packages/ui/package.json'),
    JSON.stringify(uiPackageJson, null, 2)
  );

  // packages/ui/components.json (for the UI package itself)
  // CRITICAL: shadcn CLI uses aliases for TWO purposes:
  // 1. Installation paths (components, ui) - MUST be relative paths, NOT @ aliases
  //    Using @ aliases causes shadcn CLI to create literal @ directories (e.g., packages/ui/@/components)
  // 2. Import paths in generated components (utils, lib, hooks) - CAN use @ aliases
  //    These are resolved by tsconfig.json which has baseUrl and paths configured
  const uiComponentsJson: Record<string, unknown> = {
    $schema: 'https://ui.shadcn.com/schema.json',
    style,
    rsc: true,
    tsx: true,
    tailwind: {
      config: '', // Empty for Tailwind CSS v4
      css: 'src/styles/globals.css',
      baseColor,
      cssVariables: true,
    },
    iconLibrary, // bunkit defaults to iconoir
    aliases: {
      // Installation paths: Use relative paths (shadcn CLI interprets these as file paths)
      components: './src/components',
      ui: './src/components/ui',
      // Import paths: Can use @ aliases (resolved by tsconfig.json)
      utils: '@/lib/utils',
      hooks: '@/hooks',
      lib: '@/lib',
    },
  };

  // Add RTL support if enabled (February 2026+)
  if (context.shadcnRtl) {
    uiComponentsJson.rtl = true;
  }

  await writeFile(
    join(projectPath, 'packages/ui/components.json'),
    JSON.stringify(uiComponentsJson, null, 2)
  );

  // packages/ui/src/lib/utils.ts
  const uiUtilsContent = `import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`;

  await writeFile(join(projectPath, 'packages/ui/src/lib/utils.ts'), uiUtilsContent);

  // packages/ui/src/components/index.ts
  // This file will be auto-updated when components are added via bunkit add component
  const uiComponentsIndex = `// Export shadcn/ui components here
// Components are installed in src/components/ui/ and exported here
// Add components using: bunkit add component --components button,card,input
// Or directly: bunx shadcn@latest add [component] (from packages/ui directory)

// Components will be automatically exported here when added
`;

  await writeFile(join(projectPath, 'packages/ui/src/components/index.ts'), uiComponentsIndex);

  // packages/ui/src/index.ts - Main entry point for the UI package
  const uiIndexContent = `// Main entry point for @${packageName}/ui package
// This package provides shared shadcn/ui components and Tailwind CSS v4 configuration

// Export utilities
export * from './lib/utils';

// Export hooks (if any)
export * from './hooks';

// Components are exported from individual files
// Import like: import { Button } from '@${packageName}/ui/components/ui/button'
// Or use the re-export: import { Button } from '@workspace/ui/components/ui/button'
`;

  await writeFile(join(projectPath, 'packages/ui/src/index.ts'), uiIndexContent);

  // packages/ui/src/hooks/index.ts
  const uiHooksIndex = `// Export custom hooks here
`;

  await writeFile(join(projectPath, 'packages/ui/src/hooks/index.ts'), uiHooksIndex);

  // packages/ui/src/styles/globals.css - Use dynamic theme
  const theme = themes[baseColor] || themes.zinc;
  const uiGlobalsCss = generateThemeCSS(theme, radius);

  await writeFile(join(projectPath, 'packages/ui/src/styles/globals.css'), uiGlobalsCss);

  // packages/ui/postcss.config.mjs - Tailwind CSS v4 PostCSS config
  const uiPostcssConfig = `/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default config;
`;
  await writeFile(join(projectPath, 'packages/ui/postcss.config.mjs'), uiPostcssConfig);

  // packages/ui/tsconfig.json
  // Configure path aliases so @ points to src/ directory
  // CRITICAL: baseUrl must be set for Next.js to resolve @ aliases when transpiling
  const uiTsconfig = {
    compilerOptions: {
      target: 'ES2017',
      lib: ['dom', 'dom.iterable', 'esnext'],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: 'esnext',
      moduleResolution: 'bundler',
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: 'react-jsx',
      types: ['react', 'react-dom'],
      // baseUrl is REQUIRED for Next.js to resolve @ aliases when transpiling workspace packages
      baseUrl: '.',
      // Path aliases for shadcn CLI compatibility
      paths: {
        '@/*': ['./src/*'],
      },
    },
    include: ['src/**/*'],
    exclude: ['node_modules'],
  };

  await writeFile(
    join(projectPath, 'packages/ui/tsconfig.json'),
    JSON.stringify(uiTsconfig, null, 2)
  );

  // Tailwind CSS v4 does NOT use tailwind.config.ts
  // All configuration is done via CSS using @theme inline directive
  // This is handled in generateThemeCSS function

  // Helper function to configure any Next.js app
  const configureNextJsApp = async (appName: string) => {
    const appPath = join(projectPath, `apps/${appName}`);

    // Check if app exists
    if (!(await directoryExists(appPath))) {
      return;
    }

    // Configure components.json
    await ensureDirectory(join(appPath, 'src/components'));
    await ensureDirectory(join(appPath, 'src/lib'));

    const appComponentsJson: Record<string, unknown> = {
      $schema: 'https://ui.shadcn.com/schema.json',
      style,
      rsc: true,
      tsx: true,
      tailwind: {
        config: '', // Empty for Tailwind CSS v4
        css: '../../packages/ui/src/styles/globals.css',
        baseColor,
        cssVariables: true,
      },
      iconLibrary,
      aliases: {
        components: '@/components',
        hooks: '@/hooks',
        lib: '@/lib',
        // Use Bun workspace alias for monorepo imports
        utils: '@workspace/ui/lib/utils',
        ui: '@workspace/ui/components/ui',
      },
    };

    // Add RTL support if enabled
    if (context.shadcnRtl) {
      appComponentsJson.rtl = true;
    }

    await writeFile(join(appPath, 'components.json'), JSON.stringify(appComponentsJson, null, 2));

    // Update layout.tsx to import UI package CSS directly (like mycelio does)
    // No local globals.css needed - import directly from workspace package
    const layoutPath = join(appPath, 'src/app/layout.tsx');

    if (await fileExists(layoutPath)) {
      let layoutContent = await Bun.file(layoutPath).text();

      // Remove any local globals.css import and add UI package import
      // Pattern: import './globals.css' or import "./globals.css"
      layoutContent = layoutContent.replace(/import\s+['"]\.\/globals\.css['"];?\s*\n?/g, '');

      // Add UI package CSS import if not already present
      if (
        !layoutContent.includes(`${uiPackageName}/globals.css`) &&
        !layoutContent.includes('@workspace/ui/globals.css')
      ) {
        // Find the first import statement and add after it
        const importMatch = layoutContent.match(/^(import\s+.*?from\s+['"].*?['"];?\s*\n)/m);
        if (importMatch) {
          layoutContent = layoutContent.replace(
            /^(import\s+.*?from\s+['"].*?['"];?\s*\n)/m,
            `$1import '${uiPackageName}/globals.css'\n`
          );
        } else {
          // Add at the very beginning
          layoutContent = `import '${uiPackageName}/globals.css'\n${layoutContent}`;
        }
        await writeFile(layoutPath, layoutContent);
      }
    } else {
      // Create layout.tsx if it doesn't exist
      const layoutContent = `import type { Metadata } from 'next'
import '${uiPackageName}/globals.css'

export const metadata: Metadata = {
  title: '${appName}',
  description: 'Built with bunkit',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
`;
      await writeFile(layoutPath, layoutContent);
    }

    // Create postcss.config.mjs that re-exports from UI package (like mycelio does)
    const postcssConfigPath = join(appPath, 'postcss.config.mjs');
    const postcssConfig = `export { default } from '${uiPackageName}/postcss.config';
`;
    await writeFile(postcssConfigPath, postcssConfig);

    // Update next.config.ts to include transpilePackages (required for workspace packages)
    const nextConfigPath = join(appPath, 'next.config.ts');
    let nextConfigContent = '';
    if (await fileExists(nextConfigPath)) {
      nextConfigContent = await Bun.file(nextConfigPath).text();
    } else {
      nextConfigContent = `import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
`;
    }

    // Add transpilePackages if not present
    if (!nextConfigContent.includes('transpilePackages')) {
      // Check if it's a TypeScript or JavaScript config
      if (nextConfigPath.endsWith('.ts')) {
        // TypeScript config
        nextConfigContent = nextConfigContent.replace(
          /(const nextConfig: NextConfig = \{)/,
          `$1\n  transpilePackages: ['${uiPackageName}'],`
        );
      } else {
        // JavaScript config
        nextConfigContent = nextConfigContent.replace(
          /(const nextConfig = \{)/,
          `$1\n  transpilePackages: ['${uiPackageName}'],`
        );
      }
      await writeFile(nextConfigPath, nextConfigContent);
    }

    // Remove local globals.css if it exists (we import from UI package instead)
    const localGlobalsCssPath = join(appPath, 'src/app/globals.css');
    if (await fileExists(localGlobalsCssPath)) {
      const { unlink } = await import('node:fs/promises');
      await unlink(localGlobalsCssPath);
    }

    // Update package.json to include ui package dependency
    const packageJsonPath = join(appPath, 'package.json');
    let packageJson: any = {};

    try {
      packageJson = JSON.parse(await Bun.file(packageJsonPath).text());
    } catch {
      // Will be created by builder
    }

    if (packageJson.dependencies) {
      packageJson.dependencies[uiPackageName] = 'workspace:*';
      await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    }

    // Tailwind CSS v4 configuration is done in CSS, not tailwind.config.ts
    // The @theme inline directive in packages/ui/src/styles/globals.css handles this

    // Create example component files
    await createShadcnExample(appPath, true, packageName);
  };

  // Configure all Next.js apps (web, platform, app)
  await configureNextJsApp('web');
  await configureNextJsApp('platform');
  await configureNextJsApp('app'); // For enterprise preset

  // Update root package.json catalog to include shadcn/ui dependencies
  // Bun 1.3 catalogs allow centralized version management across monorepo
  const rootPackageJsonPath = join(projectPath, 'package.json');
  let rootPackageJson: any = {};

  try {
    rootPackageJson = JSON.parse(await Bun.file(rootPackageJsonPath).text());
  } catch {
    // Will be created by full builder
  }

  // Ensure catalog exists
  if (!rootPackageJson.catalog) {
    rootPackageJson.catalog = {};
  }

  // Add shadcn/ui dependencies to catalog for centralized version management
  // These versions are referenced in packages/ui/package.json with catalog:
  // IMPORTANT: Keep these versions in sync with root package.json catalog
  const shadcnDependencies: Record<string, string> = {
    'class-variance-authority': '^0.7.1',
    clsx: '^2.1.1',
    'tailwind-merge': '^3.4.0',
    'tw-animate-css': '^1.2.9', // Replaces tailwindcss-animate in Tailwind v4
    '@types/react': '^19.2.7',
    '@types/react-dom': '^19.2.3',
    typescript: '^5.9.3',
  };

  // Add UI foundation to catalog
  if (shadcnBase === 'base-ui') {
    shadcnDependencies['@base-ui/react'] = '^1.2.0';
  } else {
    shadcnDependencies['radix-ui'] = '^1.4.3';
  }

  // Add icon library to catalog
  if (iconLibrary === 'iconoir') {
    shadcnDependencies['iconoir-react'] = '^7.11.0';
  } else if (iconLibrary === 'phosphor') {
    shadcnDependencies['@phosphor-icons/react'] = '^2.1.10';
  } else {
    shadcnDependencies['lucide-react'] = '^0.562.0';
  }

  // Merge catalog entries (don't overwrite existing)
  Object.assign(rootPackageJson.catalog, shadcnDependencies);

  await writeFile(rootPackageJsonPath, JSON.stringify(rootPackageJson, null, 2));

  // Create documentation in packages/ui
  await createShadcnDocs(join(projectPath, 'packages/ui'), true, context);
}
