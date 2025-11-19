import { join } from 'pathe';
import { writeFile, ensureDirectory } from '@bunkit/core';
import type { TemplateContext } from '@bunkit/core';

/**
 * Create shadcn/ui documentation/README in the project
 */
export async function createShadcnDocs(
  projectPath: string,
  isMonorepo: boolean = false,
  context?: TemplateContext
): Promise<void> {
  const docsPath = isMonorepo
    ? join(projectPath, 'packages/ui/SHADCN.md')
    : join(projectPath, 'SHADCN.md');

  const monorepoSection = isMonorepo ? `
## 🏗️ Bun Monorepo Setup

This is a **Bun monorepo** with shared UI components in \`packages/ui\`. All shadcn/ui components are installed here and shared across all apps in the monorepo.

### Monorepo Structure

\`\`\`
packages/
  ui/                    # Shared UI package
    src/
      components/ui/     # shadcn/ui components
      styles/            # Tailwind CSS v4 configuration
      lib/utils.ts       # Utility functions (cn helper)
    components.json      # shadcn/ui configuration
\`\`\`

### Adding Components (Monorepo)

Components are installed in \`packages/ui\` and automatically shared:

\`\`\`bash
# From project root - bunkit handles monorepo detection
bunkit add component --components button

# Or directly in packages/ui directory
cd packages/ui
bunx shadcn@latest add button
\`\`\`

### Using Components (Monorepo)

Import components using Bun workspace aliases:

\`\`\`tsx
// Recommended: Use @workspace/ui alias (Bun workspace resolution)
import { Button } from "@workspace/ui/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/ui/card"

// Or use the package name directly
import { Button } from "@${context?.packageName || 'workspace'}/ui/components/ui/button"
\`\`\`

### Tailwind CSS v4 Configuration

Tailwind CSS v4 is configured in \`packages/ui/src/styles/globals.css\` using CSS-first configuration:
- ✅ No \`tailwind.config.ts\` needed (Tailwind v4 feature)
- ✅ Uses \`@theme inline\` directive for design tokens
- ✅ OKLCH color space (modern color format)
- ✅ Shared across all apps via workspace imports

All apps import the CSS from the UI package:
\`\`\`css
/* In apps/web/src/app/globals.css */
@import "../../../packages/ui/src/styles/globals.css";
\`\`\`

### Bun Workspace Features

This setup leverages Bun 1.3 workspace features:
- **Catalogs**: Dependency versions managed in root \`package.json\` catalog
- **Isolated Installs**: Each package only sees its declared dependencies
- **Workspace Aliases**: Use \`@workspace/ui\` for internal imports
- **Fast Resolution**: Bun's native workspace resolution

` : '';

  const docsContent = `# shadcn/ui Guide

This project uses [shadcn/ui](https://ui.shadcn.com) - a collection of re-usable components built with Radix UI and Tailwind CSS v4.

${monorepoSection}

## 🚀 Quick Start

### Adding Components

Use the bunkit CLI to add components:

\`\`\`bash
# Add a single component
bunkit add component --components button

# Add multiple components
bunkit add component --components button,card,input

# Browse all available components
bunkit add component --all
\`\`\`

Or use the official shadcn CLI directly:

\`\`\`bash
${isMonorepo ? 'cd packages/ui && ' : ''}bunx shadcn@latest add button
${isMonorepo ? 'cd packages/ui && ' : ''}bunx shadcn@latest add card
${isMonorepo ? 'cd packages/ui && ' : ''}bunx shadcn@latest add input
\`\`\`

### Using Components

${isMonorepo 
  ? `Import components from the \`@workspace/ui\` package:

\`\`\`tsx
import { Button } from "@workspace/ui/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/ui/card"

export function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hello</CardTitle>
        <CardDescription>World</CardDescription>
      </CardHeader>
      <CardContent>
        <Button>Click me</Button>
      </CardContent>
    </Card>
  )
}
\`\`\``
  : `Import components from the \`@/components/ui\` path:

\`\`\`tsx
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hello</CardTitle>
        <CardDescription>World</CardDescription>
      </CardHeader>
      <CardContent>
        <Button>Click me</Button>
      </CardContent>
    </Card>
  )
}
\`\`\``}

## 📚 Available Components

shadcn/ui provides 60+ components. Browse them all at [ui.shadcn.com](https://ui.shadcn.com/components).

### Most Popular Components

- **Button** - \`bunkit add component --components button\`
- **Card** - \`bunkit add component --components card\`
- **Input** - \`bunkit add component --components input\`
- **Dialog** - \`bunkit add component --components dialog\`
- **Dropdown Menu** - \`bunkit add component --components dropdown-menu\`
- **Form** - \`bunkit add component --components form\`
- **Table** - \`bunkit add component --components table\`
- **Toast** - \`bunkit add component --components toast\`

## 🎨 Customization

### Themes

Your project is configured with:
- **Style**: ${context?.shadcnStyle || 'new-york'}
- **Base Color**: ${context?.shadcnBaseColor || 'zinc'}
- **Border Radius**: ${context?.shadcnRadius || '0.625rem'}

### Modifying Themes

Edit the CSS variables in \`${isMonorepo ? 'packages/ui/src/styles/globals.css' : 'src/app/globals.css'}\`:

\`\`\`css
/* Tailwind CSS v4 uses CSS-first configuration */
@import "tailwindcss";
@import "tw-animate-css";

:root {
  --radius: 0.625rem;
  --background: oklch(...);
  --foreground: oklch(...);
  /* ... */
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  /* ... */
}
\`\`\`

**Note**: Tailwind CSS v4 uses CSS-first configuration. No \`tailwind.config.ts\` is needed - all configuration is done via CSS using the \`@theme inline\` directive.

### Component Customization

Components are copied directly into your project at \`${isMonorepo ? 'packages/ui/src/components/ui' : 'src/components/ui'}\`. You can modify them directly - they're YOUR code!

${isMonorepo ? `
**Monorepo Tip**: Since components are in \`packages/ui\`, changes automatically propagate to all apps that import them. This ensures consistent UI across your entire monorepo.
` : ''}

## 📖 Documentation

- [Official shadcn/ui Docs](https://ui.shadcn.com)
- [Component Examples](https://ui.shadcn.com/components)
- [Theming Guide](https://ui.shadcn.com/theming)

## 💡 Tips

1. **Components are yours** - They're copied into your project, so feel free to modify them
2. **Type-safe** - All components are fully typed with TypeScript
3. **Accessible** - Built on Radix UI primitives for accessibility
4. **Customizable** - Use Tailwind classes to style components however you want

## 🔧 Configuration

Your \`components.json\` file (located at \`${isMonorepo ? 'packages/ui/components.json' : 'components.json'}\`) contains all shadcn/ui configuration.

To change settings, edit this file or run:

\`\`\`bash
bunx shadcn@latest init
\`\`\`

---

**Happy building! 🚀**
`;

  try {
    await ensureDirectory(join(docsPath, '..'));
    await writeFile(docsPath, docsContent);
  } catch (error) {
    // Non-critical - skip if fails
  }
}

