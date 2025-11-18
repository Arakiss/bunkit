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
  .description('Bake production-ready apps in seconds | Modern CLI for Bun-powered projects')
  .version(VERSION)
  .usage('<command> [options]')
  .addHelpText('after', `
Examples:
  $ bunkit init                    Create a new project interactively
  $ bunkit create web my-app       Create a Next.js web application
  $ bunkit add workspace           Add a new workspace to monorepo
  $ bunkit add component --all     Browse and add shadcn/ui components

For more information, visit: https://github.com/Arakiss/bunkit
  `);

program
  .command('init')
  .description('Create a new project with full customization options')
  .alias('i')
  .option('--name <name>', 'Project name (kebab-case recommended, e.g., my-awesome-app)')
  .option('--preset <preset>', 'Project preset: minimal | web | api | full')
  .option('--database <database>', 'Database option: postgres-drizzle | supabase | supabase-drizzle | sqlite-drizzle | none')
  .option('--supabase-preset <preset>', 'Supabase configuration preset: full-stack | auth-only | database-only | custom')
  .option('--supabase-features <features>', 'Comma-separated Supabase features: auth,storage,realtime,edge-functions,database')
  .option('--code-quality <tool>', 'Code quality tool: ultracite | biome')
  .option('--ts-strictness <level>', 'TypeScript strictness level: strict | moderate | loose')
  .option('--ui-library <library>', 'UI component library: shadcn | none')
  .option('--css-framework <framework>', 'CSS framework: tailwind | vanilla | css-modules')
  .option('--shadcn-style <style>', 'shadcn/ui component style: new-york | default')
  .option('--shadcn-base-color <color>', 'shadcn/ui base color theme: neutral | gray | zinc | stone | slate')
  .option('--shadcn-radius <radius>', 'shadcn/ui border radius (CSS value, e.g., 0.5rem, 8px)')
  .option('--testing <framework>', 'Testing framework: bun-test | vitest | none')
  .option('--docker', 'Include Docker configuration files')
  .option('--cicd', 'Include GitHub Actions CI/CD workflow')
  .option('--no-git', 'Skip Git repository initialization')
  .option('--no-install', 'Skip dependency installation after project creation')
  .option('--non-interactive', 'Run in non-interactive mode (requires all options via flags)')
  .addHelpText('after', `
Examples:
  $ bunkit init                                    Interactive project creation
  $ bunkit init --name my-app --preset web        Quick web app creation
  $ bunkit init --preset full --database supabase Full-stack with Supabase
  
Presets:
  minimal  Single-file project, clean start
  web      Next.js 16 + React 19 web application
  api      Hono API server with Bun.serve()
  full     Full-stack monorepo (web + api + packages)
  `)
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
  .alias('c')
  .argument('<preset>', 'Project preset: minimal | web | api | full')
  .argument('<name>', 'Project name (kebab-case recommended)')
  .option('--no-git', 'Skip Git repository initialization')
  .option('--no-install', 'Skip dependency installation after project creation')
  .description('Quick project creation with sensible defaults (non-interactive)')
  .addHelpText('after', `
Examples:
  $ bunkit create web my-app          Create Next.js web application
  $ bunkit create api my-api          Create Hono API server
  $ bunkit create full my-saas        Create full-stack monorepo
  $ bunkit create minimal my-tool      Create minimal Bun project
  
Note: This command uses sensible defaults. Use 'bunkit init' for full customization.
  `)
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
  .alias('a')
  .argument('<feature>', 'Feature type: workspace | package | component')
  .option('--name <name>', 'Feature name (e.g., apps/admin, @myapp/utils, button)')
  .option('--preset <preset>', 'Workspace preset: nextjs | hono | library')
  .option('--type <type>', 'Package type: library | utils | types | config')
  .option('--components <components>', 'Comma-separated component names (e.g., button,card,input)')
  .option('--all', 'Show interactive component browser (for component feature)')
  .description('Add workspace, shared package, or shadcn/ui component to existing project')
  .addHelpText('after', `
Examples:
  $ bunkit add workspace --name apps/admin --preset nextjs
  $ bunkit add package --name @myapp/utils --type utils
  $ bunkit add component --components button,card,input
  $ bunkit add component --all
  
Features:
  workspace   Add a new workspace to monorepo (app or package)
  package     Add a shared package to monorepo
  component   Add shadcn/ui components (requires shadcn/ui setup)
  `)
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
      // Success message is handled in the command itself
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
