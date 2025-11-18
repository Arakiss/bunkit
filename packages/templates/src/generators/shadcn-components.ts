import { execa } from 'execa';
import { join } from 'pathe';
import { logger } from '@bunkit/core';
import { writeFile, ensureDirectory } from '@bunkit/core';

/**
 * Default components to install when shadcn/ui is configured
 * These are the most commonly used components that provide immediate value
 */
export const DEFAULT_SHADCN_COMPONENTS = [
  'button',
  'card',
] as const;

/**
 * Install shadcn/ui components using the official CLI
 */
export async function installShadcnComponents(
  projectPath: string,
  components: string[],
  options: {
    silent?: boolean;
    cwd?: string;
  } = {}
): Promise<void> {
  const cwd = options.cwd || projectPath;
  const stdio = options.silent ? 'pipe' : 'inherit';

  try {
    // Use bunx to run shadcn CLI (works with Bun)
    await execa('bunx', ['shadcn@latest', 'add', ...components], {
      cwd,
      stdio,
    });
  } catch (error) {
    // If bunx fails, try with npx as fallback
    try {
      await execa('npx', ['shadcn@latest', 'add', ...components], {
        cwd,
        stdio,
      });
    } catch (fallbackError) {
      logger.warn(
        `Could not install shadcn components automatically. You can install them manually with: bunx shadcn@latest add ${components.join(' ')}`
      );
      // Don't throw - this is not critical, user can install manually
    }
  }
}

/**
 * Install default shadcn/ui components
 */
export async function installDefaultShadcnComponents(
  projectPath: string,
  options: {
    silent?: boolean;
    skipDefaults?: boolean;
  } = {}
): Promise<void> {
  if (options.skipDefaults) {
    return;
  }

  logger.step('Installing default shadcn/ui components...');

  try {
    await installShadcnComponents(
      projectPath,
      [...DEFAULT_SHADCN_COMPONENTS],
      {
        silent: options.silent,
        cwd: projectPath,
      }
    );
    logger.success('Default components installed');
  } catch (error) {
    // Non-critical - user can install manually
    logger.warn(
      'Could not install default components automatically. Install them manually with: bunx shadcn@latest add button card'
    );
  }
}

/**
 * Create example component usage file
 */
export async function createShadcnExample(
  projectPath: string,
  isMonorepo: boolean = false
): Promise<void> {
  const examplePath = isMonorepo
    ? join(projectPath, 'apps/web/src/components/example.tsx')
    : join(projectPath, 'src/components/example.tsx');

  const exampleContent = `"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

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
            You can start building your UI by importing components from @/components/ui
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
  } catch (error) {
    // Non-critical - skip if fails
  }
}

