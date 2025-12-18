import * as p from '@clack/prompts';
import { addWorkspaceCommand } from './add/workspace';
import { addPackageCommand } from './add/package';
import { addComponentCommand } from './add/component';

/**
 * Feature types that can be added
 */
type FeatureType = 'workspace' | 'package' | 'component';

/**
 * Add command - routes to appropriate subcommand
 */
export async function addCommand(
  feature: FeatureType,
  options: {
    name?: string;
    preset?: string;
    type?: string;
    provider?: string;
    components?: string[];
    all?: boolean;
  }
) {
  try {
    switch (feature) {
      case 'workspace':
        await addWorkspaceCommand({
          name: options.name,
          preset: options.preset as any,
          cwd: process.cwd(),
        });
        break;

      case 'package':
        await addPackageCommand({
          name: options.name,
          type: options.type as any,
          cwd: process.cwd(),
        });
        break;

      case 'component':
        await addComponentCommand({
          components: options.components,
          all: options.all,
          cwd: process.cwd(),
        });
        break;

      default:
        p.log.error(`Unknown feature: ${feature}`);
        p.log.info(`Available features: workspace, package, component`);
        process.exit(1);
    }
  } catch (error) {
    throw error;
  }
}
