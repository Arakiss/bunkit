import { type TemplateContext, writeFile } from '@bunkit/core';
import { join } from 'pathe';
import { generateBunfigContent } from '../generators/bunfig';
import { setupVSCodeDebug } from '../generators/debug';
import { generateMinimalReadme } from '../generators/readme';
import { setupBiome, setupUltracite } from '../generators/ultracite';

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

  await writeFile(join(projectPath, 'tsconfig.json'), JSON.stringify(tsconfigContent, null, 2));

  // bunfig.toml with enhanced defaults
  const bunfigContent = generateBunfigContent(context);
  await writeFile(join(projectPath, 'bunfig.toml'), bunfigContent);

  // Setup code quality tools
  if (context.codeQuality === 'ultracite') {
    await setupUltracite(projectPath, context);
  } else {
    await setupBiome(projectPath, context);
  }

  // Setup VSCode debugging configuration
  await setupVSCodeDebug(projectPath, context, 'minimal');

  // Generate README.md with author attribution
  await generateMinimalReadme(projectPath, context);
}
