import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import * as p from '@clack/prompts';
import { join } from 'pathe';
import pc from 'picocolors';

/**
 * Options for catalog commands
 */
interface CatalogOptions {
  package?: string;
  version?: string;
  cwd?: string;
}

/**
 * Read package.json catalog section
 */
async function readCatalog(cwd: string): Promise<Record<string, string>> {
  const packageJsonPath = join(cwd, 'package.json');

  if (!existsSync(packageJsonPath)) {
    throw new Error('package.json not found. Are you in a project root?');
  }

  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
  return packageJson.catalog || {};
}

/**
 * Write catalog to package.json
 */
async function writeCatalog(cwd: string, catalog: Record<string, string>): Promise<void> {
  const packageJsonPath = join(cwd, 'package.json');
  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));

  packageJson.catalog = catalog;

  await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
}

/**
 * Add package to catalog
 */
export async function catalogAddCommand(options: CatalogOptions = {}) {
  const cwd = options.cwd || process.cwd();
  const spinner = p.spinner();

  try {
    spinner.start('Reading catalog...');
    const catalog = await readCatalog(cwd);
    spinner.stop();

    let packageName = options.package;
    let version = options.version;

    if (!packageName) {
      const nameInput = await p.text({
        message: 'Package name',
        placeholder: 'e.g., zod, hono, @prisma/client',
        validate: (value) => {
          if (!value) return 'Package name is required';
          return undefined;
        },
      });

      if (p.isCancel(nameInput)) {
        p.cancel('Operation cancelled');
        process.exit(0);
      }

      packageName = nameInput as string;
    }

    if (!version) {
      const versionInput = await p.text({
        message: 'Version',
        placeholder: 'e.g., ^3.24.1, latest, catalog:',
        validate: (value) => {
          if (!value) return 'Version is required';
          return undefined;
        },
      });

      if (p.isCancel(versionInput)) {
        p.cancel('Operation cancelled');
        process.exit(0);
      }

      version = versionInput as string;
    }

    // Check if package already exists
    if (catalog[packageName]) {
      const overwrite = await p.confirm({
        message: `Package "${packageName}" already exists with version "${catalog[packageName]}". Overwrite?`,
        initialValue: false,
      });

      if (p.isCancel(overwrite) || !overwrite) {
        p.cancel('Operation cancelled');
        process.exit(0);
      }
    }

    spinner.start(`Adding ${packageName}@${version} to catalog...`);
    catalog[packageName] = version;
    await writeCatalog(cwd, catalog);
    spinner.stop(`${packageName}@${version} added to catalog`);

    p.log.success(`Added ${pc.cyan(packageName)}@${pc.yellow(version)} to catalog`);

    p.note(
      `Use ${pc.cyan('catalog:')} in your package.json dependencies to reference this version.\n\nExample:\n  "dependencies": {\n    "${packageName}": "catalog:"\n  }`,
      pc.green('Next steps')
    );
  } catch (error) {
    spinner.stop('Failed');
    throw error;
  }
}

/**
 * Sync catalog versions across workspaces
 */
export async function catalogSyncCommand(options: CatalogOptions = {}) {
  const cwd = options.cwd || process.cwd();
  const spinner = p.spinner();

  try {
    spinner.start('Detecting monorepo structure...');

    const rootPackageJsonPath = join(cwd, 'package.json');
    if (!existsSync(rootPackageJsonPath)) {
      throw new Error('package.json not found. Are you in a monorepo root?');
    }

    const rootPackageJson = JSON.parse(await readFile(rootPackageJsonPath, 'utf-8'));
    const catalog = rootPackageJson.catalog || {};

    if (Object.keys(catalog).length === 0) {
      p.log.warn('No catalog found in root package.json');
      process.exit(0);
    }

    spinner.stop(`Found ${Object.keys(catalog).length} packages in catalog`);

    // Find all package.json files in workspaces
    const { glob } = await import('fast-glob');
    const workspacePatterns = rootPackageJson.workspaces || [];

    if (workspacePatterns.length === 0) {
      p.log.warn('No workspaces found. This command works best in a monorepo.');
      process.exit(0);
    }

    spinner.start('Scanning workspaces...');
    const packageJsonFiles = await glob(
      workspacePatterns.map((pattern: string) => `${pattern}/package.json`),
      { cwd, absolute: true }
    );

    spinner.stop(`Found ${packageJsonFiles.length} workspace(s)`);

    let updatedCount = 0;
    let totalReplacements = 0;

    for (const packageJsonPath of packageJsonFiles) {
      const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
      let modified = false;
      let replacements = 0;

      // Update dependencies
      if (packageJson.dependencies) {
        for (const [dep, version] of Object.entries(packageJson.dependencies)) {
          if (version === 'catalog:' && catalog[dep]) {
            // Already using catalog, skip
            continue;
          }
          if (catalog[dep] && version !== catalog[dep]) {
            packageJson.dependencies[dep] = 'catalog:';
            replacements++;
            modified = true;
          }
        }
      }

      // Update devDependencies
      if (packageJson.devDependencies) {
        for (const [dep, version] of Object.entries(packageJson.devDependencies)) {
          if (version === 'catalog:' && catalog[dep]) {
            // Already using catalog, skip
            continue;
          }
          if (catalog[dep] && version !== catalog[dep]) {
            packageJson.devDependencies[dep] = 'catalog:';
            replacements++;
            modified = true;
          }
        }
      }

      if (modified) {
        await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
        updatedCount++;
        totalReplacements += replacements;
      }
    }

    if (updatedCount === 0) {
      p.log.info('All workspaces are already in sync with catalog');
    } else {
      p.log.success(
        `Synced ${pc.cyan(totalReplacements.toString())} dependency version(s) across ${pc.cyan(updatedCount.toString())} workspace(s)`
      );

      p.note(
        `Run ${pc.cyan('bun install')} to update lockfile with synced versions.`,
        pc.green('Next steps')
      );
    }
  } catch (error) {
    spinner.stop('Failed');
    throw error;
  }
}

/**
 * List catalog packages
 */
export async function catalogListCommand(options: CatalogOptions = {}) {
  const cwd = options.cwd || process.cwd();
  const catalog = await readCatalog(cwd);

  if (Object.keys(catalog).length === 0) {
    p.log.info('Catalog is empty. Add packages with: bunkit catalog add');
    return;
  }

  p.log.info(`Found ${Object.keys(catalog).length} package(s) in catalog:\n`);

  // Group by category (comments in catalog)
  const categories: Record<string, Array<[string, string]>> = {};
  let currentCategory = 'Other';

  // Read package.json to preserve comments structure
  const packageJsonPath = join(cwd, 'package.json');
  const packageJsonContent = await readFile(packageJsonPath, 'utf-8');
  const lines = packageJsonContent.split('\n');

  for (const [packageName, version] of Object.entries(catalog)) {
    // Try to find category by looking at lines before the package
    const packageIndex = lines.findIndex(
      (line) => line.includes(`"${packageName}"`) && line.includes(version)
    );

    if (packageIndex > 0) {
      // Look backwards for comment
      for (let i = packageIndex - 1; i >= 0; i--) {
        if (lines[i].trim().startsWith('"//')) {
          currentCategory = lines[i]
            .trim()
            .replace(/^"\/\/\s*/, '')
            .replace(/":\s*$/, '');
          break;
        }
      }
    }

    if (!categories[currentCategory]) {
      categories[currentCategory] = [];
    }
    categories[currentCategory].push([packageName, version]);
  }

  // Display grouped
  for (const [category, packages] of Object.entries(categories)) {
    if (category !== 'Other') {
      console.log(pc.dim(`\n// ${category}`));
    }
    for (const [packageName, version] of packages) {
      console.log(`  ${pc.cyan(packageName.padEnd(30))} ${pc.yellow(version)}`);
    }
  }

  console.log('');
}
