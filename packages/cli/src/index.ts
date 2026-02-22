#!/usr/bin/env bun
import { showBanner } from '@bunkit/core';
import { log, outro } from '@clack/prompts';
import { Command } from 'commander';
import pc from 'picocolors';
import { addCommand } from './commands/add';
import { catalogAddCommand, catalogListCommand, catalogSyncCommand } from './commands/catalog';
import { createCommand } from './commands/create';
import { enhancedInitCommand } from './commands/init.enhanced';
import { migrateCommand } from './commands/migrate';
import { deletePresetCommand, listPresetsCommand } from './commands/preset';

// Read version from package.json
const packageJson = await Bun.file(new URL('../package.json', import.meta.url)).json();
const VERSION = packageJson.version;

const program = new Command();

program
  .name('bunkit')
  .description('Bake production-ready apps in seconds | Modern CLI for Bun-powered projects')
  .version(VERSION)
  .usage('<command> [options]')
  .addHelpText(
    'after',
    `
Examples:
  $ bunkit init                    Create a new project interactively
  $ bunkit create nextjs my-app    Create a Next.js web application
  $ bunkit add workspace           Add a new workspace to monorepo
  $ bunkit add component --all     Browse and add shadcn/ui components
  $ bunkit migrate radix           Migrate to unified radix-ui package
  $ bunkit catalog add zod ^3.24.1 Add package to dependency catalog
  $ bunkit preset list             List all custom presets

For more information, visit: https://github.com/Arakiss/bunkit
  `
  );

program
  .command('init')
  .description('Create a new project with full customization options')
  .alias('i')
  .option('--name <name>', 'Project name (kebab-case recommended, e.g., my-awesome-app)')
  .option(
    '--preset <preset>',
    'Project preset: minimal | nextjs | hono-api | nextjs-monorepo | bun-monorepo'
  )
  .option(
    '--enterprise',
    'Enable enterprise features (additional apps/services, only for nextjs-monorepo)'
  )
  .option(
    '--theme <theme>',
    'Theme preset: modern-clean | bold-vibrant | minimalist | elegant | custom'
  )
  .option(
    '--database <database>',
    'Database option: postgres-drizzle | postgres-prisma | mysql-drizzle | mysql-prisma | supabase | supabase-drizzle | supabase-prisma | sqlite-drizzle | sqlite-prisma | none'
  )
  .option('--auth <auth>', 'Authentication system: better-auth | nextauth | supabase | none')
  .option('--redis', 'Enable Redis cache/session store')
  .option('--use-bun-secrets', 'Use Bun.secrets API instead of .env files')
  .option(
    '--supabase-preset <preset>',
    'Supabase configuration preset: full-stack | auth-only | database-only | custom'
  )
  .option(
    '--supabase-features <features>',
    'Comma-separated Supabase features: auth,storage,realtime,edge-functions,database'
  )
  .option('--code-quality <tool>', 'Code quality tool: ultracite | biome')
  .option('--ts-strictness <level>', 'TypeScript strictness level: strict | moderate | loose')
  .option('--ui-library <library>', 'UI component library: shadcn | none')
  .option('--css-framework <framework>', 'CSS framework: tailwind | vanilla | css-modules')
  .option(
    '--shadcn-style <style>',
    'shadcn/ui style: radix-maia | radix-vega | radix-nova | radix-lyra | radix-mira | base-maia | base-vega | base-nova | base-lyra | base-mira | new-york | default'
  )
  .option('--shadcn-base <base>', 'shadcn/ui component foundation: radix | base-ui')
  .option(
    '--shadcn-base-color <color>',
    'shadcn/ui base color theme: zinc | slate | stone | gray | neutral'
  )
  .option('--shadcn-icon-library <library>', 'shadcn/ui icon library: phosphor | lucide | iconoir')
  .option('--shadcn-menu-accent <accent>', 'shadcn/ui menu accent style: subtle | bold')
  .option('--shadcn-menu-color <color>', 'shadcn/ui menu color: default | muted')
  .option('--shadcn-radius <radius>', 'shadcn/ui border radius (CSS value, e.g., 0.5rem, 0.625rem)')
  .option('--shadcn-rtl', 'Enable RTL (right-to-left) support for shadcn/ui components')
  .option('--testing <framework>', 'Testing framework: bun-test | vitest | none')
  .option('--docker', 'Include Docker configuration files')
  .option('--cicd', 'Include GitHub Actions CI/CD workflow')
  .option('--no-git', 'Skip Git repository initialization')
  .option('--no-install', 'Skip dependency installation after project creation')
  .option('--non-interactive', 'Run in non-interactive mode (requires all options via flags)')
  .option('--save-preset <name>', 'Save current configuration as a custom preset')
  .option('--load-preset <name>', 'Load configuration from a custom preset')
  .addHelpText(
    'after',
    `
Examples:
  $ bunkit init                                            Interactive project creation
  $ bunkit init --name my-app --preset nextjs              Quick web app
  $ bunkit init --preset nextjs-monorepo --enterprise      Enterprise monorepo
  $ bunkit init --preset nextjs --theme bold-vibrant       Web app with bold theme

Presets (v2.0.0):
  minimal             Single-file Bun project
  nextjs              Next.js 16 + React 19 web application
  hono-api            Hono 4 + Bun.serve() API server
  nextjs-monorepo     Next.js + Hono monorepo (--enterprise for additional apps/services)
  bun-monorepo        Bun.serve() monorepo (no Next.js)

Themes:
  modern-clean        Radix Maia + Zinc + Iconoir (default)
  bold-vibrant        Radix Vega + Neutral + Iconoir
  minimalist          Radix Nova + Slate + Iconoir
  elegant             Radix Lyra + Stone + Iconoir
  custom              Choose individual shadcn/ui options

Deprecated aliases (still work):
  web → nextjs, api → hono-api, full → nextjs-monorepo, monorepo-bun → bun-monorepo
  `
  )
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
  .argument(
    '<preset>',
    'Project preset: minimal | nextjs | hono-api | nextjs-monorepo | bun-monorepo'
  )
  .argument('<name>', 'Project name (kebab-case recommended)')
  .option('--no-git', 'Skip Git repository initialization')
  .option('--no-install', 'Skip dependency installation after project creation')
  .option('--enterprise', 'Enable enterprise features (only for nextjs-monorepo)')
  .option(
    '--theme <theme>',
    'Theme preset: modern-clean | bold-vibrant | minimalist | elegant (default: modern-clean)'
  )
  .description('Quick project creation with sensible defaults (non-interactive)')
  .addHelpText(
    'after',
    `
Examples:
  $ bunkit create nextjs my-app                          Create Next.js web app
  $ bunkit create hono-api my-api                       Create Hono API server
  $ bunkit create nextjs-monorepo my-saas               Create full-stack monorepo
  $ bunkit create nextjs-monorepo my-saas --enterprise  Enterprise monorepo
  $ bunkit create minimal my-tool                       Create minimal Bun project

Deprecated aliases: web → nextjs, api → hono-api, full → nextjs-monorepo

Note: This command uses sensible defaults. Use 'bunkit init' for full customization.
  `
  )
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

// Preset management commands
const presetCmd = new Command('preset').description('Manage custom presets').addHelpText(
  'after',
  `
Subcommands:
  save [name]      Save current configuration as preset
  list             List all custom presets
  delete [name]    Delete a custom preset

Examples:
  $ bunkit preset save my-api-preset
  $ bunkit preset list
  $ bunkit preset delete my-api-preset
  
Custom presets allow you to save and reuse project configurations.
  `
);

presetCmd
  .command('save')
  .argument('[name]', 'Preset name')
  .description('Save current configuration as a custom preset')
  .action(async (_name) => {
    showBanner(VERSION);
    try {
      // This would need to be called from init command context
      // For now, show a helpful message
      log.info('To save a preset, use: bunkit init --save-preset <name>');
      log.info('Or complete an init flow and choose to save at the end.');
    } catch (error) {
      log.error((error as Error).message);
      outro(pc.red('❌ Failed to save preset'));
      process.exit(1);
    }
  });

presetCmd
  .command('list')
  .description('List all custom presets')
  .action(async () => {
    showBanner(VERSION);
    try {
      await listPresetsCommand();
    } catch (error) {
      log.error((error as Error).message);
      outro(pc.red('❌ Failed to list presets'));
      process.exit(1);
    }
  });

presetCmd
  .command('delete')
  .argument('[name]', 'Preset name')
  .description('Delete a custom preset')
  .action(async (name) => {
    showBanner(VERSION);
    try {
      await deletePresetCommand(name);
    } catch (error) {
      log.error((error as Error).message);
      outro(pc.red('❌ Failed to delete preset'));
      process.exit(1);
    }
  });

program.addCommand(presetCmd);

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
  .addHelpText(
    'after',
    `
Examples:
  $ bunkit add workspace --name apps/admin --preset nextjs
  $ bunkit add package --name @myapp/utils --type utils
  $ bunkit add component --components button,card,input
  $ bunkit add component --all
  
Features:
  workspace   Add a new workspace to monorepo (app or package)
  package     Add a shared package to monorepo
  component   Add shadcn/ui components (requires shadcn/ui setup)
  `
  )
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

program
  .command('migrate')
  .argument('[type]', 'Migration type: radix | rtl | icons')
  .description('Run shadcn/ui migrations (unified radix-ui, RTL, icon library)')
  .addHelpText(
    'after',
    `
Examples:
  $ bunkit migrate             Interactive migration selection
  $ bunkit migrate radix       Migrate to unified radix-ui package
  $ bunkit migrate rtl         Enable RTL support in components
  $ bunkit migrate icons       Migrate icon library

Migrations:
  radix    Replace @radix-ui/react-* packages with unified radix-ui
  rtl      Add RTL class transforms to installed components
  icons    Migrate between icon libraries (lucide, iconoir, phosphor)
  `
  )
  .action(async (migrationType) => {
    showBanner(VERSION);
    try {
      await migrateCommand(migrationType);
      outro(pc.green('Migration completed successfully!'));
    } catch (error) {
      log.error((error as Error).message);
      outro(pc.red('Migration failed'));
      process.exit(1);
    }
  });

// Catalog management commands
const catalogCmd = new Command('catalog')
  .alias('cat')
  .description('Manage dependency catalog for version synchronization')
  .addHelpText(
    'after',
    `
Subcommands:
  add <package> [version]   Add package to catalog
  sync                      Sync catalog versions across workspaces
  list                      List all packages in catalog

Examples:
  $ bunkit catalog add zod ^3.24.1
  $ bunkit catalog add hono ^4.10.6
  $ bunkit catalog sync
  $ bunkit catalog list
  
The catalog allows you to centralize dependency versions in monorepos.
Use "catalog:" in package.json dependencies to reference catalog versions.
  `
  );

catalogCmd
  .command('add')
  .argument('[package]', 'Package name (e.g., zod, hono, @prisma/client)')
  .option('--version <version>', 'Package version (e.g., ^3.24.1, latest)')
  .description('Add package to dependency catalog')
  .action(async (packageName, options) => {
    showBanner(VERSION);
    try {
      await catalogAddCommand({
        package: packageName,
        version: options.version,
      });
      outro(pc.green('✨ Package added to catalog!'));
    } catch (error) {
      log.error((error as Error).message);
      outro(pc.red('❌ Failed to add package to catalog'));
      process.exit(1);
    }
  });

catalogCmd
  .command('sync')
  .description('Sync catalog versions across all workspaces in monorepo')
  .action(async () => {
    showBanner(VERSION);
    try {
      await catalogSyncCommand();
      outro(pc.green('✨ Catalog synced!'));
    } catch (error) {
      log.error((error as Error).message);
      outro(pc.red('❌ Failed to sync catalog'));
      process.exit(1);
    }
  });

catalogCmd
  .command('list')
  .description('List all packages in dependency catalog')
  .action(async () => {
    showBanner(VERSION);
    try {
      await catalogListCommand();
    } catch (error) {
      log.error((error as Error).message);
      outro(pc.red('❌ Failed to list catalog'));
      process.exit(1);
    }
  });

program.addCommand(catalogCmd);

// Show banner when no command is provided
if (
  process.argv.length === 2 ||
  (process.argv.length === 3 && (process.argv[2] === '--help' || process.argv[2] === '-h'))
) {
  showBanner(VERSION);
}

program.parse();
