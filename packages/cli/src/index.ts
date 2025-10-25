#!/usr/bin/env bun
import { Command } from 'commander';
import { intro, outro } from '@clack/prompts';
import pc from 'picocolors';
import { initCommand } from './commands/init';
import { createCommand } from './commands/create';
import { addCommand } from './commands/add';

const program = new Command();

program
  .name('bunkit')
  .description('Bake production-ready apps in seconds')
  .version('0.1.0');

program
  .command('init')
  .description('Create a new project interactively')
  .action(async () => {
    intro(pc.bgCyan(pc.black(' bunkit ')));
    await initCommand();
    outro(pc.green('Done! Happy coding! 🍞'));
  });

program
  .command('create')
  .argument('<preset>', 'Preset type (minimal, web, api, full)')
  .argument('<name>', 'Project name')
  .option('--no-git', 'Skip git initialization')
  .option('--no-install', 'Skip dependency installation')
  .description('Create a new project quickly')
  .action(async (preset, name, options) => {
    intro(pc.bgCyan(pc.black(' bunkit ')));
    await createCommand(preset, name, options);
    outro(pc.green('Done! Happy coding! 🍞'));
  });

program
  .command('add')
  .argument('<feature>', 'Feature to add (auth, database, ui, payments, email, storage)')
  .option('--provider <provider>', 'Provider to use')
  .description('Add a feature to existing project')
  .action(async (feature, options) => {
    intro(pc.bgCyan(pc.black(' bunkit ')));
    await addCommand(feature, options);
    outro(pc.green('Done! Happy coding! 🍞'));
  });

program.parse();
