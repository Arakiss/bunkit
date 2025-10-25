import * as p from '@clack/prompts';
import boxen from 'boxen';
import chalk from 'chalk';

export async function createCommand(
  preset: string,
  name: string,
  options: { git?: boolean; install?: boolean }
) {
  const s = p.spinner();
  s.start(`Creating ${preset} project: ${name}`);

  // Simulate project creation
  await new Promise((resolve) => setTimeout(resolve, 1500));

  s.stop(`Project ${name} created!`);

  // Show next steps with boxen for consistent cross-platform rendering
  const nextSteps = [
    `${chalk.cyan('cd')} ${name}`,
    chalk.cyan(preset === 'web' ? 'bun dev' : 'bun run dev'),
  ].join('\n');

  console.log('\n' + boxen(nextSteps, {
    padding: 1,
    title: '📋 Next steps',
    titleAlignment: 'left',
    borderColor: 'cyan',
    borderStyle: 'round',
  }));
}
