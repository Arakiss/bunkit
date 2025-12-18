import { ensureDirectory, logger, writeFile } from '@bunkit/core';
import { execa } from 'execa';
import { join } from 'pathe';

/**
 * Default components to install when shadcn/ui is configured
 * These are the most commonly used components that provide immediate value
 */
export const DEFAULT_SHADCN_COMPONENTS = ['button', 'card'] as const;

/**
 * Install shadcn/ui components using the official CLI
 * Adapted for Bun monorepos - components are installed in packages/ui for monorepos
 */
export async function installShadcnComponents(
  projectPath: string,
  components: string[],
  options: {
    silent?: boolean;
    cwd?: string;
    isMonorepo?: boolean;
  } = {}
): Promise<void> {
  const cwd = options.cwd || projectPath;
  const stdio = options.silent ? 'pipe' : 'inherit';

  // Ensure we're in the correct directory (packages/ui for monorepo)
  const targetCwd = options.isMonorepo ? join(projectPath, 'packages/ui') : cwd;

  // CRITICAL: Install dependencies with Bun first to resolve catalog: references
  // shadcn CLI internally uses npm which doesn't understand Bun's catalog: protocol
  // By installing with Bun first, all catalog: dependencies are resolved to actual versions
  try {
    logger.debug('Installing dependencies with Bun before running shadcn CLI...');
    await execa('bun', ['install'], {
      cwd: options.isMonorepo ? projectPath : targetCwd,
      stdio: options.silent ? 'pipe' : 'inherit',
      env: {
        ...process.env,
        BUN_INSTALL_LINKER: 'isolated',
      },
    });
  } catch (installError) {
    logger.warn(`Failed to install dependencies with Bun: ${(installError as Error).message}`);
    // Continue anyway - shadcn might still work if dependencies are already installed
  }

  try {
    // Use bunx to run shadcn CLI (works with Bun)
    // Bun 1.3 supports bunx natively and works perfectly with shadcn CLI
    await execa('bunx', ['shadcn@latest', 'add', ...components], {
      cwd: targetCwd,
      stdio,
      env: {
        ...process.env,
        // Ensure Bun workspace resolution works correctly
        BUN_INSTALL_LINKER: 'isolated',
        // Force npm to use Bun's node_modules resolution
        npm_config_force: 'true',
      },
    });

    // After installation, update the components index file for monorepo
    if (options.isMonorepo) {
      await updateComponentsIndex(join(targetCwd, 'src/components'));
    }
  } catch (_error) {
    // If bunx fails, try with npx as fallback
    // But note: npx will fail if catalog: dependencies aren't resolved
    try {
      await execa('npx', ['shadcn@latest', 'add', ...components], {
        cwd: targetCwd,
        stdio,
      });

      if (options.isMonorepo) {
        await updateComponentsIndex(join(targetCwd, 'src/components'));
      }
    } catch (fallbackError) {
      logger.warn(
        `Could not install shadcn components automatically. You can install them manually with: cd ${targetCwd} && bun install && bunx shadcn@latest add ${components.join(' ')}`
      );
      throw fallbackError; // Re-throw so caller knows it failed
    }
  }
}

/**
 * Update components/index.ts to export newly added components
 * This makes components easier to import in monorepo apps
 */
async function updateComponentsIndex(componentsDir: string): Promise<void> {
  const indexPath = join(componentsDir, 'index.ts');
  const uiDir = join(componentsDir, 'ui');

  try {
    // Check if ui directory exists
    const { existsSync } = await import('node:fs');
    if (!existsSync(uiDir)) {
      logger.debug(`UI directory does not exist: ${uiDir}`);
      return;
    }

    // Find all component files (.tsx) in ui directory
    const { readdir } = await import('node:fs/promises');
    const entries = await readdir(uiDir, { withFileTypes: true });
    const componentFiles = entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.tsx'))
      .map((entry) => entry.name.replace('.tsx', ''))
      .sort(); // Sort alphabetically for consistent output

    if (componentFiles.length === 0) {
      logger.debug(`No component files found in ${uiDir}`);
      return;
    }

    // Generate exports
    const exports = componentFiles.map((comp) => `export * from './ui/${comp}';`).join('\n');

    // Update index file
    const newContent = `// Auto-generated exports for shadcn/ui components
// Components are installed via: bunkit add component --components [name]
// Or: bunx shadcn@latest add [name] (from packages/ui directory)

${exports}
`;

    await writeFile(indexPath, newContent);
    logger.debug(`Updated components index with ${componentFiles.length} components`);
  } catch (error) {
    // Non-critical - components still work without index updates
    logger.warn(`Could not update components index file: ${(error as Error).message}`);
  }
}

/**
 * Install default shadcn/ui components
 * Automatically detects if it's a monorepo and installs in packages/ui
 */
export async function installDefaultShadcnComponents(
  projectPath: string,
  options: {
    silent?: boolean;
    skipDefaults?: boolean;
    isMonorepo?: boolean;
  } = {}
): Promise<void> {
  if (options.skipDefaults) {
    return;
  }

  // Auto-detect monorepo if not explicitly set
  const isMonorepo =
    options.isMonorepo ??
    (await import('node:fs')).existsSync(
      (await import('pathe')).join(projectPath, 'packages/ui/components.json')
    );

  logger.step('Installing default shadcn/ui components...');

  try {
    await installShadcnComponents(projectPath, [...DEFAULT_SHADCN_COMPONENTS], {
      silent: options.silent,
      cwd: projectPath,
      isMonorepo,
    });
    logger.success('Default components installed');
  } catch (_error) {
    // Non-critical - user can install manually
    const manualCommand = isMonorepo
      ? 'cd packages/ui && bunx shadcn@latest add button card'
      : 'bunx shadcn@latest add button card';
    logger.warn(
      `Could not install default components automatically. Install them manually with: ${manualCommand}`
    );
  }
}

/**
 * Create example component usage file
 * Adapted for Bun monorepo - uses workspace imports for shared UI package
 */
export async function createShadcnExample(
  projectPath: string,
  isMonorepo: boolean = false,
  _packageName?: string
): Promise<void> {
  const examplePath = isMonorepo
    ? join(projectPath, 'apps/web/src/components/example.tsx')
    : join(projectPath, 'src/components/example.tsx');

  // Use workspace imports for monorepo, regular aliases for standalone
  const buttonImport = isMonorepo
    ? `import { Button } from "@workspace/ui/components/ui/button"`
    : `import { Button } from "@/components/ui/button"`;

  const cardImport = isMonorepo
    ? `import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/ui/card"`
    : `import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"`;

  const importHint = isMonorepo
    ? `// In monorepo, components are imported from @workspace/ui package
// This ensures all apps share the same UI components and Tailwind CSS v4 config`
    : `// Components are imported using the @ alias configured in tsconfig.json`;

  const exampleContent = `"use client"

${importHint}
${buttonImport}
${cardImport}

/**
 * Example component showcasing shadcn/ui components
 * This file demonstrates how to use Button and Card components
 * 
 * You can delete this file once you're familiar with the patterns.
 */
export function ExampleComponent() {
  return (
    <div className="container mx-auto p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to shadcn/ui</CardTitle>
          <CardDescription>
            This is an example component showing how to use shadcn/ui components.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            ${
              isMonorepo
                ? 'Components are shared via @workspace/ui package. Add more components with: bunkit add component --components [name]'
                : 'You can start building your UI by importing components from @/components/ui'
            }
          </p>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button>Get Started</Button>
          <Button variant="outline">Learn More</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
`;

  try {
    await ensureDirectory(join(examplePath, '..'));
    await writeFile(examplePath, exampleContent);
  } catch (_error) {
    // Non-critical - skip if fails
  }
}
