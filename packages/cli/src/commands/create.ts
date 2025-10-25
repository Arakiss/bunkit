import * as p from '@clack/prompts';

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

  p.note(
    [`cd ${name}`, preset === 'web' ? 'bun dev' : 'bun run dev'].join('\n'),
    'Next steps'
  );
}
