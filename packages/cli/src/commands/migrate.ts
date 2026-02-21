/**
 * bunkit migrate command
 *
 * Wraps shadcn CLI v3.8.5 migrate subcommand for common migration tasks:
 * - radix: Migrate to unified radix-ui package
 * - rtl: Enable RTL support in components
 * - icons: Migrate icon library (e.g., lucide → iconoir)
 *
 * Auto-detects monorepo structure and runs migrations in the correct directory.
 */

import { existsSync } from 'node:fs';
import * as p from '@clack/prompts';
import chalk from 'chalk';
import { join } from 'pathe';

type MigrationType = 'radix' | 'rtl' | 'icons';

const VALID_MIGRATIONS: MigrationType[] = ['radix', 'rtl', 'icons'];

const MIGRATION_DESCRIPTIONS: Record<MigrationType, string> = {
  radix: 'Migrate to unified radix-ui package (replaces @radix-ui/react-* packages)',
  rtl: 'Enable RTL (right-to-left) support in shadcn/ui components',
  icons: 'Migrate icon library (e.g., lucide to iconoir or phosphor)',
};

/**
 * Detect the shadcn/ui project root.
 * Looks for components.json in:
 * 1. packages/ui/ (monorepo)
 * 2. current directory (single repo)
 */
function detectShadcnRoot(projectPath: string): string | null {
  const monorepoPath = join(projectPath, 'packages/ui');
  if (existsSync(join(monorepoPath, 'components.json'))) {
    return monorepoPath;
  }

  if (existsSync(join(projectPath, 'components.json'))) {
    return projectPath;
  }

  return null;
}

/**
 * Run bun install to resolve catalog dependencies before migration.
 */
async function runBunInstall(projectPath: string): Promise<boolean> {
  const installSpinner = p.spinner();
  installSpinner.start('Resolving dependencies (bun install)...');

  try {
    const installProcess = Bun.spawn(['bun', 'install'], {
      cwd: projectPath,
      stdout: 'pipe',
      stderr: 'pipe',
    });
    await installProcess.exited;

    if (installProcess.exitCode !== 0) {
      const stderr = await new Response(installProcess.stderr).text();
      installSpinner.stop(chalk.red('Failed to install dependencies'));
      p.note(stderr, 'Error Details');
      return false;
    }

    installSpinner.stop(chalk.green('Dependencies resolved'));
    return true;
  } catch (error) {
    installSpinner.stop(chalk.red('Failed to install dependencies'));
    p.note(String(error), 'Error Details');
    return false;
  }
}

/**
 * Run the shadcn migrate command.
 */
async function runShadcnMigrate(
  shadcnRoot: string,
  migrationType: MigrationType
): Promise<boolean> {
  const migrateSpinner = p.spinner();
  migrateSpinner.start(`Running shadcn migrate ${migrationType}...`);

  try {
    const migrateProcess = Bun.spawn(['bunx', 'shadcn@latest', 'migrate', migrationType], {
      cwd: shadcnRoot,
      stdout: 'pipe',
      stderr: 'pipe',
    });
    await migrateProcess.exited;

    if (migrateProcess.exitCode !== 0) {
      const stderr = await new Response(migrateProcess.stderr).text();
      migrateSpinner.stop(chalk.red(`Migration failed: ${migrationType}`));
      p.note(stderr, 'Error Details');
      return false;
    }

    migrateSpinner.stop(chalk.green(`Migration complete: ${migrationType}`));
    return true;
  } catch (error) {
    migrateSpinner.stop(chalk.red(`Migration failed: ${migrationType}`));
    p.note(String(error), 'Error Details');
    return false;
  }
}

/**
 * Show post-migration advice based on migration type.
 */
function showPostMigrationAdvice(migrationType: MigrationType, isMonorepo: boolean): void {
  const advice: string[] = [];

  switch (migrationType) {
    case 'radix':
      advice.push(
        'The unified radix-ui package replaces individual @radix-ui/react-* packages.',
        'Old packages can be removed from your package.json.',
        isMonorepo
          ? 'Check packages/ui/package.json and root catalog for cleanup.'
          : 'Check package.json for cleanup.',
        '',
        'Run: bun install   (to update lockfile)'
      );
      break;
    case 'rtl':
      advice.push(
        'RTL support has been added to your components.',
        'Class names have been transformed for RTL compatibility.',
        'components.json now includes "rtl": true.',
        '',
        'Set dir="rtl" on your <html> element to activate RTL layout.'
      );
      break;
    case 'icons':
      advice.push(
        'Icon imports have been updated in your components.',
        'Check components.json to verify the iconLibrary field.',
        '',
        'You may need to install the new icon package:',
        '  bun add iconoir-react       (bunkit default)',
        '  bun add @phosphor-icons/react',
        '  bun add lucide-react'
      );
      break;
  }

  if (advice.length > 0) {
    p.note(advice.join('\n'), 'Post-Migration');
  }
}

/**
 * Execute the migrate command.
 */
export async function migrateCommand(migrationType?: string): Promise<void> {
  // Validate migration type
  if (!migrationType) {
    // Interactive selection
    migrationType = (await p.select({
      message: 'Select migration type',
      options: VALID_MIGRATIONS.map((migration) => ({
        value: migration,
        label: migration,
        hint: MIGRATION_DESCRIPTIONS[migration],
      })),
    })) as string;

    if (p.isCancel(migrationType)) {
      p.cancel('Operation cancelled.');
      process.exit(0);
    }
  }

  if (!VALID_MIGRATIONS.includes(migrationType as MigrationType)) {
    throw new Error(
      `Invalid migration type: "${migrationType}". ` + `Valid types: ${VALID_MIGRATIONS.join(', ')}`
    );
  }

  const migration = migrationType as MigrationType;
  const projectPath = process.cwd();

  // Detect shadcn/ui project root
  const shadcnRoot = detectShadcnRoot(projectPath);

  if (!shadcnRoot) {
    throw new Error(
      'Could not find components.json. ' +
        'Run this command from a project with shadcn/ui configured, ' +
        'or from a monorepo root with packages/ui/components.json.'
    );
  }

  const isMonorepo = shadcnRoot !== projectPath;

  p.log.info(`${chalk.bold('Migration:')} ${migration} — ${MIGRATION_DESCRIPTIONS[migration]}`);
  p.log.info(
    `${chalk.bold('Location:')} ${isMonorepo ? 'packages/ui (monorepo)' : '(project root)'}`
  );

  // Step 1: Run bun install to resolve catalog dependencies
  const installSuccess = await runBunInstall(projectPath);
  if (!installSuccess) {
    throw new Error('Failed to resolve dependencies. Fix the errors above and try again.');
  }

  // Step 2: Run shadcn migrate
  const migrateSuccess = await runShadcnMigrate(shadcnRoot, migration);
  if (!migrateSuccess) {
    throw new Error(`Migration "${migration}" failed. Check the errors above.`);
  }

  // Step 3: Show post-migration advice
  showPostMigrationAdvice(migration, isMonorepo);
}
