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

  const docsContent = `# shadcn/ui Guide

This project uses [shadcn/ui](https://ui.shadcn.com) - a collection of re-usable components built with Radix UI and Tailwind CSS.

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
bunx shadcn@latest add button
bunx shadcn@latest add card
bunx shadcn@latest add input
\`\`\`

### Using Components

Import components from the \`@/components/ui\` path:

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
\`\`\`

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
@layer base {
  :root {
    --radius: 0.625rem;
    --background: oklch(...);
    --foreground: oklch(...);
    /* ... */
  }
}
\`\`\`

### Component Customization

Components are copied directly into your project at \`${isMonorepo ? 'packages/ui/src/components/ui' : 'src/components/ui'}\`. You can modify them directly - they're YOUR code!

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

