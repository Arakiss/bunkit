import * as p from '@clack/prompts';
import pc from 'picocolors';
import { validateProjectName } from '@bunkit/core';

export async function initCommand() {
  const projectName = await p.text({
    message: 'What is your project named?',
    placeholder: 'my-awesome-project',
    validate: (value) => {
      const result = validateProjectName(value);
      if (!result.valid) return result.error;
    },
  });

  if (p.isCancel(projectName)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }

  const preset = await p.select({
    message: 'Which preset would you like?',
    options: [
      {
        value: 'minimal',
        label: 'Minimal',
        hint: 'Single repo, clean start',
      },
      {
        value: 'web',
        label: 'Web',
        hint: 'Next.js 15 + React 19',
      },
      {
        value: 'api',
        label: 'API',
        hint: 'Hono + Bun.serve()',
      },
      {
        value: 'full',
        label: 'Full-stack',
        hint: 'Monorepo with everything',
      },
    ],
  });

  if (p.isCancel(preset)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }

  const features = await p.multiselect({
    message: 'Select features (optional)',
    options: [
      { value: 'auth', label: 'Authentication', hint: 'Supabase by default' },
      { value: 'database', label: 'Database', hint: 'Drizzle ORM + Postgres' },
      { value: 'ui', label: 'UI Package', hint: 'shadcn/ui + Tailwind' },
      { value: 'payments', label: 'Payments', hint: 'Stripe integration' },
      { value: 'email', label: 'Email', hint: 'Resend + React Email' },
      { value: 'storage', label: 'Storage', hint: 'Supabase Storage' },
    ],
    required: false,
  });

  if (p.isCancel(features)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }

  const s = p.spinner();
  s.start('Creating project...');

  // Simulate project creation
  await new Promise((resolve) => setTimeout(resolve, 2000));

  s.stop('Project created!');

  p.note(
    [
      `cd ${projectName}`,
      preset === 'full' ? 'bun dev' : preset === 'web' ? 'bun dev' : 'bun run dev',
    ].join('\n'),
    'Next steps'
  );
}
