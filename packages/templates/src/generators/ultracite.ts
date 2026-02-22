import { ensureDirectory, type TemplateContext, writeFile } from '@bunkit/core';
import { join } from 'pathe';

/**
 * Determine which Ultracite presets to use based on project preset
 */
function getUltracitePresets(preset: string | undefined): string[] {
  const presets: string[] = ['ultracite/core'];

  const presetStr = preset || 'minimal';

  // Determine if React is used
  const usesReact = [
    'nextjs',
    'web',
    'nextjs-monorepo',
    'full',
    'monorepo-nextjs',
    'bun-monorepo',
    'monorepo-bun',
  ].includes(presetStr);

  // Determine if Next.js is used
  const usesNext = ['nextjs', 'web', 'nextjs-monorepo', 'full', 'monorepo-nextjs'].includes(
    presetStr
  );

  if (usesReact) {
    presets.push('ultracite/react');
  }

  if (usesNext) {
    presets.push('ultracite/next');
  }

  return presets;
}

/**
 * Setup Ultracite (AI-optimized Biome preset)
 * Follows official Ultracite structure and conventions
 */
export async function setupUltracite(projectPath: string, context: TemplateContext): Promise<void> {
  const preset = (context.preset as string) || 'minimal';
  const ultracitePresets = getUltracitePresets(preset);

  // biome.jsonc with Ultracite presets - minimal config as per official Ultracite
  const biomeConfig = `{
  "$schema": "./node_modules/@biomejs/biome/configuration_schema.json",
  "extends": [
${ultracitePresets.map((p) => `    "${p}"`).join(',\n')}
  ]
}
`;

  await writeFile(join(projectPath, 'biome.jsonc'), biomeConfig);

  // .cursor/rules/ultracite.mdc for Cursor AI (official Ultracite format)
  const cursorRulesContent = `---
description: Ultracite Rules - AI-Ready Formatter and Linter
globs: "**/*.{ts,tsx,js,jsx,json,jsonc,html,vue,svelte,astro,css,yaml,yml,graphql,gql,md,mdx,grit}"
alwaysApply: false
---

# Ultracite Code Standards

This project uses **Ultracite**, a zero-config Biome preset that enforces strict code quality standards through automated formatting and linting.

## Quick Reference

- **Format code**: \`bun run format\` or \`npx ultracite fix\`
- **Check for issues**: \`bun run lint\` or \`npx ultracite check\`
- **Diagnose setup**: \`npx ultracite doctor\`

Biome (the underlying engine) provides extremely fast Rust-based linting and formatting. Most issues are automatically fixable.

---

## Core Principles

Write code that is **accessible, performant, type-safe, and maintainable**. Focus on clarity and explicit intent over brevity.

### Type Safety & Explicitness

- Use explicit types for function parameters and return values when they enhance clarity
- Prefer \`unknown\` over \`any\` when the type is genuinely unknown
- Use const assertions (\`as const\`) for immutable values and literal types
- Leverage TypeScript's type narrowing instead of type assertions
- Use meaningful variable names instead of magic numbers - extract constants with descriptive names
- **TypeScript strictness**: ${context.tsStrictness} mode

### Modern JavaScript/TypeScript

- Use arrow functions for callbacks and short functions
- Prefer \`for...of\` loops over \`.forEach()\` and indexed \`for\` loops
- Use optional chaining (\`?.\`) and nullish coalescing (\`??\`) for safer property access
- Prefer template literals over string concatenation
- Use destructuring for object and array assignments
- Use \`const\` by default, \`let\` only when reassignment is needed, never \`var\`

### Async & Promises

- Always \`await\` promises in async functions - don't forget to use the return value
- Use \`async/await\` syntax instead of promise chains for better readability
- Handle errors appropriately in async code with try-catch blocks
- Don't use async functions as Promise executors

${
  ultracitePresets.includes('ultracite/react')
    ? `### React & JSX

- Use function components over class components
- Call hooks at the top level only, never conditionally
- Specify all dependencies in hook dependency arrays correctly
- Use the \`key\` prop for elements in iterables (prefer unique IDs over array indices)
- Nest children between opening and closing tags instead of passing as props
- Don't define components inside other components
- Use semantic HTML and ARIA attributes for accessibility:
  - Provide meaningful alt text for images
  - Use proper heading hierarchy
  - Add labels for form inputs
  - Include keyboard event handlers alongside mouse events
  - Use semantic elements (\`<button>\`, \`<nav>\`, etc.) instead of divs with roles

${
  ultracitePresets.includes('ultracite/next')
    ? `### Next.js Specific

- Use Next.js \`<Image>\` component for images
- Use \`next/head\` or App Router metadata API for head elements
- Use Server Components for async data fetching instead of async Client Components
- Always \`await params\` and \`await searchParams\` in Next.js 16
- Add \`'use client'\` only when needed (hooks, browser APIs, interactivity)
- Use descriptive variable names (no \`c\`, \`ctx\`, \`req\`, \`res\`)

`
    : ''
}`
    : ''
}### Error Handling & Debugging

- Remove \`console.log\`, \`debugger\`, and \`alert\` statements from production code
- Throw \`Error\` objects with descriptive messages, not strings or other values
- Use \`try-catch\` blocks meaningfully - don't catch errors just to rethrow them
- Prefer early returns over nested conditionals for error cases

### Code Organization

- Keep functions focused and under reasonable cognitive complexity limits
- Extract complex conditions into well-named boolean variables
- Use early returns to reduce nesting
- Prefer simple conditionals over nested ternary operators
- Group related code together and separate concerns

### Security

- Add \`rel="noopener"\` when using \`target="_blank"\` on links
- Avoid \`dangerouslySetInnerHTML\` unless absolutely necessary
- Don't use \`eval()\` or assign directly to \`document.cookie\`
- Validate and sanitize user input

### Performance

- Avoid spread syntax in accumulators within loops
- Use top-level regex literals instead of creating them in loops
- Prefer specific imports over namespace imports
- Avoid barrel files (index files that re-export everything)
${ultracitePresets.includes('ultracite/next') ? '- Use proper image components (e.g., Next.js `<Image>`) over `<img>` tags' : ''}

${
  context.database && context.database !== 'none'
    ? `### Database (${context.database})

- Always use type-safe queries (Drizzle ORM or Prisma ORM)
- Define schema in separate files by domain
- Use transactions for multi-step operations
- Always handle database errors gracefully

`
    : ''
}### Variable Naming (CRITICAL)

❌ NEVER use: \`c\`, \`ctx\`, \`e\`, \`req\`, \`res\`, \`data\`, \`temp\`
✅ ALWAYS use: \`context\`, \`error\`, \`request\`, \`response\`, \`userData\`, \`temporaryBuffer\`

### Testing

- Write tests for critical business logic
- Use ${context.testing === 'bun-test' ? "Bun's built-in test runner" : context.testing === 'vitest' ? 'Vitest' : 'your preferred testing framework'}
- Follow AAA pattern: Arrange, Act, Assert
- Mock external dependencies
`;

  await ensureDirectory(join(projectPath, '.cursor', 'rules'));
  await writeFile(join(projectPath, '.cursor', 'rules', 'ultracite.mdc'), cursorRulesContent);

  // .windsurf/rules/ultracite.md for Windsurf (official Ultracite format)
  const windsurfRulesContent = `# Ultracite Code Standards

This project uses **Ultracite**, a zero-config Biome preset that enforces strict code quality standards through automated formatting and linting.

## Quick Reference

- **Format code**: \`bun run format\` or \`npx ultracite fix\`
- **Check for issues**: \`bun run lint\` or \`npx ultracite check\`
- **Diagnose setup**: \`npx ultracite doctor\`

Biome (the underlying engine) provides extremely fast Rust-based linting and formatting. Most issues are automatically fixable.

---

## Core Principles

Write code that is **accessible, performant, type-safe, and maintainable**. Focus on clarity and explicit intent over brevity.

### Type Safety & Explicitness

- Use explicit types for function parameters and return values when they enhance clarity
- Prefer \`unknown\` over \`any\` when the type is genuinely unknown
- Use const assertions (\`as const\`) for immutable values and literal types
- Leverage TypeScript's type narrowing instead of type assertions
- Use meaningful variable names instead of magic numbers - extract constants with descriptive names
- **TypeScript strictness**: ${context.tsStrictness} mode

### Modern JavaScript/TypeScript

- Use arrow functions for callbacks and short functions
- Prefer \`for...of\` loops over \`.forEach()\` and indexed \`for\` loops
- Use optional chaining (\`?.\`) and nullish coalescing (\`??\`) for safer property access
- Prefer template literals over string concatenation
- Use destructuring for object and array assignments
- Use \`const\` by default, \`let\` only when reassignment is needed, never \`var\`

### Async & Promises

- Always \`await\` promises in async functions - don't forget to use the return value
- Use \`async/await\` syntax instead of promise chains for better readability
- Handle errors appropriately in async code with try-catch blocks
- Don't use async functions as Promise executors

${
  ultracitePresets.includes('ultracite/react')
    ? `### React & JSX

- Use function components over class components
- Call hooks at the top level only, never conditionally
- Specify all dependencies in hook dependency arrays correctly
- Use the \`key\` prop for elements in iterables (prefer unique IDs over array indices)
- Nest children between opening and closing tags instead of passing as props
- Don't define components inside other components
- Use semantic HTML and ARIA attributes for accessibility

${
  ultracitePresets.includes('ultracite/next')
    ? `### Next.js Specific

- Use Next.js \`<Image>\` component for images
- Use Server Components for async data fetching
- Always \`await params\` and \`await searchParams\` in Next.js 16
- Add \`'use client'\` only when needed

`
    : ''
}`
    : ''
}### Variable Naming (CRITICAL)

❌ NEVER use: \`c\`, \`ctx\`, \`e\`, \`req\`, \`res\`, \`data\`, \`temp\`
✅ ALWAYS use: \`context\`, \`error\`, \`request\`, \`response\`, \`userData\`, \`temporaryBuffer\`
`;

  await ensureDirectory(join(projectPath, '.windsurf', 'rules'));
  await writeFile(join(projectPath, '.windsurf', 'rules', 'ultracite.md'), windsurfRulesContent);

  // .claude/CLAUDE.md for Claude Code (official Ultracite format)
  const claudeMdContent = `# Ultracite Code Standards

This project uses **Ultracite**, a zero-config Biome preset that enforces strict code quality standards through automated formatting and linting.

## Quick Reference

- **Format code**: \`bun run format\` or \`npx ultracite fix\`
- **Check for issues**: \`bun run lint\` or \`npx ultracite check\`
- **Diagnose setup**: \`npx ultracite doctor\`

Biome (the underlying engine) provides extremely fast Rust-based linting and formatting. Most issues are automatically fixable.

---

## Core Principles

Write code that is **accessible, performant, type-safe, and maintainable**. Focus on clarity and explicit intent over brevity.

### Type Safety & Explicitness

- Use explicit types for function parameters and return values when they enhance clarity
- Prefer \`unknown\` over \`any\` when the type is genuinely unknown
- Use const assertions (\`as const\`) for immutable values and literal types
- Leverage TypeScript's type narrowing instead of type assertions
- Use meaningful variable names instead of magic numbers - extract constants with descriptive names
- **TypeScript strictness**: ${context.tsStrictness} mode

### Modern JavaScript/TypeScript

- Use arrow functions for callbacks and short functions
- Prefer \`for...of\` loops over \`.forEach()\` and indexed \`for\` loops
- Use optional chaining (\`?.\`) and nullish coalescing (\`??\`) for safer property access
- Prefer template literals over string concatenation
- Use destructuring for object and array assignments
- Use \`const\` by default, \`let\` only when reassignment is needed, never \`var\`

### Async & Promises

- Always \`await\` promises in async functions - don't forget to use the return value
- Use \`async/await\` syntax instead of promise chains for better readability
- Handle errors appropriately in async code with try-catch blocks
- Don't use async functions as Promise executors

${
  ultracitePresets.includes('ultracite/react')
    ? `### React & JSX

- Use function components over class components
- Call hooks at the top level only, never conditionally
- Specify all dependencies in hook dependency arrays correctly
- Use the \`key\` prop for elements in iterables (prefer unique IDs over array indices)
- Nest children between opening and closing tags instead of passing as props
- Don't define components inside other components
- Use semantic HTML and ARIA attributes for accessibility

${
  ultracitePresets.includes('ultracite/next')
    ? `### Next.js Specific

- Use Next.js \`<Image>\` component for images
- Use Server Components for async data fetching
- Always \`await params\` and \`await searchParams\` in Next.js 16
- Add \`'use client'\` only when needed

`
    : ''
}`
    : ''
}### Variable Naming (CRITICAL)

❌ NEVER use: \`c\`, \`ctx\`, \`e\`, \`req\`, \`res\`, \`data\`, \`temp\`
✅ ALWAYS use: \`context\`, \`error\`, \`request\`, \`response\`, \`userData\`, \`temporaryBuffer\`

## Tech Stack

- **Runtime**: Bun
- **Framework**: ${context.preset === 'nextjs' || context.preset === 'web' || context.preset === 'nextjs-monorepo' || context.preset === 'full' ? 'Next.js 16 + React 19' : context.preset === 'hono-api' || context.preset === 'api' ? 'Hono' : context.preset === 'bun-monorepo' ? 'Bun.serve() + React' : 'Minimal'}
${context.cssFramework === 'tailwind' ? '- **Styling**: Tailwind CSS 4\n' : ''}${context.database && context.database !== 'none' ? `- **Database**: ${context.database}\n` : ''}${context.uiLibrary === 'shadcn' ? '- **UI**: shadcn/ui\n' : ''}- **Code Quality**: Ultracite (Biome)
- **Testing**: ${context.testing}
`;

  await ensureDirectory(join(projectPath, '.claude'));
  await writeFile(join(projectPath, '.claude', 'CLAUDE.md'), claudeMdContent);
}

/**
 * Setup standard Biome (without Ultracite)
 */
export async function setupBiome(projectPath: string, _context: TemplateContext): Promise<void> {
  const biomeConfig = {
    $schema: 'https://biomejs.dev/schemas/1.9.4/schema.json',
    vcs: {
      enabled: true,
      clientKind: 'git',
      useIgnoreFile: true,
    },
    files: {
      ignore: ['node_modules', 'dist', 'build', '.next', '.turbo', 'coverage'],
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

  await writeFile(join(projectPath, 'biome.json'), JSON.stringify(biomeConfig, null, 2));
}

/**
 * Get code quality tool dependencies
 */
export function getCodeQualityDependencies(codeQuality: string): Record<string, string> {
  if (codeQuality === 'ultracite') {
    return {
      ultracite: '^6.3.4',
      '@biomejs/biome': '^2.3.6',
    };
  }
  return {
    '@biomejs/biome': '^2.3.6',
  };
}
