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

  const s = p.spinner();
  s.start(`Creating ${preset} project: ${name}`);

  try {
    // Create project with sensible defaults
    const config: ProjectConfig = {
      name,
      preset: preset as PresetType,
      path: name,
      git: options.git !== false, // Default: true
      install: options.install !== false, // Default: true
      database: 'none', // Default: no database
      codeQuality: 'biome', // Default: biome
      tsStrictness: 'strict', // Default: strict TypeScript
      testing: 'bun-test', // Default: bun's built-in test
      docker: false, // Default: no Docker
      cicd: false, // Default: no CI/CD
      envExample: true,
      pathAliases: true,
    };

    s.message('🔨 Creating project structure...');
    await createProject(config);

    const projectPath = join(process.cwd(), config.path);
    const context = createTemplateContext(config);

    s.message('📝 Generating files...');

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

    s.stop(`Project ${name} created!`);

    // Show next steps
    const nextSteps = [
      `${chalk.cyan('cd')} ${name}`,
      chalk.cyan(preset === 'web' ? 'bun dev' : 'bun run dev'),
    ].join('\n');

    console.log('\n' + boxen(nextSteps, {
      padding: 1,
      title: '📋 Next steps',
      titleAlignment: 'left',
      borderColor: 'cyan',
      borderStyle: 'round',
    }));
  } catch (error) {
    s.stop('❌ Project creation failed');
    throw error;
  }
}
