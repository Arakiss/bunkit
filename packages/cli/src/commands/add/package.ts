import * as p from '@clack/prompts';
import pc from 'picocolors';
import { join } from 'pathe';
import {
  detectMonorepo,
  addWorkspaceToRoot,
  workspaceExists,
  validateWorkspaceName,
  ensureDirectory,
  installDependencies,
  type PackageType,
} from '@bunkit/core';

/**
 * Options for package command
 */
export interface PackageOptions {
  name?: string;
  type?: PackageType;
  cwd?: string;
}

/**
 * Generate package files based on type
 */
async function generatePackageFiles(
  packagePath: string,
  packageName: string,
  type: PackageType
): Promise<void> {
  const { writeFile } = await import('@bunkit/core');

  // Create src directory
  await ensureDirectory(join(packagePath, 'src'));

  // Generate appropriate index.ts based on type
  let indexContent = '';

  switch (type) {
    case 'library':
      indexContent = `/**
 * ${packageName} - Shared library
 */

export function example() {
  return 'Hello from ${packageName}';
}

// Add your library functions here
`;
      break;

    case 'utils':
      indexContent = `/**
 * ${packageName} - Utility functions
 */

export function formatDate(date: Date): string {
  return date.toISOString();
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Add your utility functions here
`;
      break;

    case 'types':
      indexContent = `/**
 * ${packageName} - Shared types
 */

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
}

export interface ApiResponse<T = unknown> {
  data: T;
  error?: string;
  timestamp: Date;
}

// Add your types here
`;
      break;

    case 'config':
      indexContent = `/**
 * ${packageName} - Configuration
 */

export const config = {
  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

// Add your configuration here
`;
      break;
  }

  await writeFile(join(packagePath, 'src/index.ts'), indexContent);

  // tsconfig.json
  const tsconfigContent = {
    extends: '../../tsconfig.json',
    compilerOptions: {
      target: 'ESNext',
      module: 'ESNext',
      moduleResolution: 'bundler',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      resolveJsonModule: true,
      declaration: true,
      declarationMap: true,
      outDir: './dist',
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist'],
  };

  await writeFile(
    join(packagePath, 'tsconfig.json'),
    JSON.stringify(tsconfigContent, null, 2)
  );

  // README.md
  const readmeContent = `# ${packageName}

Shared ${type} package in monorepo.

## Installation

This package is part of the monorepo and is automatically available to all workspaces.

## Usage

\`\`\`typescript
import { example } from '${packageName}';
\`\`\`

## Development

\`\`\`bash
bun run build
\`\`\`
`;

  await writeFile(join(packagePath, 'README.md'), readmeContent);
}

/**
 * Add shared package to monorepo
 */
export async function addPackageCommand(options: PackageOptions = {}) {
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

    // Get package name
    let packageName = options.name;

    if (!packageName) {
      const nameInput = await p.text({
        message: 'Package name (e.g., @myapp/email or utils):',
        placeholder: '@myapp/email',
        validate: (value) => {
          if (!value) return 'Package name is required';
          // Extract name from scope if provided
          const name = value.startsWith('@') ? value.split('/')[1] : value;
          if (name) {
            const validation = validateWorkspaceName(name);
            if (!validation.valid) return validation.error;
          }
          return undefined;
        },
      });

      if (p.isCancel(nameInput)) {
        p.cancel('Operation cancelled');
        process.exit(0);
      }

      packageName = nameInput as string;
    }

    // Parse package name (handle scoped packages)
    let scope: string | undefined;
    let name: string;

    if (packageName.startsWith('@')) {
      const parts = packageName.split('/');
      scope = parts[0].substring(1); // Remove @
      name = parts[1];
    } else {
      name = packageName;
    }

    // Construct workspace path
    const workspacePath = `packages/${name}`;
    const fullPackageName = scope ? `@${scope}/${name}` : name;

    // Check if package already exists
    if (await workspaceExists(workspacePath, cwd)) {
      p.log.error(`Package "${fullPackageName}" already exists`);
      process.exit(1);
    }

    // Get package type
    let type = options.type;

    if (!type) {
      const typeChoice = await p.select({
        message: 'Choose package type:',
        options: [
          { value: 'library', label: 'Library', hint: 'Shared code/components' },
          { value: 'utils', label: 'Utils', hint: 'Utility functions' },
          { value: 'types', label: 'Types', hint: 'TypeScript types' },
          { value: 'config', label: 'Config', hint: 'Configuration' },
        ],
      });

      if (p.isCancel(typeChoice)) {
        p.cancel('Operation cancelled');
        process.exit(0);
      }

      type = typeChoice as PackageType;
    }

    // Create package directory
    spinner.start('Creating package structure...');
    const packagePath = join(cwd, workspacePath);
    await ensureDirectory(packagePath);

    // Generate package files
    await generatePackageFiles(packagePath, fullPackageName, type);
    spinner.stop('Package structure created');

    // Create package.json
    spinner.start('Generating package.json...');
    const packageJsonContent = {
      name: fullPackageName,
      version: '0.0.0',
      private: true,
      type: 'module',
      main: './src/index.ts',
      types: './src/index.ts',
      exports: {
        '.': './src/index.ts',
      },
      scripts: {
        build: 'tsc',
        test: 'bun test',
      },
      devDependencies: {
        '@types/bun': 'latest',
        typescript: 'catalog:',
      },
    };

    const { writeFile: write } = await import('@bunkit/core');
    await write(
      join(packagePath, 'package.json'),
      JSON.stringify(packageJsonContent, null, 2) + '\n'
    );
    spinner.stop('package.json generated');

    // Add to root workspaces
    spinner.start('Updating monorepo configuration...');
    await addWorkspaceToRoot(workspacePath, cwd);
    spinner.stop('Monorepo configuration updated');

    // Install dependencies
    spinner.start('Installing dependencies...');
    await installDependencies(cwd, {});
    spinner.stop('Dependencies installed');

    // Success message
    p.log.success(`Package "${fullPackageName}" created successfully!`);

    // Show next steps
    p.note(
      `${pc.bold('Next steps:')}

${pc.bold('1. Use in other workspaces:')}
   ${pc.cyan(`import { example } from '${fullPackageName}'`)}

${pc.bold('2. Add to workspace dependencies:')}
   ${pc.dim('// In apps/web/package.json')}
   ${pc.cyan('"dependencies": {')}
   ${pc.cyan(`  "${fullPackageName}": "workspace:*"`)}
   ${pc.cyan('}')}

${pc.bold('3. Develop the package:')}
   ${pc.cyan(`cd ${workspacePath}`)}
   ${pc.cyan('# Edit src/index.ts')}

${pc.bold('Package info:')}
  Name: ${fullPackageName}
  Type: ${type}
  Path: ${workspacePath}`,
      pc.green('Package ready!')
    );
  } catch (error) {
    spinner.stop('Failed');
    throw error;
  }
}
