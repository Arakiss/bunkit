#!/usr/bin/env bun
import { Command } from 'commander';
import { intro, outro, log } from '@clack/prompts';
import pc from 'picocolors';
import { initCommand } from './commands/init.real';
import { createCommand } from './commands/create';
import { addCommand } from './commands/add';

const program = new Command();

program
  .name('bunkit')
  .description('Bake production-ready apps in seconds')
  .version('0.1.0-alpha.1');

program
  .command('init')
  .description('Create a new project interactively')
  .action(async () => {
    console.log('');
    intro(pc.bgCyan(pc.black(' 🍞 bunkit ')));
    try {
      await initCommand();
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
    console.log('');
    intro(pc.bgCyan(pc.black(' 🍞 bunkit ')));
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
  .argument('<feature>', 'Feature to add (auth, database, ui, payments, email, storage)')
  .option('--provider <provider>', 'Provider to use')
  .description('Add a feature to existing project')
  .action(async (feature, options) => {
    console.log('');
    intro(pc.bgCyan(pc.black(' 🍞 bunkit ')));
    try {
      await addCommand(feature, options);
      outro(pc.green('✨ Feature added successfully! 🍞'));
    } catch (error) {
      log.error((error as Error).message);
      outro(pc.red('❌ Feature installation failed'));
      process.exit(1);
    }
  });

program.parse();
