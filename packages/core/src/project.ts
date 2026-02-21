import { basename, join, resolve } from 'pathe';
import {
  createPackageName,
  directoryExists,
  ensureDirectory,
  isDirectoryEmpty,
  writeFile,
} from './fs';
import { getGitUser, initGit, isGitAvailable } from './git';
import { logger } from './logger';
import type { ProjectConfig, TemplateContext } from './types';

/**
 * Create a new project
 */
export async function createProject(config: ProjectConfig): Promise<void> {
  const projectPath = join(process.cwd(), config.path);
  const currentDirName = basename(resolve(process.cwd()));

  // Detect if user is trying to create a project with the same name as current directory
  // This prevents creating mycelio/mycelio when already in mycelio/
  // This check MUST happen before checking if projectPath exists
  if (currentDirName === config.name && config.path === config.name) {
    const isEmpty = await isDirectoryEmpty(process.cwd());
    if (isEmpty) {
      // If current directory is empty, use it directly instead of creating a subdirectory
      // This provides a better UX when user is already in the target directory
      throw new Error(
        `You are already in a directory named "${config.name}". ` +
          `Since this directory is empty, you can initialize the project here directly. ` +
          `Please run "bunkit init" instead, or navigate to the parent directory first.`
      );
    } else {
      // If current directory is not empty, warn about creating nested directory
      throw new Error(
        `You are already in a directory named "${config.name}" which is not empty. ` +
          `Creating the project here would result in "${config.name}/${config.name}". ` +
          `Please navigate to the parent directory first, or use a different project name.`
      );
    }
  }

  // Validate directory - check if target directory already exists
  const targetExists = await directoryExists(projectPath);
  if (targetExists && !(await isDirectoryEmpty(projectPath))) {
    throw new Error(`Directory "${config.path}" already exists and is not empty`);
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
async function createPackageJson(projectPath: string, config: ProjectConfig): Promise<void> {
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
      typescript: '^5.9.3',
    },
    ...(gitUser.name && { author: gitUser.name }),
  };

  await writeFile(join(projectPath, 'package.json'), JSON.stringify(packageJson, null, 2));
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
        debug: 'bun --inspect src/index.ts',
        'debug:brk': 'bun --inspect-brk src/index.ts',
        'debug:wait': 'bun --inspect-wait src/index.ts',
      };
    case 'web':
      return {
        dev: 'next dev --turbopack',
        build: 'next build',
        start: 'next start',
        lint: 'biome check .',
        format: 'biome check --write .',
        debug: 'bun --inspect node_modules/.bin/next dev --turbopack',
        'debug:brk': 'bun --inspect-brk node_modules/.bin/next dev --turbopack',
        'debug:wait': 'bun --inspect-wait node_modules/.bin/next dev --turbopack',
      };
    case 'api':
      return {
        dev: 'bun run --hot src/index.ts',
        start: 'bun run src/index.ts',
        test: 'bun test',
        debug: 'bun --inspect src/index.ts',
        'debug:brk': 'bun --inspect-brk src/index.ts',
        'debug:wait': 'bun --inspect-wait src/index.ts',
      };
    case 'full':
      return {
        dev: 'bun run --filter "*" dev',
        build: 'bun run --filter "*" build',
        lint: 'biome check .',
        format: 'biome check --write .',
        test: 'bun test',
        debug: 'bun --inspect apps/api/src/index.ts',
        'debug:brk': 'bun --inspect-brk apps/api/src/index.ts',
        'debug:wait': 'bun --inspect-wait apps/api/src/index.ts',
      };
    default:
      return {};
  }
}

/**
 * Create base configuration files
 */
async function createBaseFiles(projectPath: string, config: ProjectConfig): Promise<void> {
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
    preset: config.preset, // Pass preset to context for Ultracite configuration

    // Pass through all configuration options
    database: config.database,
    auth: config.auth,
    redis: config.redis,
    useBunSecrets: config.useBunSecrets,
    codeQuality: config.codeQuality,
    tsStrictness: config.tsStrictness,
    uiLibrary: config.uiLibrary,
    cssFramework: config.cssFramework,
    testing: config.testing,
    docker: config.docker,
    cicd: config.cicd,
    envExample: config.envExample,
    pathAliases: config.pathAliases,

    // shadcn/ui specific options (December 2025 - new create feature)
    shadcnStyle: config.shadcnStyle,
    shadcnBase: config.shadcnBase,
    shadcnBaseColor: config.shadcnBaseColor,
    shadcnIconLibrary: config.shadcnIconLibrary,
    shadcnMenuAccent: config.shadcnMenuAccent,
    shadcnMenuColor: config.shadcnMenuColor,
    shadcnRadius: config.shadcnRadius,
    shadcnRtl: config.shadcnRtl,

    // Supabase specific options
    supabasePreset: config.supabasePreset,
    supabaseFeatures: config.supabaseFeatures,
    supabaseWithDrizzle: config.supabaseWithDrizzle,
  };
}
