import { join } from 'pathe';
import { writeFile, type TemplateContext } from '@bunkit/core';

/**
 * Setup Ultracite (AI-optimized Biome preset)
 */
export async function setupUltracite(
  projectPath: string,
  context: TemplateContext
): Promise<void> {
  // biome.jsonc with Ultracite presets
  const biomeConfig = `{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "extends": [
    "ultracite/core",
    ${context.cssFramework === 'tailwind' ? '"ultracite/react",\n    "ultracite/next"' : '"ultracite/react"'}
  ],
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "ignore": [
      "node_modules",
      "dist",
      "build",
      ".next",
      ".turbo",
      "coverage"
    ]
  },
  "formatter": {
    "enabled": true,
    "formatWithErrors": false,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100,
    "lineEnding": "lf"
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "trailingCommas": "es5",
      "semicolons": "always",
      "arrowParentheses": "always",
      "bracketSpacing": true,
      "jsxQuoteStyle": "double",
      "quoteProperties": "asNeeded"
    }
  },
  "json": {
    "formatter": {
      "enabled": true,
      "indentWidth": 2
    }
  }
}
`;

  await writeFile(join(projectPath, 'biome.jsonc'), biomeConfig);

  // .cursorrules for Cursor AI
  const cursorRules = `# ${context.projectName} - Cursor AI Rules

## Code Style (Ultracite)
- Follow Biome configuration in biome.jsonc
- Use single quotes for JavaScript/TypeScript
- Use double quotes for JSX attributes
- Always use semicolons
- 2-space indentation
- 100 character line width
- ES5 trailing commas

## TypeScript
- Strict mode: ${context.tsStrictness === 'strict' ? 'enabled' : context.tsStrictness === 'moderate' ? 'moderate' : 'disabled'}
- Always define types explicitly for function parameters and return values
- Use \`type\` for object types, \`interface\` for contracts
- Prefer \`const\` assertions for literal types

## React/Next.js Best Practices
- Use Server Components by default (Next.js 16)
- Add 'use client' only when needed (hooks, browser APIs, interactivity)
- Always await \`params\` and \`searchParams\` in Next.js 16
- Use descriptive variable names (no \`c\`, \`ctx\`, \`req\`, \`res\`)

${context.cssFramework === 'tailwind' ? `## Tailwind CSS
- Use utility classes for styling
- Follow mobile-first responsive design
- Use OKLCH colors from theme when available
- Avoid arbitrary values unless necessary` : ''}

${context.database && context.database !== 'none' ? `## Database (${context.database})
- Always use Drizzle ORM for type-safe queries
- Define schema in separate files by domain
- Use transactions for multi-step operations
- Always handle database errors gracefully` : ''}

## File Naming
- Pages: \`page.tsx\`, \`layout.tsx\`
- Components: PascalCase (\`UserCard.tsx\`)
- Utilities: camelCase (\`formatDate.ts\`)
- Types: \`*.types.ts\` or in \`types/\` directory

## Testing
- Write tests for critical business logic
- Use Bun's built-in test runner
- Follow AAA pattern: Arrange, Act, Assert
- Mock external dependencies

## AI Code Generation Guidelines
- Always generate complete, working code
- Include error handling
- Add TypeScript types
- Write self-documenting code with clear names
- Add comments only for complex logic
- Follow the project's existing patterns
`;

  await writeFile(join(projectPath, '.cursorrules'), cursorRules);

  // .windsurfrules for Windsurf
  const windsurfRules = `# ${context.projectName} - Windsurf AI Rules

This project uses **Ultracite** for code quality - an AI-optimized Biome preset.

## Code Quality Rules
- Lint: \`bun run lint\`
- Format: \`bun run format\`
- Config: See \`biome.jsonc\`

## Key Conventions
1. **TypeScript**: ${context.tsStrictness} mode
2. **Quotes**: Single quotes (JS/TS), double quotes (JSX)
3. **Semicolons**: Always required
4. **Indentation**: 2 spaces
5. **Line width**: 100 characters

## Framework-Specific
${context.cssFramework === 'tailwind' ? '- **Tailwind CSS**: Utility-first styling\n' : ''}${context.database && context.database !== 'none' ? `- **Database**: ${context.database} with Drizzle ORM\n` : ''}- **Testing**: ${context.testing}

## Variable Naming (CRITICAL)
❌ NEVER use: \`c\`, \`ctx\`, \`e\`, \`req\`, \`res\`, \`data\`, \`temp\`
✅ ALWAYS use: \`context\`, \`error\`, \`request\`, \`response\`, \`userData\`, \`temporaryBuffer\`

## React/Next.js 16
- Server Components by default
- \`'use client'\` only when necessary
- Always \`await params\` and \`await searchParams\`

Sync with \`.cursorrules\` for full AI guidelines.
`;

  await writeFile(join(projectPath, '.windsurfrules'), windsurfRules);

  // CLAUDE.md for Claude Code (if doesn't exist)
  const claudeMd = `# ${context.projectName}

AI-assisted development with Ultracite code quality.

## Quick Start

\`\`\`bash
bun install
bun dev
\`\`\`

## Code Quality

This project uses **Ultracite** - an AI-optimized Biome preset that keeps code consistent across:
- Cursor
- Windsurf
- Claude Code
- Zed

### Commands

\`\`\`bash
bun run lint      # Check code quality
bun run format    # Auto-fix issues
\`\`\`

## AI Development Guidelines

See \`.cursorrules\` and \`.windsurfrules\` for comprehensive AI coding guidelines.

### Critical Rules

1. **Descriptive Names**: No \`c\`, \`ctx\`, \`e\` - use \`context\`, \`error\`, etc.
2. **TypeScript**: ${context.tsStrictness} mode
3. **Server Components**: Default in Next.js 16
4. **Error Handling**: Always handle errors gracefully

## Tech Stack

- **Runtime**: Bun
- **Framework**: ${context.preset === 'web' || context.preset === 'full' ? 'Next.js 16 + React 19' : context.preset === 'api' ? 'Hono' : 'Minimal'}
${context.cssFramework === 'tailwind' ? '- **Styling**: Tailwind CSS 4\n' : ''}${context.database && context.database !== 'none' ? `- **Database**: ${context.database}\n` : ''}${context.uiLibrary === 'shadcn' ? '- **UI**: shadcn/ui\n' : ''}- **Code Quality**: Ultracite (Biome)
- **Testing**: ${context.testing}
`;

  await writeFile(join(projectPath, 'CLAUDE.md'), claudeMd);
}

/**
 * Setup standard Biome (without Ultracite)
 */
export async function setupBiome(
  projectPath: string,
  context: TemplateContext
): Promise<void> {
  const biomeConfig = {
    $schema: 'https://biomejs.dev/schemas/1.9.4/schema.json',
    vcs: {
      enabled: true,
      clientKind: 'git',
      useIgnoreFile: true,
    },
    files: {
      ignore: [
        'node_modules',
        'dist',
        'build',
        '.next',
        '.turbo',
        'coverage',
      ],
    },
    formatter: {
      enabled: true,
      indentStyle: 'space',
      indentWidth: 2,
      lineWidth: 100,
    },
    linter: {
      enabled: true,
      rules: {
        recommended: true,
      },
    },
    javascript: {
      formatter: {
        quoteStyle: 'single',
        trailingCommas: 'es5',
        semicolons: 'always',
      },
    },
  };

  await writeFile(
    join(projectPath, 'biome.json'),
    JSON.stringify(biomeConfig, null, 2)
  );
}

/**
 * Get code quality tool dependencies
 */
export function getCodeQualityDependencies(codeQuality: string): Record<string, string> {
  if (codeQuality === 'ultracite') {
    return {
      'ultracite': 'catalog:',
      '@biomejs/biome': 'catalog:',
    };
  }
  return {
    '@biomejs/biome': 'catalog:',
  };
}
