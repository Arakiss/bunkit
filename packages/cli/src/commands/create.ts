import * as p from '@clack/prompts';
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
 * Quick, non-interactive project creation command
 * Uses sensible defaults for faster scaffolding
 */
export async function createCommand(
  preset: string,
  name: string,
  options: { git?: boolean; install?: boolean }
) {
  // Validate preset
  const validPresets = ['minimal', 'web', 'api', 'full'];
  if (!validPresets.includes(preset)) {
    throw new Error(
      `Invalid preset: ${preset}. Valid options: ${validPresets.join(', ')}`
    );
  }

  // Validate project name
  const validation = validateProjectName(name);
  if (!validation.valid) {
    throw new Error(`Invalid project name: ${validation.error}`);
  }

  console.log(''); // Add spacing
  
  const s = p.spinner();
  s.start(`${chalk.cyan('🔨')} Creating ${preset} project: ${chalk.bold(name)}`);

  try {
    // Create project with sensible defaults
    const config: ProjectConfig = {
      name,
      preset: preset as PresetType,
      path: name,
      git: options.git !== false, // Default: true
      install: options.install !== false, // Default: true
      database: 'none', // Default: no database
      redis: false, // Default: no Redis
      useBunSecrets: false, // Default: use .env
      codeQuality: 'biome', // Default: biome
      tsStrictness: 'strict', // Default: strict TypeScript
      testing: 'bun-test', // Default: bun's built-in test
      docker: false, // Default: no Docker
      cicd: false, // Default: no CI/CD
      envExample: true,
      pathAliases: true,
    };

    s.message(`${chalk.cyan('📁')} Creating project structure...`);
    await createProject(config);

    const projectPath = join(process.cwd(), config.path);
    const context = createTemplateContext(config);

    s.message(`${chalk.cyan('📝')} Generating project files...`);

    // Build preset-specific files
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

    s.message(`${chalk.cyan('✨')} Finalizing setup...`);
    s.stop(`${chalk.green('✅')} Project ${chalk.bold(name)} created successfully!`);

    const getPresetEmoji = () => {
      switch (preset) {
        case 'minimal': return '⚡';
        case 'web': return '🌐';
        case 'api': return '🚀';
        case 'full': return '📦';
        default: return '✨';
      }
    };

    // Show next steps with better formatting
    const nextStepsContent = [
      `${chalk.bold.cyan('📁 Navigate to your project')}`,
      `${chalk.cyan('cd')} ${chalk.bold(name)}`,
      '',
      options.install === false ? [
        `${chalk.bold.cyan('📦 Install dependencies')}`,
        `${chalk.cyan('bun install')}`,
        '',
      ].join('\n') : '',
      `${chalk.bold.cyan('🚀 Start development')}`,
      `${chalk.cyan(preset === 'web' ? 'bun dev' : 'bun run dev')} ${chalk.dim('# Start development server')}`,
      '',
      `${chalk.dim('─'.repeat(40))}`,
      `${chalk.bold.yellow('💡 Tip')}`,
      `  Use ${chalk.cyan('bunkit init')} for full customization options`,
    ].filter(Boolean).join('\n');

    console.log('\n' + boxen(nextStepsContent, {
      padding: { top: 1, bottom: 1, left: 2, right: 2 },
      title: `${getPresetEmoji()} Next Steps`,
      titleAlignment: 'left',
      borderColor: 'green',
      borderStyle: 'round',
      dimBorder: false,
    }));
  } catch (error) {
    s.stop(`${chalk.red('❌')} Project creation failed`);
    
    const errorBox = [
      `${chalk.bold.red('Error occurred')}`,
      '',
      chalk.red((error as Error).message),
      '',
      `${chalk.dim('Need help?')} ${chalk.cyan('https://github.com/Arakiss/bunkit/issues')}`,
    ].join('\n');

    console.log('\n' + boxen(errorBox, {
      padding: { top: 1, bottom: 1, left: 2, right: 2 },
      borderColor: 'red',
      borderStyle: 'round',
    }));

    throw error;
  }
}
