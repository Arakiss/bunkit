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
} from '@bunkit/core';
import {
  buildMinimalPreset,
  buildWebPreset,
  buildApiPreset,
  buildFullPreset,
} from '@bunkit/templates';

/**
 * Options for non-interactive init command
 * Priority: env vars > CLI flags > prompts
 */
export interface InitOptions {
  name?: string;
  preset?: PresetType;
  git?: boolean;
  install?: boolean;
  nonInteractive?: boolean;
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
 * Initialize a new project (supports interactive and non-interactive modes)
 *
 * Environment variables (highest priority):
 * - BUNKIT_PROJECT_NAME: Project name
 * - BUNKIT_PRESET: Preset type (minimal, web, api, full)
 * - BUNKIT_GIT: Initialize git (true/false)
 * - BUNKIT_INSTALL: Install dependencies (true/false)
 * - BUNKIT_NON_INTERACTIVE: Skip all prompts (true/false)
 *
 * CLI flags (medium priority):
 * - --name: Project name
 * - --preset: Preset type
 * - --git / --no-git: Initialize git
 * - --install / --no-install: Install dependencies
 * - --non-interactive: Skip all prompts
 *
 * Interactive prompts (lowest priority):
 * - Used when env vars and flags are not provided
 */
export async function initCommand(options: InitOptions = {}) {
  // Check if running in non-interactive mode
  const isNonInteractive =
    process.env.BUNKIT_NON_INTERACTIVE === 'true' ||
    options.nonInteractive === true;

  // Get project name (env > flag > prompt)
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
    // Validate project name when provided via env/flag
    const result = validateProjectName(projectName);
    if (!result.valid) {
      throw new Error(`Invalid project name: ${result.error}`);
    }
  }

  // Get preset (env > flag > prompt)
  let preset = getOptionValue<PresetType>(
    'BUNKIT_PRESET',
    options.preset
  );

  if (!preset) {
    if (isNonInteractive) {
      throw new Error(
        'Preset is required in non-interactive mode. ' +
        'Provide it via BUNKIT_PRESET env var or --preset flag. ' +
        'Valid values: minimal, web, api, full'
      );
    }

    preset = await p.select({
      message: '🎨 Which preset would you like?',
      options: [
        {
          value: 'minimal',
          label: '⚡ Minimal',
          hint: 'Single repo, clean start',
        },
        {
          value: 'web',
          label: '🌐 Web',
          hint: 'Next.js 16 + React 19',
        },
        {
          value: 'api',
          label: '🚀 API',
          hint: 'Hono + Bun.serve()',
        },
        {
          value: 'full',
          label: '📦 Full-stack',
          hint: 'Monorepo with everything',
        },
      ],
    }) as PresetType;

    if (p.isCancel(preset)) {
      p.cancel('Operation cancelled.');
      process.exit(0);
    }
  } else {
    // Validate preset when provided via env/flag
    const validPresets = ['minimal', 'web', 'api', 'full'];
    if (!validPresets.includes(preset)) {
      throw new Error(
        `Invalid preset: ${preset}. Valid values: ${validPresets.join(', ')}`
      );
    }
  }

  // Get install preference (env > flag > prompt)
  let shouldInstall = getOptionValue<boolean>(
    'BUNKIT_INSTALL',
    options.install,
    true // Default to true
  );

  if (shouldInstall === undefined) {
    if (isNonInteractive) {
      shouldInstall = true; // Default to true in non-interactive mode
    } else {
      shouldInstall = await p.confirm({
        message: '📥 Install dependencies?',
        initialValue: true,
      }) as boolean;

      if (p.isCancel(shouldInstall)) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }
    }
  }

  // Get git preference (env > flag > prompt)
  let shouldInitGit = getOptionValue<boolean>(
    'BUNKIT_GIT',
    options.git,
    true // Default to true
  );

  if (shouldInitGit === undefined) {
    if (isNonInteractive) {
      shouldInitGit = true; // Default to true in non-interactive mode
    } else {
      shouldInitGit = await p.confirm({
        message: '🔧 Initialize git repository?',
        initialValue: true,
      }) as boolean;

      if (p.isCancel(shouldInitGit)) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }
    }
  }

  // Show configuration in non-interactive mode
  if (isNonInteractive) {
    console.log('\n📋 Configuration:');
    console.log(`  Project: ${pc.cyan(projectName)}`);
    console.log(`  Preset: ${pc.cyan(preset)}`);
    console.log(`  Install dependencies: ${pc.cyan(shouldInstall ? 'yes' : 'no')}`);
    console.log(`  Initialize git: ${pc.cyan(shouldInitGit ? 'yes' : 'no')}`);
    console.log('');
  }

  const s = p.spinner();
  s.start('🔨 Creating project structure...');

  try {
    const config: ProjectConfig = {
      name: projectName as string,
      preset: preset as PresetType,
      path: projectName as string,
      git: shouldInitGit as boolean,
      install: shouldInstall as boolean,

      // Default values for new options (backward compatibility)
      codeQuality: 'biome',
      tsStrictness: 'strict',
      testing: 'bun-test',
      docker: false,
      cicd: false,
      envExample: true,
      pathAliases: true,
    };

    // Create base project
    await createProject(config);

    // Build preset-specific files
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

    s.stop('✅ Project created!');

    // Install dependencies
    if (shouldInstall) {
      const deps = getDependenciesForPreset(preset as string);
      if (Object.keys(deps).length > 0) {
        await installDependencies(projectPath, deps);
      } else {
        await installDependencies(projectPath);
      }
    }

    const getDevCommand = () => {
      if (preset === 'full' || preset === 'web') return 'bun dev';
      return 'bun run dev';
    };

    const getPresetEmoji = () => {
      switch (preset) {
        case 'minimal': return '⚡';
        case 'web': return '🌐';
        case 'api': return '🚀';
        case 'full': return '📦';
        default: return '🍞';
      }
    };

    // Show next steps with boxen for consistent cross-platform rendering
    const nextSteps = [
      `${chalk.cyan('cd')} ${projectName}`,
      shouldInstall ? '' : `${chalk.cyan('bun install')}`,
      `${chalk.cyan(getDevCommand())} ${chalk.dim('# Start development')}`,
    ]
      .filter(Boolean)
      .join('\n');

    console.log('\n' + boxen(nextSteps, {
      padding: 1,
      title: `${getPresetEmoji()} Next steps`,
      titleAlignment: 'left',
      borderColor: 'cyan',
      borderStyle: 'round',
    }));
  } catch (error) {
    s.stop('❌ Failed to create project');
    p.cancel(`${pc.red('Error:')} ${(error as Error).message}`);
    process.exit(1);
  }
}

function getDependenciesForPreset(preset: string): Record<string, string> {
  switch (preset) {
    case 'web':
      return {
        'react': 'catalog:',
        'react-dom': 'catalog:',
        'next': 'catalog:',
        'tailwindcss': 'catalog:',
        '@tailwindcss/postcss': 'catalog:',
      };
    case 'api':
      return {
        'hono': 'catalog:',
      };
    case 'full':
      return {}; // Handled by workspace installs
    default:
      return {};
  }
}
