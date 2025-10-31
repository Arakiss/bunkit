import * as p from '@clack/prompts';
import pc from 'picocolors';
import { join } from 'pathe';
import {
  detectMonorepo,
  addWorkspaceToRoot,
  workspaceExists,
  getWorkspaceName,
  validateWorkspaceName,
  ensureDirectory,
  installDependencies,
  type WorkspacePreset,
} from '@bunkit/core';
import { buildWorkspace } from '@bunkit/templates';

/**
 * Options for workspace command
 */
export interface WorkspaceOptions {
  name?: string;
  preset?: WorkspacePreset;
  cwd?: string;
}

/**
 * Get dependencies for workspace preset
 */
function getWorkspaceDependencies(preset: WorkspacePreset): Record<string, string> {
  switch (preset) {
    case 'nextjs':
      return {
        react: 'catalog:',
        'react-dom': 'catalog:',
        next: 'catalog:',
      };
    case 'hono':
      return {
        hono: 'catalog:',
      };
    case 'library':
      return {};
    default:
      return {};
  }
}

/**
 * Get dev dependencies for workspace preset
 */
function getWorkspaceDevDependencies(preset: WorkspacePreset): Record<string, string> {
  switch (preset) {
    case 'nextjs':
      return {
        '@types/react': 'catalog:',
        '@types/react-dom': 'catalog:',
        '@types/node': 'catalog:',
        typescript: 'catalog:',
        tailwindcss: 'catalog:',
        '@tailwindcss/postcss': 'catalog:',
      };
    case 'hono':
      return {
        '@types/bun': 'latest',
        typescript: 'catalog:',
      };
    case 'library':
      return {
        '@types/bun': 'latest',
        typescript: 'catalog:',
      };
    default:
      return {};
  }
}

/**
 * Get scripts for workspace preset
 */
function getWorkspaceScripts(preset: WorkspacePreset): Record<string, string> {
  switch (preset) {
    case 'nextjs':
      return {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'biome check .',
        format: 'biome check --write .',
      };
    case 'hono':
      return {
        dev: 'bun run --hot src/index.ts',
        start: 'bun run src/index.ts',
        test: 'bun test',
      };
    case 'library':
      return {
        build: 'tsc',
        test: 'bun test',
      };
    default:
      return {};
  }
}

/**
 * Add workspace to monorepo
 */
export async function addWorkspaceCommand(options: WorkspaceOptions = {}) {
  const cwd = options.cwd || process.cwd();
  const spinner = p.spinner();

  try {
    // Detect if monorepo
    spinner.start('Detecting monorepo...');
    const monorepo = await detectMonorepo(cwd);
    spinner.stop();

    if (!monorepo.isMonorepo) {
      p.log.error('This command requires a monorepo. Run "bunkit init full" first.');
      process.exit(1);
    }

    // Get workspace name
    let workspaceName = options.name;

    if (!workspaceName) {
      const nameInput = await p.text({
        message: 'Workspace name (e.g., apps/admin or packages/email):',
        placeholder: 'apps/dashboard',
        validate: (value) => {
          if (!value) return 'Workspace name is required';
          // Validate format (must be path/name)
          if (!value.includes('/')) {
            return 'Workspace name must include path (e.g., apps/admin)';
          }
          const parts = value.split('/');
          const name = parts[parts.length - 1];
          const validation = validateWorkspaceName(name);
          if (!validation.valid) return validation.error;
          return undefined;
        },
      });

      if (p.isCancel(nameInput)) {
        p.cancel('Operation cancelled');
        process.exit(0);
      }

      workspaceName = nameInput as string;
    }

    // Check if workspace already exists
    if (await workspaceExists(workspaceName, cwd)) {
      p.log.error(`Workspace "${workspaceName}" already exists`);
      process.exit(1);
    }

    // Get preset
    let preset = options.preset;

    if (!preset) {
      const presetChoice = await p.select({
        message: 'Choose workspace preset:',
        options: [
          {
            value: 'nextjs',
            label: 'Next.js',
            hint: 'Next.js 16 + React 19 + Tailwind',
          },
          { value: 'hono', label: 'Hono API', hint: 'Fast API with Bun.serve()' },
          { value: 'library', label: 'Library', hint: 'Shared package' },
        ],
      });

      if (p.isCancel(presetChoice)) {
        p.cancel('Operation cancelled');
        process.exit(0);
      }

      preset = presetChoice as WorkspacePreset;
    }

    // Create workspace directory
    spinner.start('Creating workspace structure...');
    const workspacePath = join(cwd, workspaceName);
    await ensureDirectory(workspacePath);

    // Generate workspace files
    const parts = workspaceName.split('/');
    const name = parts[parts.length - 1];
    await buildWorkspace(workspacePath, name, preset);
    spinner.stop('Workspace structure created');

    // Create package.json
    spinner.start('Generating package.json...');
    const packageJsonContent = {
      name: getWorkspaceName(workspaceName),
      version: '0.0.0',
      private: true,
      type: 'module',
      scripts: getWorkspaceScripts(preset),
      dependencies: getWorkspaceDependencies(preset),
      devDependencies: getWorkspaceDevDependencies(preset),
    };

    const { writeFile: write } = await import('@bunkit/core');
    await write(
      join(workspacePath, 'package.json'),
      JSON.stringify(packageJsonContent, null, 2) + '\n'
    );
    spinner.stop('package.json generated');

    // Add to root workspaces
    spinner.start('Updating monorepo configuration...');
    await addWorkspaceToRoot(workspaceName, cwd);
    spinner.stop('Monorepo configuration updated');

    // Install dependencies
    spinner.start('Installing dependencies...');
    await installDependencies(cwd, {});
    spinner.stop('Dependencies installed');

    // Success message
    p.log.success(`Workspace "${workspaceName}" created successfully!`);

    // Show next steps
    const devCommand =
      preset === 'nextjs' ? 'next dev' : preset === 'hono' ? 'bun dev' : 'bun run build';

    p.note(
      `${pc.bold('Next steps:')}

  ${pc.cyan(`cd ${workspaceName}`)}
  ${pc.cyan(devCommand)}

${pc.bold('Workspace info:')}
  Name: ${getWorkspaceName(workspaceName)}
  Type: ${preset}
  Path: ${workspaceName}

${
  preset === 'library'
    ? `${pc.bold('Usage in other workspaces:')}
  import { example } from '${getWorkspaceName(workspaceName)}'`
    : ''
}`,
      pc.green('Workspace ready!')
    );
  } catch (error) {
    spinner.stop('Failed');
    throw error;
  }
}
