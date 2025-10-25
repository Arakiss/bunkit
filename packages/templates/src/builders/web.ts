import { join } from 'pathe';
import { writeFile, ensureDirectory, type TemplateContext } from '@bunkit/core';
import { setupUltracite, setupBiome } from '../generators/ultracite';
import { setupDocker } from '../generators/docker';
import { setupGitHubActions } from '../generators/cicd';

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
          Built with Next.js 16, React 19, and bunkit
        </p>
      </div>
    </main>
  )
}

// Next.js 16 Note:
// When you add dynamic routes with params, make your component async and await params:
// export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
//   const { slug } = await params;
//   return <div>{slug}</div>;
// }
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

  // tsconfig.json - strictness based on user choice
  const getTsCompilerOptions = () => {
    const baseOptions = {
      target: 'ES2017',
      lib: ['dom', 'dom.iterable', 'esnext'],
      allowJs: true,
      skipLibCheck: true,
      noEmit: true,
      esModuleInterop: true,
      module: 'esnext',
      moduleResolution: 'bundler',
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: 'react-jsx',
      incremental: true,
      plugins: [{ name: 'next' }],
      paths: context.pathAliases ? { '@/*': ['./src/*'] } : undefined,
    };

    // Strictness levels
    if (context.tsStrictness === 'strict') {
      return {
        ...baseOptions,
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true,
        noImplicitReturns: true,
      };
    }

    if (context.tsStrictness === 'moderate') {
      return {
        ...baseOptions,
        strict: true,
        noUnusedLocals: false,
        noUnusedParameters: false,
      };
    }

    // Loose
    return {
      ...baseOptions,
      strict: false,
      noImplicitAny: false,
    };
  };

  const tsconfigContent = {
    compilerOptions: getTsCompilerOptions(),
    include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/dev/types/**/*.ts'],
    exclude: ['node_modules'],
  };

  await writeFile(
    join(projectPath, 'tsconfig.json'),
    JSON.stringify(tsconfigContent, null, 2)
  );

  // Setup code quality tools
  if (context.codeQuality === 'ultracite') {
    await setupUltracite(projectPath, context);
  } else {
    await setupBiome(projectPath, context);
  }

  // Setup Docker if requested
  if (context.docker) {
    await setupDocker(projectPath, context);
  }

  // Setup CI/CD if requested
  if (context.cicd) {
    await setupGitHubActions(projectPath, context);
  }
}
