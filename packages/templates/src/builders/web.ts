import { join } from 'pathe';
import { writeFile, ensureDirectory, type TemplateContext } from '@bunkit/core';

/**
 * Build web (Next.js) preset files
 */
export async function buildWebPreset(
  projectPath: string,
  context: TemplateContext
): Promise<void> {
  // Create directories
  await ensureDirectory(join(projectPath, 'src/app'));
  await ensureDirectory(join(projectPath, 'public'));

  // src/app/layout.tsx
  const layoutContent = `import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '${context.projectName}',
  description: 'Built with bunkit 🍞',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
`;

  await writeFile(join(projectPath, 'src/app/layout.tsx'), layoutContent);

  // src/app/page.tsx
  const pageContent = `export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to ${context.projectName} 🍞
        </h1>
        <p className="text-gray-600">
          Built with Next.js 15, React 19, and bunkit
        </p>
      </div>
    </main>
  )
}
`;

  await writeFile(join(projectPath, 'src/app/page.tsx'), pageContent);

  // src/app/globals.css
  const globalsCssContent = `@import "tailwindcss";
`;

  await writeFile(join(projectPath, 'src/app/globals.css'), globalsCssContent);

  // next.config.ts
  const nextConfigContent = `import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
`;

  await writeFile(join(projectPath, 'next.config.ts'), nextConfigContent);

  // tailwind.config.ts
  const tailwindConfigContent = `import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
`;

  await writeFile(join(projectPath, 'tailwind.config.ts'), tailwindConfigContent);

  // tsconfig.json
  const tsconfigContent = {
    compilerOptions: {
      target: 'ES2017',
      lib: ['dom', 'dom.iterable', 'esnext'],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: 'esnext',
      moduleResolution: 'bundler',
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: 'preserve',
      incremental: true,
      plugins: [{ name: 'next' }],
      paths: {
        '@/*': ['./src/*'],
      },
    },
    include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
    exclude: ['node_modules'],
  };

  await writeFile(
    join(projectPath, 'tsconfig.json'),
    JSON.stringify(tsconfigContent, null, 2)
  );

  // biome.json
  const biomeContent = {
    $schema: 'https://biomejs.dev/schemas/1.9.4/schema.json',
    vcs: {
      enabled: true,
      clientKind: 'git',
      useIgnoreFile: true,
    },
    formatter: {
      enabled: true,
      indentStyle: 'space',
      indentWidth: 2,
    },
    linter: {
      enabled: true,
      rules: {
        recommended: true,
      },
    },
  };

  await writeFile(
    join(projectPath, 'biome.json'),
    JSON.stringify(biomeContent, null, 2)
  );
}
