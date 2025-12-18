import {
  type CustomPreset,
  deleteCustomPreset,
  getCustomPreset,
  listCustomPresets,
  type ProjectConfig,
  saveCustomPreset,
} from '@bunkit/core';
import * as p from '@clack/prompts';
import boxen from 'boxen';
import chalk from 'chalk';

/**
 * Save current configuration as a custom preset
 */
export async function savePresetCommand(config: ProjectConfig, name?: string): Promise<void> {
  console.log(''); // Add spacing

  const presetName =
    name ||
    ((await p.text({
      message: '💾 Preset name',
      placeholder: 'my-custom-preset',
      validate: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Preset name is required';
        }
        if (!/^[a-z0-9-]+$/.test(value)) {
          return 'Preset name must be lowercase alphanumeric with hyphens';
        }
        return undefined;
      },
    })) as string);

  if (p.isCancel(presetName)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }

  const description = (await p.text({
    message: '📝 Preset description',
    placeholder: 'My custom preset configuration',
    initialValue: `Custom preset: ${config.preset}`,
  })) as string;

  if (p.isCancel(description)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }

  const s = p.spinner();
  s.start(`Saving preset: ${chalk.bold(presetName)}`);

  try {
    const preset: CustomPreset = {
      name: presetName,
      description: description || `Custom preset: ${config.preset}`,
      config,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveCustomPreset(preset);
    s.stop(`${chalk.green('✅')} Preset saved: ${chalk.bold(presetName)}`);

    console.log(
      '\n' +
        boxen(
          [
            `${chalk.bold.green('Preset saved successfully!')}`,
            '',
            `${chalk.dim('Name:')} ${chalk.cyan(presetName)}`,
            `${chalk.dim('Description:')} ${chalk.cyan(description)}`,
            '',
            `${chalk.dim('Use it with:')}`,
            `${chalk.cyan(`bunkit init --preset ${presetName}`)}`,
          ].join('\n'),
          {
            padding: { top: 1, bottom: 1, left: 2, right: 2 },
            borderColor: 'green',
            borderStyle: 'round',
          }
        )
    );
  } catch (error) {
    s.stop(`${chalk.red('❌')} Failed to save preset`);
    throw error;
  }
}

/**
 * List all custom presets
 */
export async function listPresetsCommand(): Promise<void> {
  console.log(''); // Add spacing

  const s = p.spinner();
  s.start('Loading custom presets...');

  try {
    const presets = await listCustomPresets();
    s.stop('');

    if (presets.length === 0) {
      console.log(
        '\n' +
          boxen(
            [
              `${chalk.bold.yellow('No custom presets found')}`,
              '',
              `${chalk.dim('Create one with:')}`,
              `${chalk.cyan('bunkit preset save')}`,
              '',
              `${chalk.dim('Or save your current config:')}`,
              `${chalk.cyan('bunkit init --save-preset')}`,
            ].join('\n'),
            {
              padding: { top: 1, bottom: 1, left: 2, right: 2 },
              borderColor: 'yellow',
              borderStyle: 'round',
            }
          )
      );
      return;
    }

    const presetList = presets
      .map((preset, index) => {
        const updated = new Date(preset.updatedAt).toLocaleDateString();
        return [
          `${chalk.bold.cyan(`${index + 1}. ${preset.name}`)}`,
          `${chalk.dim('  Description:')} ${preset.description}`,
          `${chalk.dim('  Preset:')} ${chalk.cyan(preset.config.preset)}`,
          `${chalk.dim('  Updated:')} ${updated}`,
          '',
        ].join('\n');
      })
      .join('');

    console.log(
      '\n' +
        boxen(
          [
            `${chalk.bold.green('Custom Presets')}`,
            '',
            presetList,
            `${chalk.dim('Use a preset:')}`,
            `${chalk.cyan('bunkit init --preset <name>')}`,
          ].join('\n'),
          {
            padding: { top: 1, bottom: 1, left: 2, right: 2 },
            borderColor: 'green',
            borderStyle: 'round',
          }
        )
    );
  } catch (error) {
    s.stop(`${chalk.red('❌')} Failed to load presets`);
    throw error;
  }
}

/**
 * Delete a custom preset
 */
export async function deletePresetCommand(name?: string): Promise<void> {
  console.log(''); // Add spacing

  let presetName = name;

  if (!presetName) {
    const presets = await listCustomPresets();
    if (presets.length === 0) {
      console.log(chalk.yellow('No custom presets to delete.'));
      return;
    }

    presetName = (await p.select({
      message: '🗑️  Select preset to delete',
      options: presets.map((p) => ({
        value: p.name,
        label: p.name,
        hint: p.description,
      })),
    })) as string;
  }

  if (p.isCancel(presetName)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }

  const confirmed = await p.confirm({
    message: `Are you sure you want to delete "${presetName}"?`,
    initialValue: false,
  });

  if (p.isCancel(confirmed) || !confirmed) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }

  const s = p.spinner();
  s.start(`Deleting preset: ${chalk.bold(presetName)}`);

  try {
    const deleted = await deleteCustomPreset(presetName);
    if (deleted) {
      s.stop(`${chalk.green('✅')} Preset deleted: ${chalk.bold(presetName)}`);
    } else {
      s.stop(`${chalk.yellow('⚠️')}  Preset not found: ${chalk.bold(presetName)}`);
    }
  } catch (error) {
    s.stop(`${chalk.red('❌')} Failed to delete preset`);
    throw error;
  }
}

/**
 * Load a custom preset configuration
 */
export async function loadPresetCommand(name: string): Promise<ProjectConfig | null> {
  const preset = await getCustomPreset(name);
  if (!preset) {
    return null;
  }
  return preset.config;
}
