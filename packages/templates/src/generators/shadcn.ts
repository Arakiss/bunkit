import { join } from 'pathe';
import { writeFile, ensureDirectory, type TemplateContext } from '@bunkit/core';
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

  // Update tailwind.config.ts to include shadcn/ui theme
  const tailwindConfigPath = join(projectPath, 'tailwind.config.ts');
  let tailwindConfig = '';
  
  try {
    tailwindConfig = await Bun.file(tailwindConfigPath).text();
  } catch {
    // Will be created by web builder, we'll update it after
  }

  // Update tailwind config to include shadcn/ui theme
  // Only update if it doesn't already have shadcn colors
  if (tailwindConfig && !tailwindConfig.includes('hsl(var(--background))')) {
    // Replace the theme section with shadcn/ui theme
    const shadcnTheme = `  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },`;

    // Replace theme section if it exists, otherwise append
    if (tailwindConfig.includes('theme:')) {
      const updatedConfig = tailwindConfig.replace(
        /theme:\s*\{[^}]*\}/s,
        shadcnTheme.trim()
      );
      await writeFile(tailwindConfigPath, updatedConfig);
    } else {
      // Append theme before the closing brace
      const updatedConfig = tailwindConfig.replace(
        /(\s*)(plugins:.*?)(\n\s*\};)/s,
        `$1$2$1${shadcnTheme}$3`
      );
      await writeFile(tailwindConfigPath, updatedConfig);
    }
  } else if (!tailwindConfig) {
    // Create a new tailwind config with shadcn/ui theme
    const newTailwindConfig = `import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;
`;

    await writeFile(tailwindConfigPath, newTailwindConfig);
  }

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
  const uiPackageJson = {
    name: uiPackageName,
    version: '0.0.0',
    private: true,
    main: './src/index.ts',
    types: './src/index.ts',
    exports: {
      './components': './src/components/index.ts',
      './lib/utils': './src/lib/utils.ts',
      './hooks': './src/hooks/index.ts',
      './styles': './src/styles/globals.css',
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
      components: '@workspace/ui/components',
      utils: '@workspace/ui/lib/utils',
      hooks: '@workspace/ui/hooks',
      lib: '@workspace/ui/lib',
      ui: '@workspace/ui/components',
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
  const uiComponentsIndex = `// Export shadcn/ui components here
// Components will be added via: bunx shadcn@latest add [component]
`;

  await writeFile(join(projectPath, 'packages/ui/src/components/index.ts'), uiComponentsIndex);

  // packages/ui/src/hooks/index.ts
  const uiHooksIndex = `// Export custom hooks here
`;

  await writeFile(join(projectPath, 'packages/ui/src/hooks/index.ts'), uiHooksIndex);

  // packages/ui/src/styles/globals.css - Use dynamic theme
  const theme = themes[baseColor] || themes.zinc;
  const uiGlobalsCss = generateThemeCSS(theme, radius);

  await writeFile(join(projectPath, 'packages/ui/src/styles/globals.css'), uiGlobalsCss);

  // packages/ui/tsconfig.json
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
    },
    include: ['src/**/*'],
    exclude: ['node_modules'],
  };

  await writeFile(
    join(projectPath, 'packages/ui/tsconfig.json'),
    JSON.stringify(uiTsconfig, null, 2)
  );

  // Configure apps/web/components.json
  await ensureDirectory(join(projectPath, 'apps/web/src/components'));
  await ensureDirectory(join(projectPath, 'apps/web/src/lib'));

  const webComponentsJson = {
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
    iconLibrary: 'lucide', // Official docs use "lucide" not "lucide-react"
    aliases: {
      components: '@/components',
      hooks: '@/hooks',
      lib: '@/lib',
      utils: '@workspace/ui/lib/utils',
      ui: '@workspace/ui/components',
    },
  };

  await writeFile(
    join(projectPath, 'apps/web/components.json'),
    JSON.stringify(webComponentsJson, null, 2)
  );

  // Update apps/web/src/app/globals.css to import from packages/ui
  const webGlobalsCssPath = join(projectPath, 'apps/web/src/app/globals.css');
  const webGlobalsCss = `@import "../../../packages/ui/src/styles/globals.css";
`;

  await writeFile(webGlobalsCssPath, webGlobalsCss);

  // Update apps/web/package.json to include ui package dependency
  const webPackageJsonPath = join(projectPath, 'apps/web/package.json');
  let webPackageJson: any = {};
  
  try {
    webPackageJson = JSON.parse(await Bun.file(webPackageJsonPath).text());
  } catch {
    // Will be created by full builder
  }

  if (webPackageJson.dependencies) {
    webPackageJson.dependencies[uiPackageName] = 'workspace:*';
    await writeFile(webPackageJsonPath, JSON.stringify(webPackageJson, null, 2));
  }

  // Configure apps/platform/components.json (same as web)
  await ensureDirectory(join(projectPath, 'apps/platform/src/components'));
  await ensureDirectory(join(projectPath, 'apps/platform/src/lib'));

  const platformComponentsJson = {
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
    iconLibrary: 'lucide', // Official docs use "lucide" not "lucide-react"
    aliases: {
      components: '@/components',
      hooks: '@/hooks',
      lib: '@/lib',
      utils: '@workspace/ui/lib/utils',
      ui: '@workspace/ui/components',
    },
  };

  await writeFile(
    join(projectPath, 'apps/platform/components.json'),
    JSON.stringify(platformComponentsJson, null, 2)
  );

  // Update apps/platform/src/app/globals.css
  const platformGlobalsCssPath = join(projectPath, 'apps/platform/src/app/globals.css');
  const platformGlobalsCss = `@import "../../../packages/ui/src/styles/globals.css";
`;

  await writeFile(platformGlobalsCssPath, platformGlobalsCss);

  // Update apps/platform/package.json
  const platformPackageJsonPath = join(projectPath, 'apps/platform/package.json');
  let platformPackageJson: any = {};
  
  try {
    platformPackageJson = JSON.parse(await Bun.file(platformPackageJsonPath).text());
  } catch {
    // Will be created by full builder
  }

  if (platformPackageJson.dependencies) {
    platformPackageJson.dependencies[uiPackageName] = 'workspace:*';
    await writeFile(platformPackageJsonPath, JSON.stringify(platformPackageJson, null, 2));
  }

  // Update tailwind.config.ts for apps/web and apps/platform
  const updateAppTailwindConfig = async (appPath: string) => {
    const tailwindConfigPath = join(projectPath, appPath, 'tailwind.config.ts');
    let tailwindConfig = '';
    
    try {
      tailwindConfig = await Bun.file(tailwindConfigPath).text();
    } catch {
      // Will be created by full builder
    }

    const shadcnTheme = `  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },`;

    if (tailwindConfig && !tailwindConfig.includes('hsl(var(--background))')) {
      if (tailwindConfig.includes('theme:')) {
        const updatedConfig = tailwindConfig.replace(
          /theme:\s*\{[^}]*\}/s,
          shadcnTheme.trim()
        );
        await writeFile(tailwindConfigPath, updatedConfig);
      } else {
        const updatedConfig = tailwindConfig.replace(
          /(\s*)(plugins:.*?)(\n\s*\};)/s,
          `$1$2$1${shadcnTheme}$3`
        );
        await writeFile(tailwindConfigPath, updatedConfig);
      }
    } else if (!tailwindConfig) {
      const newTailwindConfig = `import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;
`;

      await writeFile(tailwindConfigPath, newTailwindConfig);
    }
  };

  await updateAppTailwindConfig('apps/web');
  await updateAppTailwindConfig('apps/platform');

  // Update root package.json catalog to include lucide-react
  const rootPackageJsonPath = join(projectPath, 'package.json');
  let rootPackageJson: any = {};
  
  try {
    rootPackageJson = JSON.parse(await Bun.file(rootPackageJsonPath).text());
  } catch {
    // Will be created by full builder
  }

  if (rootPackageJson.catalog) {
    rootPackageJson.catalog['lucide-react'] = '^0.468.0';
    await writeFile(rootPackageJsonPath, JSON.stringify(rootPackageJson, null, 2));
  }

  // Create example component files for both apps
  await createShadcnExample(join(projectPath, 'apps/web'), true);
  await createShadcnExample(join(projectPath, 'apps/platform'), true);

  // Create documentation in packages/ui
  await createShadcnDocs(join(projectPath, 'packages/ui'), true, context);
}

