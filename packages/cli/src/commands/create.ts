import {
  createProject,
  createTemplateContext,
  getDeprecatedAliasInfo,
  getRemovedPresetInfo,
  installDependencies,
  type PresetType,
  type ProjectConfig,
  resolveThemeToShadcnOptions,
  type ThemePresetName,
  validateProjectName,
} from '@bunkit/core';
import {
  buildApiPreset,
  buildFullPresetV2,
  buildMinimalPreset,
  buildMonorepoBunPreset,
  buildWebPreset,
  installDefaultShadcnComponents,
} from '@bunkit/templates';
import * as p from '@clack/prompts';
import boxen from 'boxen';
import chalk from 'chalk';
import { join } from 'pathe';

/**
 * Quick, non-interactive project creation command (v2.0.0)
 * Uses sensible defaults for faster scaffolding
 */
export async function createCommand(
  preset: string,
  name: string,
  options: { git?: boolean; install?: boolean; enterprise?: boolean; theme?: string }
) {
  // Check for removed presets first
  const removedInfo = getRemovedPresetInfo(preset);
  if (removedInfo) {
    throw new Error(`${removedInfo.message}\n\nSuggested alternative: ${removedInfo.suggestion}`);
  }

  // Check for deprecated aliases
  const aliasInfo = getDeprecatedAliasInfo(preset);
  if (aliasInfo) {
    p.log.warn(chalk.yellow(`⚠️  ${aliasInfo.warning}`));
    preset = aliasInfo.canonical;
  }

  // Normalize preset (handle remaining aliases)
  const presetMap: Record<string, string> = {
    web: 'nextjs',
    api: 'hono-api',
    full: 'nextjs-monorepo',
    'monorepo-nextjs': 'nextjs-monorepo',
    'monorepo-bun': 'bun-monorepo',
  };
  const normalizedPreset = presetMap[preset] || preset;

  // Validate preset (5 canonical names only)
  const validPresets = ['minimal', 'nextjs', 'hono-api', 'nextjs-monorepo', 'bun-monorepo'];
  if (!validPresets.includes(normalizedPreset)) {
    throw new Error(
      `Invalid preset: ${preset}. Valid options: ${validPresets.join(', ')}\n` +
        'Aliases: web → nextjs, api → hono-api, full → nextjs-monorepo, monorepo-bun → bun-monorepo'
    );
  }

  // Validate project name
  const validation = validateProjectName(name);
  if (!validation.valid) {
    throw new Error(`Invalid project name: ${validation.error}`);
  }

  console.log('');

  const spinner = p.spinner();
  const isEnterprise = options.enterprise === true && normalizedPreset === 'nextjs-monorepo';

  // Resolve theme (default to modern-clean for web presets)
  const presetSupportsWeb =
    normalizedPreset === 'nextjs' ||
    normalizedPreset === 'nextjs-monorepo' ||
    normalizedPreset === 'bun-monorepo';

  const themeName = (options.theme as ThemePresetName) || 'modern-clean';
  const resolvedTheme = presetSupportsWeb ? resolveThemeToShadcnOptions(themeName) : null;

  spinner.start(`${chalk.cyan('🔨')} Creating ${preset} project: ${chalk.bold(name)}`);

  try {
    const config: ProjectConfig = {
      name,
      preset: normalizedPreset as PresetType,
      path: name,
      git: options.git !== false,
      install: options.install !== false,
      enterprise: isEnterprise,
      theme: presetSupportsWeb ? themeName : undefined,
      database: 'none',
      redis: false,
      useBunSecrets: false,
      codeQuality: 'ultracite',
      tsStrictness: 'strict',
      testing: 'bun-test',
      docker: false,
      cicd: false,
      envExample: true,
      pathAliases: true,
      // Apply theme for web presets
      cssFramework: presetSupportsWeb ? 'tailwind' : undefined,
      uiLibrary: presetSupportsWeb ? 'shadcn' : undefined,
      shadcnStyle: resolvedTheme?.shadcnStyle,
      shadcnBaseColor: resolvedTheme?.shadcnBaseColor,
      shadcnIconLibrary: resolvedTheme?.shadcnIconLibrary,
      shadcnMenuAccent: resolvedTheme?.shadcnMenuAccent,
      shadcnMenuColor: resolvedTheme?.shadcnMenuColor,
      shadcnRadius: resolvedTheme?.shadcnRadius,
    };

    spinner.message(`${chalk.cyan('📁')} Creating project structure...`);
    await createProject(config);

    const projectPath = join(process.cwd(), config.path);
    const context = createTemplateContext(config);

    spinner.message(`${chalk.cyan('📝')} Generating project files...`);

    // Build preset-specific files (5 canonical presets)
    switch (normalizedPreset) {
      case 'minimal':
        await buildMinimalPreset(projectPath, context);
        break;
      case 'nextjs':
        await buildWebPreset(projectPath, context);
        break;
      case 'hono-api':
        await buildApiPreset(projectPath, context);
        break;
      case 'nextjs-monorepo':
        await buildFullPresetV2(projectPath, context);
        break;
      case 'bun-monorepo':
        await buildMonorepoBunPreset(projectPath, context);
        break;
    }

    spinner.message(`${chalk.cyan('✨')} Finalizing setup...`);

    // Install dependencies
    if (config.install !== false) {
      spinner.message(`${chalk.cyan('📦')} Installing dependencies...`);
      try {
        await installDependencies(projectPath);
      } catch (_error) {
        spinner.message(
          `${chalk.yellow('⚠️')} Dependency installation had issues, but continuing...`
        );
      }
    }

    // Install default shadcn/ui components for presets with shadcn/ui
    const isMonorepoPreset =
      normalizedPreset === 'nextjs-monorepo' || normalizedPreset === 'bun-monorepo';

    if (presetSupportsWeb && config.uiLibrary === 'shadcn' && config.install !== false) {
      spinner.message(`${chalk.cyan('🧩')} Installing default shadcn/ui components...`);
      try {
        const targetPath = isMonorepoPreset ? join(projectPath, 'packages/ui') : projectPath;
        await installDefaultShadcnComponents(targetPath, {
          silent: false,
          skipDefaults: false,
        });
      } catch (_error) {
        spinner.message(`${chalk.yellow('⚠️')} Could not install default components automatically`);
      }
    }

    spinner.stop(`${chalk.green('✅')} Project ${chalk.bold(name)} created successfully!`);

    const getPresetEmoji = () => {
      switch (normalizedPreset) {
        case 'minimal':
          return '⚡';
        case 'nextjs':
          return '🌐';
        case 'hono-api':
          return '🚀';
        case 'nextjs-monorepo':
          return isEnterprise ? '🏢' : '📦';
        case 'bun-monorepo':
          return '🔥';
        default:
          return '✨';
      }
    };

    const nextStepsContent = [
      `${chalk.bold.cyan('📁 Navigate to your project')}`,
      `${chalk.cyan('cd')} ${chalk.bold(name)}`,
      '',
      options.install === false
        ? [
            `${chalk.bold.cyan('📦 Install dependencies')}`,
            `${chalk.cyan('bun install')}`,
            '',
          ].join('\n')
        : '',
      `${chalk.bold.cyan('🚀 Start development')}`,
      `${chalk.cyan(normalizedPreset === 'nextjs' || isMonorepoPreset ? 'bun dev' : 'bun run dev')} ${chalk.dim('# Start development server')}`,
      '',
      `${chalk.dim('─'.repeat(40))}`,
      `${chalk.bold.yellow('💡 Tip')}`,
      `  Use ${chalk.cyan('bunkit init')} for full customization options`,
    ]
      .filter(Boolean)
      .join('\n');

    console.log(
      '\n' +
        boxen(nextStepsContent, {
          padding: { top: 1, bottom: 1, left: 2, right: 2 },
          title: `${getPresetEmoji()} Next Steps`,
          titleAlignment: 'left',
          borderColor: 'green',
          borderStyle: 'round',
          dimBorder: false,
        })
    );
  } catch (error) {
    spinner.stop(`${chalk.red('❌')} Project creation failed`);

    const errorBox = [
      `${chalk.bold.red('Error occurred')}`,
      '',
      chalk.red((error as Error).message),
      '',
      `${chalk.dim('Need help?')} ${chalk.cyan('https://github.com/Arakiss/bunkit/issues')}`,
    ].join('\n');

    console.log(
      '\n' +
        boxen(errorBox, {
          padding: { top: 1, bottom: 1, left: 2, right: 2 },
          borderColor: 'red',
          borderStyle: 'round',
        })
    );

    throw error;
  }
}
