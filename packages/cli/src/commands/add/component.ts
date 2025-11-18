import * as p from '@clack/prompts';
import { execa } from 'execa';
import { join } from 'pathe';
import { existsSync } from 'fs';
import { installShadcnComponents } from '@bunkit/templates';

/**
 * Options for adding shadcn/ui components
 */
export interface AddComponentOptions {
  components?: string[];
  cwd?: string;
  all?: boolean;
}

/**
 * Add shadcn/ui component(s) to project
 */
export async function addComponentCommand(
  options: AddComponentOptions = {}
): Promise<void> {
  const cwd = options.cwd || process.cwd();
  const spinner = p.spinner();

  // Check if components.json exists
  const componentsJsonPath = join(cwd, 'components.json');
  const isMonorepo = existsSync(join(cwd, 'packages/ui/components.json'));

  if (!existsSync(componentsJsonPath) && !isMonorepo) {
    p.log.error('shadcn/ui is not configured in this project.');
    p.log.info('Run `bunkit init` with --ui-library shadcn to set up shadcn/ui first.');
    process.exit(1);
  }

  // Determine where to install components
  const targetPath = isMonorepo ? join(cwd, 'packages/ui') : cwd;

  let components: string[] = [];

  if (options.all) {
    // Show popular components list
    const popularComponents = [
      'button',
      'card',
      'input',
      'label',
      'textarea',
      'select',
      'checkbox',
      'radio-group',
      'switch',
      'dialog',
      'dropdown-menu',
      'alert',
      'badge',
      'avatar',
      'separator',
      'skeleton',
      'tabs',
      'accordion',
      'alert-dialog',
      'aspect-ratio',
      'breadcrumb',
      'calendar',
      'carousel',
      'chart',
      'collapsible',
      'command',
      'context-menu',
      'drawer',
      'form',
      'hover-card',
      'menubar',
      'navigation-menu',
      'popover',
      'progress',
      'scroll-area',
      'sheet',
      'slider',
      'sonner',
      'table',
      'toast',
      'toggle',
      'tooltip',
    ];

    const selected = await p.multiselect({
      message: 'Select components to install:',
      options: popularComponents.map((comp) => ({
        value: comp,
        label: comp,
      })),
      required: true,
    });

    if (p.isCancel(selected)) {
      p.cancel('Operation cancelled.');
      process.exit(0);
    }

    components = selected as string[];
  } else if (options.components && options.components.length > 0) {
    components = options.components;
  } else {
    // Interactive: ask for component name(s)
    const componentInput = await p.text({
      message: 'Component name(s) to install?',
      placeholder: 'button, card, input',
      validate: (value) => {
        if (!value.trim()) {
          return 'Please enter at least one component name';
        }
      },
    });

    if (p.isCancel(componentInput)) {
      p.cancel('Operation cancelled.');
      process.exit(0);
    }

    // Parse comma-separated or space-separated component names
    components = componentInput
      .split(/[,\s]+/)
      .map((c) => c.trim())
      .filter(Boolean);
  }

  if (components.length === 0) {
    p.log.error('No components specified.');
    process.exit(1);
  }

  spinner.start(`Installing ${components.length} component(s)...`);

  try {
    await installShadcnComponents(targetPath, components, {
      silent: false,
      cwd: targetPath,
    });

    spinner.stop(`✅ Installed: ${components.join(', ')}`);

    // Show usage hint
    if (isMonorepo) {
      p.note(
        `Components installed in packages/ui. Import them using:\nimport { Button } from "@workspace/ui/components/ui/button"`,
        'Usage'
      );
    } else {
      p.note(
        `Import components using:\nimport { Button } from "@/components/ui/button"`,
        'Usage'
      );
    }
  } catch (error) {
    spinner.stop('❌ Failed to install components');
    p.log.error((error as Error).message);
    p.log.info('Try installing manually: bunx shadcn@latest add ' + components.join(' '));
    process.exit(1);
  }
}

