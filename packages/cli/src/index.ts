#!/usr/bin/env bun
import { Command } from 'commander';
import { outro, log } from '@clack/prompts';
import pc from 'picocolors';
import { showBanner } from '@bunkit/core';
import { enhancedInitCommand } from './commands/init.enhanced';
import { createCommand } from './commands/create';
import { addCommand } from './commands/add';

// Read version from package.json
const packageJson = await Bun.file(new URL('../package.json', import.meta.url)).json();
const VERSION = packageJson.version;

const program = new Command();

program
  .name('bunkit')
  .description('Bake production-ready apps in seconds')
  .version(VERSION);

program
  .command('init')
  .description('Create a new project with full customization')
  .option('--name <name>', 'Project name')
  .option('--preset <preset>', 'Preset type (minimal, web, api, full)')
  .option('--database <database>', 'Database (postgres-drizzle, supabase, sqlite-drizzle, none)')
  .option('--code-quality <quality>', 'Code quality (ultracite, biome)')
  .option('--ts-strictness <strictness>', 'TypeScript strictness (strict, moderate, loose)')
  .option('--ui-library <library>', 'UI library (shadcn, none)')
  .option('--css-framework <framework>', 'CSS framework (tailwind, vanilla, css-modules)')
  .option('--shadcn-style <style>', 'shadcn/ui style (new-york, default)')
  .option('--shadcn-base-color <color>', 'shadcn/ui base color (neutral, gray, zinc, stone, slate)')
  .option('--shadcn-radius <radius>', 'shadcn/ui border radius (e.g., 0.5rem, 8px)')
  .option('--testing <framework>', 'Testing framework (bun-test, vitest, none)')
  .option('--docker', 'Add Docker configuration')
  .option('--cicd', 'Add GitHub Actions CI/CD')
  .option('--no-git', 'Skip git initialization')
  .option('--no-install', 'Skip dependency installation')
  .option('--non-interactive', 'Run without prompts (requires all options)')
  .action(async (options) => {
    showBanner(VERSION);
    try {
      await enhancedInitCommand(options);
      outro(pc.green('✨ Done! Your project is ready to bake! 🍞'));
    } catch (error) {
      log.error((error as Error).message);
      outro(pc.red('❌ Project creation failed'));
      process.exit(1);
    }
  });

program
  .command('create')
  .argument('<preset>', 'Preset type (minimal, web, api, full)')
  .argument('<name>', 'Project name')
  .option('--no-git', 'Skip git initialization')
  .option('--no-install', 'Skip dependency installation')
  .description('Create a new project quickly')
  .action(async (preset, name, options) => {
    showBanner(VERSION);
    try {
      await createCommand(preset, name, options);
      outro(pc.green('✨ Done! Your project is ready to bake! 🍞'));
    } catch (error) {
      log.error((error as Error).message);
      outro(pc.red('❌ Project creation failed'));
      process.exit(1);
    }
  });

program
  .command('add')
  .argument('<feature>', 'Feature to add (workspace, package, component)')
  .option('--name <name>', 'Name for the feature')
  .option('--preset <preset>', 'Preset for workspace (nextjs, hono, library)')
  .option('--type <type>', 'Type for package (library, utils, types, config)')
  .option('--components <components>', 'Component names (comma-separated) for component feature')
  .option('--all', 'Show all available components (for component feature)')
  .description('Add workspace, package, or shadcn/ui component to project')
  .action(async (feature, options) => {
    showBanner(VERSION);
    try {
      // Parse components if provided as string
      const parsedOptions = {
        ...options,
        components:
          options.components && typeof options.components === 'string'
            ? options.components.split(',').map((c: string) => c.trim())
            : options.components,
      };
      await addCommand(feature, parsedOptions);
      outro(pc.green('✨ Feature added successfully! 🍞'));
    } catch (error) {
      log.error((error as Error).message);
      outro(pc.red('❌ Feature installation failed'));
      process.exit(1);
    }
  });

// Show banner when no command is provided
if (process.argv.length === 2 || (process.argv.length === 3 && (process.argv[2] === '--help' || process.argv[2] === '-h'))) {
  showBanner(VERSION);
}

program.parse();
