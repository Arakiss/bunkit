import { join } from 'pathe';
import { writeFile, type TemplateContext } from '@bunkit/core';

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
# Fast installs
frozenLockfile = false

[test]
# Test configuration
coverage = true
`;

  await writeFile(join(projectPath, 'bunfig.toml'), bunfigContent);
}
