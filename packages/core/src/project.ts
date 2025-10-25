import { join } from 'pathe';
import fs from 'fs-extra';
import type { ProjectConfig, TemplateContext } from './types';
import {
  ensureDirectory,
  writeFile,
  isDirectoryEmpty,
  createPackageName,
} from './fs';
import { initGit, isGitAvailable, getGitUser } from './git';
import { logger } from './logger';

/**
 * Create a new project
 */
export async function createProject(config: ProjectConfig): Promise<void> {
  const projectPath = join(process.cwd(), config.path);

  // Validate directory
  if (!(await isDirectoryEmpty(projectPath))) {
    const exists = await fs.pathExists(projectPath);
    if (exists) {
      throw new Error(`Directory "${config.path}" already exists and is not empty`);
    }
  }

  // Create project directory
  await ensureDirectory(projectPath);

  // Create package.json
  await createPackageJson(projectPath, config);

  // Create base files
  await createBaseFiles(projectPath, config);

  // Initialize git if requested
  if (config.git && (await isGitAvailable())) {
    await initGit(projectPath);
    logger.success('Git repository initialized');
  }

  logger.success(`Project created at ${projectPath}`);
}

/**
 * Create package.json for project
 */
async function createPackageJson(
  projectPath: string,
  config: ProjectConfig
): Promise<void> {
  const gitUser = await getGitUser();
  const packageName = createPackageName(config.name);

  const packageJson = {
    name: packageName,
    version: '0.0.0',
    private: true,
    type: 'module',
    scripts: getScriptsForPreset(config.preset),
    dependencies: {},
    devDependencies: {
      '@types/bun': 'latest',
      typescript: '^5.7.2',
    },
    ...(gitUser.name && { author: gitUser.name }),
  };

  await writeFile(
    join(projectPath, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
}

/**
 * Get scripts based on preset
 */
function getScriptsForPreset(preset: string): Record<string, string> {
  switch (preset) {
    case 'minimal':
      return {
        dev: 'bun run --hot src/index.ts',
        start: 'bun run src/index.ts',
      };
    case 'web':
      return {
        dev: 'next dev --turbopack',
        build: 'next build',
        start: 'next start',
        lint: 'biome check .',
        format: 'biome check --write .',
      };
    case 'api':
      return {
        dev: 'bun run --hot src/index.ts',
        start: 'bun run src/index.ts',
        test: 'bun test',
      };
    case 'full':
      return {
        dev: 'bun run --filter "*" dev',
        build: 'bun run --filter "*" build',
        lint: 'biome check .',
        format: 'biome check --write .',
        test: 'bun test',
      };
    default:
      return {};
  }
}

/**
 * Create base configuration files
 */
async function createBaseFiles(
  projectPath: string,
  config: ProjectConfig
): Promise<void> {
  // .gitignore
  const gitignore = `# Dependencies
node_modules/

# Build
dist/
build/
*.tsbuildinfo

# Environment
.env
.env*.local

# Logs
*.log

# OS
.DS_Store

# IDEs
.vscode/
.idea/

# Temporary
.turbo/
.next/
.cache/
`;

  await writeFile(join(projectPath, '.gitignore'), gitignore);

  // README.md
  const readme = `# ${config.name}

Created with [bunkit](https://github.com/Arakiss/bunkit) 🍞

## Getting Started

\`\`\`bash
bun install
bun dev
\`\`\`

## Available Scripts

- \`bun dev\` - Start development server
- \`bun build\` - Build for production
- \`bun start\` - Start production server

---

Built with ❤️ using Bun
`;

  await writeFile(join(projectPath, 'README.md'), readme);
}

/**
 * Create template context from config
 */
export function createTemplateContext(config: ProjectConfig): TemplateContext {
  return {
    projectName: config.name,
    packageName: createPackageName(config.name),
    description: `Project created with bunkit`,
    license: 'MIT',
    features: config.features || [],
    supportsTypeScript: true,
  };
}
