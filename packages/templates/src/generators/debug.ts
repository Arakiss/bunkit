import { join } from 'pathe';
import { writeFile, ensureDirectory, type TemplateContext } from '@bunkit/core';

/**
 * Setup VSCode debugging configuration for Bun
 */
export async function setupVSCodeDebug(
  projectPath: string,
  context: TemplateContext,
  preset: 'minimal' | 'web' | 'api' | 'full' = 'api'
): Promise<void> {
  const vscodePath = join(projectPath, '.vscode');
  await ensureDirectory(vscodePath);

  // Launch configuration based on preset
  const getLaunchConfig = () => {
    switch (preset) {
      case 'minimal':
      case 'api':
        return {
          version: '0.2.0',
          configurations: [
            {
              name: 'Debug Bun',
              type: 'bun',
              request: 'launch',
              program: preset === 'minimal' ? '${workspaceFolder}/src/index.ts' : '${workspaceFolder}/src/index.ts',
              cwd: '${workspaceFolder}',
              env: {},
              stopOnEntry: false,
            },
            {
              name: 'Debug Bun (Break on Start)',
              type: 'bun',
              request: 'launch',
              program: preset === 'minimal' ? '${workspaceFolder}/src/index.ts' : '${workspaceFolder}/src/index.ts',
              cwd: '${workspaceFolder}',
              env: {},
              stopOnEntry: true,
            },
            {
              name: 'Attach to Bun',
              type: 'bun',
              request: 'attach',
              url: 'ws://localhost:6499',
            },
          ],
        };
      case 'web':
        return {
          version: '0.2.0',
          configurations: [
            {
              name: 'Debug Next.js',
              type: 'bun',
              request: 'launch',
              program: '${workspaceFolder}/node_modules/.bin/next',
              args: ['dev', '--turbopack'],
              cwd: '${workspaceFolder}',
              env: {},
            },
          ],
        };
      case 'full':
        return {
          version: '0.2.0',
          configurations: [
            {
              name: 'Debug API',
              type: 'bun',
              request: 'launch',
              program: '${workspaceFolder}/apps/api/src/index.ts',
              cwd: '${workspaceFolder}/apps/api',
              env: {},
              stopOnEntry: false,
            },
            {
              name: 'Debug API (Break on Start)',
              type: 'bun',
              request: 'launch',
              program: '${workspaceFolder}/apps/api/src/index.ts',
              cwd: '${workspaceFolder}/apps/api',
              env: {},
              stopOnEntry: true,
            },
            {
              name: 'Attach to Bun',
              type: 'bun',
              request: 'attach',
              url: 'ws://localhost:6499',
            },
          ],
        };
      default:
        return {
          version: '0.2.0',
          configurations: [],
        };
    }
  };

  const launchConfig = getLaunchConfig();
  await writeFile(
    join(vscodePath, 'launch.json'),
    JSON.stringify(launchConfig, null, 2)
  );

  // Settings for better Bun development experience
  const settings = {
    'files.associations': {
      '*.ts': 'typescript',
      '*.tsx': 'typescriptreact',
    },
    'typescript.tsdk': 'node_modules/typescript/lib',
    'typescript.enablePromptUseWorkspaceTsdk': true,
    '[typescript]': {
      'editor.defaultFormatter': 'biomejs.biome',
      'editor.formatOnSave': true,
    },
    '[typescriptreact]': {
      'editor.defaultFormatter': 'biomejs.biome',
      'editor.formatOnSave': true,
    },
    '[json]': {
      'editor.defaultFormatter': 'biomejs.biome',
      'editor.formatOnSave': true,
    },
  };

  await writeFile(
    join(vscodePath, 'settings.json'),
    JSON.stringify(settings, null, 2)
  );

  // Extensions recommendations
  const extensions = {
    recommendations: [
      'oven.bun-vscode',
      'biomejs.biome',
      'dbaeumer.vscode-eslint',
    ],
  };

  await writeFile(
    join(vscodePath, 'extensions.json'),
    JSON.stringify(extensions, null, 2)
  );
}

