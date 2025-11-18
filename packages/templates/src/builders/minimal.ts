import { join } from 'pathe';
import { writeFile, type TemplateContext } from '@bunkit/core';
import { setupVSCodeDebug } from '../generators/debug';

/**
 * Build minimal preset files
 */
export async function buildMinimalPreset(
  projectPath: string,
  context: TemplateContext
): Promise<void> {
  // src/index.ts
  const indexContent = `console.log('Hello from ${context.projectName}! 🍞');

// Your code here
const greet = (name: string): void => {
  console.log(\`Welcome, \${name}!\`);
};

greet('Bun');
`;

  await writeFile(join(projectPath, 'src/index.ts'), indexContent);

  // tsconfig.json
  const tsconfigContent = {
    compilerOptions: {
      lib: ['ESNext'],
      target: 'ESNext',
      module: 'ESNext',
      moduleDetection: 'force',
      jsx: 'react-jsx',
      allowJs: true,
      moduleResolution: 'bundler',
      allowImportingTsExtensions: true,
      verbatimModuleSyntax: true,
      noEmit: true,
      strict: true,
      skipLibCheck: true,
      noFallthroughCasesInSwitch: true,
      noUnusedLocals: false,
      noUnusedParameters: false,
      noPropertyAccessFromIndexSignature: false,
      types: ['bun-types'],
    },
  };

  await writeFile(
    join(projectPath, 'tsconfig.json'),
    JSON.stringify(tsconfigContent, null, 2)
  );

  // bunfig.toml
  const bunfigContent = `[install]
# Fast installs - don't freeze lockfile during development
frozenLockfile = false

[test]
# Enable test coverage
coverage = true

# Development settings
# Set BUN_CONFIG_VERBOSE_FETCH=true to debug network requests
# Set BUN_CONFIG_VERBOSE_FETCH=curl to see requests as curl commands
`;

  await writeFile(join(projectPath, 'bunfig.toml'), bunfigContent);

  // Setup VSCode debugging configuration
  await setupVSCodeDebug(projectPath, context, 'minimal');
}
