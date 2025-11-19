import { join } from 'pathe';
import { writeFile, ensureDirectory, directoryExists, type TemplateContext } from '@bunkit/core';
import { themes, generateThemeCSS } from './shadcn-themes';
import type { ShadcnBaseColor } from '@bunkit/core';
import {
  installDefaultShadcnComponents,
  createShadcnExample,
} from './shadcn-components';
import { createShadcnDocs } from './shadcn-docs';

/**
 * Setup shadcn/ui for a single-repo web project
 * Creates components.json and initial structure
 */
export async function setupShadcnWeb(
  projectPath: string,
  context: TemplateContext
): Promise<void> {
  // Create components directory
  await ensureDirectory(join(projectPath, 'src/components/ui'));
  await ensureDirectory(join(projectPath, 'src/lib'));

  // Get theme configuration from context
  const style = context.shadcnStyle || 'new-york';
  const baseColor = (context.shadcnBaseColor || 'zinc') as ShadcnBaseColor;
  const radius = context.shadcnRadius || '0.625rem';

  // components.json for single-repo web project
  // Note: For Tailwind CSS v4, config should be empty string ""
  const componentsJson = {
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
    iconLibrary: 'lucide', // Official docs use "lucide" not "lucide-react"
    aliases: {
      components: '@/components',
      utils: '@/lib/utils',
      ui: '@/components/ui',
      lib: '@/lib',
      hooks: '@/hooks',
    },
  };

  await writeFile(
    join(projectPath, 'components.json'),
    JSON.stringify(componentsJson, null, 2)
  );

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

  packageJson.dependencies['@radix-ui/react-slot'] = 'catalog:';
  packageJson.dependencies['class-variance-authority'] = 'catalog:';
  packageJson.dependencies['clsx'] = 'catalog:';
  packageJson.dependencies['tailwind-merge'] = 'catalog:';
  packageJson.dependencies['lucide-react'] = 'catalog:';

  // Add catalog if it doesn't exist
  if (!packageJson.catalog) {
    packageJson.catalog = {};
  }

  packageJson.catalog['@radix-ui/react-slot'] = '^1.2.3';
  packageJson.catalog['class-variance-authority'] = '^0.7.1';
  packageJson.catalog['clsx'] = '^2.1.1';
  packageJson.catalog['tailwind-merge'] = '^3.3.1';
  packageJson.catalog['lucide-react'] = '^0.468.0';

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
      globalsCss = globalsCss + '\n' + shadcnCss;
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
  const style = context.shadcnStyle || 'new-york';
  const baseColor = (context.shadcnBaseColor || 'zinc') as ShadcnBaseColor;
  const radius = context.shadcnRadius || '0.625rem';

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
      './styles': './src/styles/globals.css',
      // Direct component imports (e.g., @workspace/ui/components/ui/button)
      './components/ui/*': './src/components/ui/*/index.ts',
    },
    dependencies: {
      '@radix-ui/react-slot': 'catalog:',
      'class-variance-authority': 'catalog:',
      clsx: 'catalog:',
      'tailwind-merge': 'catalog:',
      'lucide-react': 'catalog:',
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
  // Note: shadcn CLI uses these aliases to determine where to install components
  // We use relative paths here, not workspace aliases, because shadcn needs actual file paths
  const uiComponentsJson = {
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
    iconLibrary: 'lucide', // Official docs use "lucide" not "lucide-react"
    aliases: {
      components: '@/components',
      utils: '@/lib/utils',
      hooks: '@/hooks',
      lib: '@/lib',
      ui: '@/components/ui',
    },
  };

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

  // packages/ui/tsconfig.json
  // Configure path aliases so @ points to src/ directory
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

    const appComponentsJson = {
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
      iconLibrary: 'lucide',
    aliases: {
      components: '@/components',
      hooks: '@/hooks',
      lib: '@/lib',
      // Use Bun workspace alias for monorepo imports
      utils: '@workspace/ui/lib/utils',
      ui: '@workspace/ui/components/ui',
    },
    };

    await writeFile(
      join(appPath, 'components.json'),
      JSON.stringify(appComponentsJson, null, 2)
    );

    // Update globals.css to import from packages/ui
    const globalsCssPath = join(appPath, 'src/app/globals.css');
    const globalsCss = `@import "../../../packages/ui/src/styles/globals.css";
`;
    await writeFile(globalsCssPath, globalsCss);

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
  const shadcnDependencies = {
    '@radix-ui/react-slot': '^1.1.0',
    'class-variance-authority': '^0.7.1',
    clsx: '^2.1.1',
    'tailwind-merge': '^2.5.5',
    'lucide-react': '^0.468.0',
    '@types/react': '^18.3.18',
    '@types/react-dom': '^18.3.5',
    typescript: '^5.7.2',
  };

  // Merge catalog entries (don't overwrite existing)
  Object.assign(rootPackageJson.catalog, shadcnDependencies);
  
  await writeFile(rootPackageJsonPath, JSON.stringify(rootPackageJson, null, 2));

  // Create documentation in packages/ui
  await createShadcnDocs(join(projectPath, 'packages/ui'), true, context);
}

