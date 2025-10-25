import * as p from '@clack/prompts';
import pc from 'picocolors';
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

export async function initCommand() {
  const projectName = await p.text({
    message: '📦 What is your project named?',
    placeholder: 'my-awesome-project',
    validate: (value) => {
      const result = validateProjectName(value);
      if (!result.valid) return result.error;
    },
  });

  if (p.isCancel(projectName)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }

  const preset = await p.select({
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
        hint: 'Next.js 15 + React 19',
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
  });

  if (p.isCancel(preset)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }

  const shouldInstall = await p.confirm({
    message: '📥 Install dependencies?',
    initialValue: true,
  });

  if (p.isCancel(shouldInstall)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }

  const shouldInitGit = await p.confirm({
    message: '🔧 Initialize git repository?',
    initialValue: true,
  });

  if (p.isCancel(shouldInitGit)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
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
      if (deps.length > 0) {
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

    p.note(
      [
        `${pc.cyan('cd')} ${projectName}`,
        shouldInstall ? '' : `${pc.cyan('bun install')}`,
        `${pc.cyan(getDevCommand())} ${pc.dim('# Start development')}`,
      ]
        .filter(Boolean)
        .join('\n'),
      `${getPresetEmoji()} Next steps`
    );
  } catch (error) {
    s.stop('❌ Failed to create project');
    p.cancel(`${pc.red('Error:')} ${(error as Error).message}`);
    process.exit(1);
  }
}

function getDependenciesForPreset(preset: string): string[] {
  switch (preset) {
    case 'web':
      return ['react@19.1.0', 'react-dom@19.1.0', 'next@15.5.6', 'tailwindcss@4.1.7'];
    case 'api':
      return ['hono@4.7.12'];
    case 'full':
      return []; // Handled by workspace installs
    default:
      return [];
  }
}
