import * as p from '@clack/prompts';
import pc from 'picocolors';
import boxen from 'boxen';
import chalk from 'chalk';
import { join } from 'pathe';
import {
  validateProjectName,
  createProject,
  createTemplateContext,
  installDependencies,
  type ProjectConfig,
  type PresetType,
  type DatabaseType,
  type CodeQualityType,
  type TypeScriptStrictness,
  type UILibrary,
  type CSSFramework,
  type TestingFramework,
  type ShadcnStyle,
  type ShadcnBaseColor,
} from '@bunkit/core';
import {
  buildMinimalPreset,
  buildWebPreset,
  buildApiPreset,
  buildFullPreset,
  getDatabaseDependencies,
  getCodeQualityDependencies,
} from '@bunkit/templates';
import { installDefaultShadcnComponents } from '@bunkit/templates';

/**
 * Dependency versions for single repos (not monorepos)
 * Monorepos use catalog: references from root package.json
 */
const VERSIONS = {
  vitest: '^2.0.0',
  '@vitest/ui': '^2.0.0',
  'class-variance-authority': '^0.7.1',
  clsx: '^2.1.1',
  'tailwind-merge': '^3.3.1',
} as const;

/**
 * Enhanced options for fully customizable init command
 */
export interface EnhancedInitOptions {
  name?: string;
  preset?: PresetType;
  database?: DatabaseType;
  codeQuality?: CodeQualityType;
  tsStrictness?: TypeScriptStrictness;
  uiLibrary?: UILibrary;
  cssFramework?: CSSFramework;
  testing?: TestingFramework;
  docker?: boolean;
  cicd?: boolean;
  git?: boolean;
  install?: boolean;
  nonInteractive?: boolean;
  // shadcn/ui specific options
  shadcnStyle?: ShadcnStyle;
  shadcnBaseColor?: ShadcnBaseColor;
  shadcnRadius?: string;
}

/**
 * Get value with priority: env var > option > default
 */
function getOptionValue<T>(
  envVar: string,
  option: T | undefined,
  defaultValue?: T
): T | undefined {
  const envValue = process.env[envVar];

  // Handle boolean env vars
  if (envValue !== undefined) {
    if (envValue === 'true') return true as T;
    if (envValue === 'false') return false as T;
    return envValue as T;
  }

  return option ?? defaultValue;
}

/**
 * Enhanced init command with maximum customization
 */
export async function enhancedInitCommand(options: EnhancedInitOptions = {}) {
  const isNonInteractive =
    process.env.BUNKIT_NON_INTERACTIVE === 'true' ||
    options.nonInteractive === true;

  // ====================
  // 1. PROJECT NAME
  // ====================
  let projectName = getOptionValue<string>(
    'BUNKIT_PROJECT_NAME',
    options.name
  );

  if (!projectName) {
    if (isNonInteractive) {
      throw new Error(
        'Project name is required in non-interactive mode. ' +
        'Provide it via BUNKIT_PROJECT_NAME env var or --name flag.'
      );
    }

    projectName = await p.text({
      message: '📦 What is your project named?',
      placeholder: 'my-awesome-project',
      validate: (value) => {
        const result = validateProjectName(value);
        if (!result.valid) return result.error;
      },
    }) as string;

    if (p.isCancel(projectName)) {
      p.cancel('Operation cancelled.');
      process.exit(0);
    }
  } else {
    const result = validateProjectName(projectName);
    if (!result.valid) {
      throw new Error(`Invalid project name: ${result.error}`);
    }
  }

  // ====================
  // 2. PRESET
  // ====================
  let preset = getOptionValue<PresetType>(
    'BUNKIT_PRESET',
    options.preset
  );

  if (!preset) {
    if (isNonInteractive) {
      throw new Error(
        'Preset is required in non-interactive mode. ' +
        'Provide it via BUNKIT_PRESET env var or --preset flag.'
      );
    }

    preset = await p.select({
      message: '🎨 Which preset would you like?',
      options: [
        {
          value: 'minimal',
          label: '⚡ Minimal',
          hint: 'Single file, clean start - perfect for learning Bun',
        },
        {
          value: 'web',
          label: '🌐 Web App',
          hint: 'Next.js 16 + React 19 - full-stack web application',
        },
        {
          value: 'api',
          label: '🚀 API Server',
          hint: 'Hono + Bun.serve() - ultra-fast REST API',
        },
        {
          value: 'full',
          label: '📦 Full-Stack Monorepo',
          hint: 'Web + Platform + API - enterprise SaaS setup',
        },
      ],
    }) as PresetType;

    if (p.isCancel(preset)) {
      p.cancel('Operation cancelled.');
      process.exit(0);
    }
  }

  // ====================
  // 3. DATABASE (only for api/full presets)
  // ====================
  let database: DatabaseType | undefined = getOptionValue<DatabaseType>(
    'BUNKIT_DATABASE',
    options.database
  );

  if (!database && (preset === 'api' || preset === 'full')) {
    if (!isNonInteractive) {
      database = await p.select({
        message: '🗄️  Database setup?',
        options: [
          {
            value: 'postgres-drizzle',
            label: 'PostgreSQL + Drizzle ORM',
            hint: 'Production-ready, type-safe SQL database',
          },
          {
            value: 'supabase',
            label: 'Supabase',
            hint: 'PostgreSQL + Auth + Storage + Realtime - all-in-one',
          },
          {
            value: 'sqlite-drizzle',
            label: 'SQLite + Drizzle ORM',
            hint: 'Local-first, embedded database - perfect for prototypes',
          },
          {
            value: 'none',
            label: 'None',
            hint: "I'll add it later",
          },
        ],
      }) as DatabaseType;

      if (p.isCancel(database)) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }
    } else {
      database = 'none';
    }
  }

  // ====================
  // 4. CODE QUALITY
  // ====================
  let codeQuality = getOptionValue<CodeQualityType>(
    'BUNKIT_CODE_QUALITY',
    options.codeQuality,
    'ultracite' // Default to Ultracite (AI-optimized)
  );

  if (!codeQuality) {
    if (!isNonInteractive) {
      codeQuality = await p.select({
        message: '🤖 Code quality setup?',
        options: [
          {
            value: 'ultracite',
            label: 'Ultracite (Recommended)',
            hint: 'AI-optimized Biome preset - syncs rules for Cursor, Claude, Windsurf',
          },
          {
            value: 'biome',
            label: 'Biome',
            hint: 'Standard Biome with good defaults - fast and reliable',
          },
        ],
      }) as CodeQualityType;

      if (p.isCancel(codeQuality)) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }
    } else {
      codeQuality = 'ultracite';
    }
  }

  // ====================
  // 5. TYPESCRIPT STRICTNESS
  // ====================
  let tsStrictness = getOptionValue<TypeScriptStrictness>(
    'BUNKIT_TS_STRICTNESS',
    options.tsStrictness,
    'strict' // Default to strict
  );

  if (!tsStrictness) {
    if (!isNonInteractive) {
      tsStrictness = await p.select({
        message: '🔒 TypeScript strictness?',
        options: [
          {
            value: 'strict',
            label: 'Strict (Recommended)',
            hint: 'Maximum type safety - catches bugs early, prevents headaches',
          },
          {
            value: 'moderate',
            label: 'Moderate',
            hint: 'Balanced - good safety without being too rigid',
          },
          {
            value: 'loose',
            label: 'Loose',
            hint: 'Minimal checks - quick prototyping, migrate from JavaScript',
          },
        ],
      }) as TypeScriptStrictness;

      if (p.isCancel(tsStrictness)) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }
    } else {
      tsStrictness = 'strict';
    }
  }

  // ====================
  // 6. CSS FRAMEWORK (only for web/full presets)
  // ====================
  let cssFramework: CSSFramework | undefined = getOptionValue<CSSFramework>(
    'BUNKIT_CSS_FRAMEWORK',
    options.cssFramework
  );

  if (!cssFramework && (preset === 'web' || preset === 'full')) {
    if (!isNonInteractive) {
      cssFramework = await p.select({
        message: '🎨 CSS framework?',
        options: [
          {
            value: 'tailwind',
            label: 'Tailwind CSS 4 (Recommended)',
            hint: 'Utility-first, fast, modern - with OKLCH colors and @theme',
          },
          {
            value: 'vanilla',
            label: 'Vanilla CSS',
            hint: 'Plain CSS files - full control, no framework',
          },
          {
            value: 'css-modules',
            label: 'CSS Modules',
            hint: 'Scoped CSS - automatic class name generation',
          },
        ],
      }) as CSSFramework;

      if (p.isCancel(cssFramework)) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }
    } else {
      cssFramework = 'tailwind';
    }
  }

  // ====================
  // 7. UI LIBRARY (only for web/full presets with Tailwind)
  // ====================
  let uiLibrary: UILibrary | undefined = getOptionValue<UILibrary>(
    'BUNKIT_UI_LIBRARY',
    options.uiLibrary
  );

  if (!uiLibrary && (preset === 'web' || preset === 'full') && cssFramework === 'tailwind') {
    if (!isNonInteractive) {
      uiLibrary = await p.select({
        message: '🧩 UI component library?',
        options: [
          {
            value: 'shadcn',
            label: 'shadcn/ui (Recommended)',
            hint: '64+ components, accessible, customizable - production-ready',
          },
          {
            value: 'none',
            label: 'None',
            hint: "I'll build my own components",
          },
        ],
      }) as UILibrary;

      if (p.isCancel(uiLibrary)) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }
    } else {
      uiLibrary = 'shadcn';
    }
  }

  // ====================
  // 7a. SHADCN/UI STYLE (only if shadcn/ui selected)
  // ====================
  let shadcnStyle: ShadcnStyle | undefined = getOptionValue<ShadcnStyle>(
    'BUNKIT_SHADCN_STYLE',
    options.shadcnStyle
  );

  if (!shadcnStyle && uiLibrary === 'shadcn') {
    if (!isNonInteractive) {
      shadcnStyle = await p.select({
        message: '🎨 shadcn/ui style?',
        options: [
          {
            value: 'new-york',
            label: 'New York (Recommended)',
            hint: 'Modern, clean design with rounded corners and subtle shadows',
          },
          {
            value: 'default',
            label: 'Default',
            hint: 'Classic design with sharper edges and more contrast',
          },
        ],
      }) as ShadcnStyle;

      if (p.isCancel(shadcnStyle)) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }
    } else {
      shadcnStyle = 'new-york';
    }
  }

  // ====================
  // 7b. SHADCN/UI BASE COLOR (only if shadcn/ui selected)
  // ====================
  let shadcnBaseColor: ShadcnBaseColor | undefined = getOptionValue<ShadcnBaseColor>(
    'BUNKIT_SHADCN_BASE_COLOR',
    options.shadcnBaseColor
  );

  if (!shadcnBaseColor && uiLibrary === 'shadcn') {
    if (!isNonInteractive) {
      shadcnBaseColor = await p.select({
        message: '🎨 shadcn/ui base color?',
        options: [
          {
            value: 'zinc',
            label: 'Zinc (Recommended)',
            hint: 'Neutral gray - versatile and modern',
          },
          {
            value: 'neutral',
            label: 'Neutral',
            hint: 'Pure neutral - no color cast',
          },
          {
            value: 'gray',
            label: 'Gray',
            hint: 'Warm gray - slightly warmer than zinc',
          },
          {
            value: 'slate',
            label: 'Slate',
            hint: 'Cool gray - slightly bluer tone',
          },
          {
            value: 'stone',
            label: 'Stone',
            hint: 'Warm beige-gray - earthy and natural',
          },
        ],
      }) as ShadcnBaseColor;

      if (p.isCancel(shadcnBaseColor)) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }
    } else {
      shadcnBaseColor = 'zinc';
    }
  }

  // ====================
  // 7c. SHADCN/UI RADIUS (only if shadcn/ui selected)
  // ====================
  let shadcnRadius: string | undefined = getOptionValue<string>(
    'BUNKIT_SHADCN_RADIUS',
    options.shadcnRadius
  );

  if (!shadcnRadius && uiLibrary === 'shadcn') {
    if (!isNonInteractive) {
      const radiusInput = await p.text({
        message: '📐 Border radius?',
        placeholder: '0.625rem',
        initialValue: '0.625rem',
        validate: (value) => {
          if (!value.trim()) {
            return 'Radius cannot be empty';
          }
          // Basic validation for CSS values
          if (!/^\d+(\.\d+)?(rem|px|em|%)$/.test(value.trim())) {
            return 'Please enter a valid CSS value (e.g., 0.5rem, 8px)';
          }
        },
      });

      if (p.isCancel(radiusInput)) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }

      shadcnRadius = radiusInput as string;
    } else {
      shadcnRadius = '0.625rem';
    }
  }

  // ====================
  // 8. TESTING FRAMEWORK
  // ====================
  let testing = getOptionValue<TestingFramework>(
    'BUNKIT_TESTING',
    options.testing,
    'bun-test' // Default to bun:test
  );

  if (!testing) {
    if (!isNonInteractive) {
      testing = await p.select({
        message: '🧪 Testing framework?',
        options: [
          {
            value: 'bun-test',
            label: 'Bun Test (Recommended)',
            hint: 'Built-in, fast, Jest-compatible - no extra dependencies',
          },
          {
            value: 'vitest',
            label: 'Vitest',
            hint: 'Vite-powered, fast, ESM-first - popular in ecosystem',
          },
          {
            value: 'none',
            label: 'None',
            hint: "I'll add testing later",
          },
        ],
      }) as TestingFramework;

      if (p.isCancel(testing)) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }
    } else {
      testing = 'bun-test';
    }
  }

  // ====================
  // 9. DOCKER SUPPORT
  // ====================
  let docker = getOptionValue<boolean>(
    'BUNKIT_DOCKER',
    options.docker,
    false
  );

  if (docker === undefined) {
    if (!isNonInteractive) {
      docker = await p.confirm({
        message: '🐳 Add Docker configuration?',
        initialValue: false,
      }) as boolean;

      if (p.isCancel(docker)) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }
    } else {
      docker = false;
    }
  }

  // ====================
  // 10. CI/CD
  // ====================
  let cicd = getOptionValue<boolean>(
    'BUNKIT_CICD',
    options.cicd,
    false
  );

  if (cicd === undefined) {
    if (!isNonInteractive) {
      cicd = await p.confirm({
        message: '⚙️  Add GitHub Actions CI/CD?',
        initialValue: false,
      }) as boolean;

      if (p.isCancel(cicd)) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }
    } else {
      cicd = false;
    }
  }

  // ====================
  // 11. INSTALL DEPENDENCIES
  // ====================
  let shouldInstall = getOptionValue<boolean>(
    'BUNKIT_INSTALL',
    options.install,
    true
  );

  if (shouldInstall === undefined) {
    if (!isNonInteractive) {
      shouldInstall = await p.confirm({
        message: '📥 Install dependencies?',
        initialValue: true,
      }) as boolean;

      if (p.isCancel(shouldInstall)) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }
    } else {
      shouldInstall = true;
    }
  }

  // ====================
  // 12. GIT INIT
  // ====================
  let shouldInitGit = getOptionValue<boolean>(
    'BUNKIT_GIT',
    options.git,
    true
  );

  if (shouldInitGit === undefined) {
    if (!isNonInteractive) {
      shouldInitGit = await p.confirm({
        message: '🔧 Initialize git repository?',
        initialValue: true,
      }) as boolean;

      if (p.isCancel(shouldInitGit)) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }
    } else {
      shouldInitGit = true;
    }
  }

  // ====================
  // SHOW CONFIGURATION SUMMARY
  // ====================
  if (!isNonInteractive) {
    const summaryLines = [
      `${chalk.bold('Project:')} ${chalk.cyan(projectName)}`,
      `${chalk.bold('Preset:')} ${chalk.cyan(preset)}`,
      database ? `${chalk.bold('Database:')} ${chalk.cyan(database)}` : '',
      `${chalk.bold('Code Quality:')} ${chalk.cyan(codeQuality)}`,
      `${chalk.bold('TypeScript:')} ${chalk.cyan(tsStrictness)}`,
      cssFramework ? `${chalk.bold('CSS:')} ${chalk.cyan(cssFramework)}` : '',
      uiLibrary ? `${chalk.bold('UI Library:')} ${chalk.cyan(uiLibrary)}` : '',
      // shadcn/ui specific options
      uiLibrary === 'shadcn' && shadcnStyle ? `${chalk.bold('shadcn Style:')} ${chalk.cyan(shadcnStyle)}` : '',
      uiLibrary === 'shadcn' && shadcnBaseColor ? `${chalk.bold('shadcn Base Color:')} ${chalk.cyan(shadcnBaseColor)}` : '',
      uiLibrary === 'shadcn' && shadcnRadius ? `${chalk.bold('shadcn Radius:')} ${chalk.cyan(shadcnRadius)}` : '',
      `${chalk.bold('Testing:')} ${chalk.cyan(testing)}`,
      docker ? `${chalk.bold('Docker:')} ${chalk.green('✓')}` : '',
      cicd ? `${chalk.bold('CI/CD:')} ${chalk.green('✓')}` : '',
    ].filter(Boolean);

    console.log('\n' + boxen(
      summaryLines.join('\n'),
      {
        padding: 1,
        title: '📋 Configuration',
        titleAlignment: 'left',
        borderColor: 'cyan',
        borderStyle: 'round',
      }
    ));

    const confirm = await p.confirm({
      message: 'Proceed with this configuration?',
      initialValue: true,
    });

    if (p.isCancel(confirm) || !confirm) {
      p.cancel('Operation cancelled.');
      process.exit(0);
    }
  }

  // ====================
  // CREATE PROJECT
  // ====================
  const s = p.spinner();
  s.start('🔨 Creating project structure...');

  try {
    const config: ProjectConfig = {
      name: projectName as string,
      preset: preset as PresetType,
      path: projectName as string,
      git: shouldInitGit as boolean,
      install: shouldInstall as boolean,
      database,
      codeQuality: codeQuality as CodeQualityType,
      tsStrictness: tsStrictness as TypeScriptStrictness,
      uiLibrary,
      cssFramework,
      testing: testing as TestingFramework,
      docker: docker as boolean,
      cicd: cicd as boolean,
      envExample: true,
      pathAliases: true,
      // shadcn/ui specific options
      shadcnStyle,
      shadcnBaseColor,
      shadcnRadius,
    };

    await createProject(config);

    const projectPath = join(process.cwd(), config.path);
    const context = createTemplateContext(config);

    s.message('📝 Generating files...');

    switch (preset) {
      case 'minimal':
        await buildMinimalPreset(projectPath, context);
        break;
      case 'web':
        await buildWebPreset(projectPath, context);
        break;
      case 'api':
        await buildApiPreset(projectPath, context);
        break;
      case 'full':
        await buildFullPreset(projectPath, context);
        break;
    }

    // Additional setup based on options
    if (database && database !== 'none') {
      s.message(`🗄️  Setting up ${database}...`);
      // Database setup will be handled in template builders
    }

    if (codeQuality === 'ultracite') {
      s.message('🤖 Configuring Ultracite for AI editors...');
      // Ultracite setup will be handled in template builders
    }

    if (docker) {
      s.message('🐳 Adding Docker configuration...');
      // Docker setup will be handled in template builders
    }

    if (cicd) {
      s.message('⚙️  Adding GitHub Actions...');
      // CI/CD setup will be handled in template builders
    }

    s.stop('✅ Project created!');

    // Calculate additional dependencies based on configuration
    // NOTE: For 'full' preset (monorepo), dependencies are handled by workspace catalog
    // Only install additional deps for single-repo presets
    if (shouldInstall && preset !== 'full') {
      const additionalDeps: Record<string, string> = {};

      // Database dependencies
      if (database && database !== 'none') {
        Object.assign(additionalDeps, getDatabaseDependencies(database));
      }

      // Code quality dependencies
      if (codeQuality) {
        Object.assign(additionalDeps, getCodeQualityDependencies(codeQuality));
      }

      // Testing framework dependencies
      if (testing === 'vitest') {
        additionalDeps['vitest'] = VERSIONS.vitest;
        additionalDeps['@vitest/ui'] = VERSIONS['@vitest/ui'];
      }

      // UI library dependencies
      if (uiLibrary === 'shadcn') {
        additionalDeps['class-variance-authority'] = VERSIONS['class-variance-authority'];
        additionalDeps['clsx'] = VERSIONS.clsx;
        additionalDeps['tailwind-merge'] = VERSIONS['tailwind-merge'];
      }

      // Install base dependencies + additional ones
      if (Object.keys(additionalDeps).length > 0) {
        await installDependencies(projectPath, additionalDeps);
      } else {
        await installDependencies(projectPath);
      }
    } else if (shouldInstall && preset === 'full') {
      // For monorepo, just run bun install to install from catalog
      await installDependencies(projectPath);
    }

    // Install default shadcn/ui components if shadcn/ui is configured
    if (shouldInstall && uiLibrary === 'shadcn' && (preset === 'web' || preset === 'full')) {
      s.message('🧩 Installing default shadcn/ui components...');
      try {
        if (preset === 'full') {
          // For monorepos, install components in packages/ui
          await installDefaultShadcnComponents(join(projectPath, 'packages/ui'), {
            silent: true,
          });
        } else {
          // For single-repo, install in project root
          await installDefaultShadcnComponents(projectPath, {
            silent: true,
          });
        }
        s.message('✅ Default components (button, card) installed');
      } catch (error) {
        // Non-critical - user can install manually
        s.message('⚠️  Could not install default components automatically');
        s.message('   Install them manually: bunx shadcn@latest add button card');
      }
    }

    const getDevCommand = () => {
      if (preset === 'full' || preset === 'web') return 'bun dev';
      return 'bun run dev';
    };

    const nextSteps = [
      `${chalk.cyan('cd')} ${projectName}`,
      shouldInstall ? '' : `${chalk.cyan('bun install')}`,
      `${chalk.cyan(getDevCommand())} ${chalk.dim('# Start development')}`,
    ].filter(Boolean).join('\n');

    console.log('\n' + boxen(nextSteps, {
      padding: 1,
      title: '🚀 Next steps',
      titleAlignment: 'left',
      borderColor: 'green',
      borderStyle: 'round',
    }));
  } catch (error) {
    s.stop('❌ Failed to create project');
    p.cancel(`${pc.red('Error:')} ${(error as Error).message}`);
    process.exit(1);
  }
}
