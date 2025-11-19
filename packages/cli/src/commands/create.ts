import * as p from '@clack/prompts';
import boxen from 'boxen';
import chalk from 'chalk';
import { join } from 'pathe';
import {
  validateProjectName,
  createProject,
  createTemplateContext,
  installDependencies,
  type ProjectConfig,
  type PresetType,
  type ShadcnBaseColor,
  type ShadcnStyle,
} from '@bunkit/core';
import {
  buildMinimalPreset,
  buildWebPreset,
  buildApiPreset,
  buildBunApiPreset,
  buildBunFullstackPreset,
  buildFullPreset,
  buildMonorepoBunPreset,
  buildEnterprisePreset,
  installDefaultShadcnComponents,
} from '@bunkit/templates';

/**
 * Quick, non-interactive project creation command
 * Uses sensible defaults for faster scaffolding
 */
export async function createCommand(
  preset: string,
  name: string,
  options: { git?: boolean; install?: boolean }
) {
  // Normalize preset (handle aliases to primary names)
  const presetMap: Record<string, string> = {
    'web': 'nextjs',
    'api': 'hono-api',
    'full': 'nextjs-monorepo',
    'monorepo-nextjs': 'nextjs-monorepo',
    'monorepo-bun': 'bun-monorepo',
  };
  const normalizedPreset = presetMap[preset] || preset;
  
  // Validate preset (accept both primary names and aliases)
  const validPresets = [
    'minimal', 
    'nextjs', 'web',
    'hono-api', 'api',
    'bun-api', 
    'bun-fullstack', 
    'nextjs-monorepo', 'full', 'monorepo-nextjs',
    'bun-monorepo', 'monorepo-bun',
    'enterprise-monorepo'
  ];
  if (!validPresets.includes(normalizedPreset)) {
    throw new Error(
      `Invalid preset: ${preset}. Valid options: ${validPresets.join(', ')}`
    );
  }

  // Validate project name
  const validation = validateProjectName(name);
  if (!validation.valid) {
    throw new Error(`Invalid project name: ${validation.error}`);
  }

  console.log(''); // Add spacing
  
  const s = p.spinner();
  const isEnterprise = normalizedPreset === 'enterprise-monorepo';
  
  // Enterprise preset: Allow quick customization of shadcn/ui config
  let shadcnStyle: ShadcnStyle = 'new-york';
  let shadcnBaseColor: ShadcnBaseColor = 'zinc';
  let shadcnRadius = '0.625rem';
  
  if (isEnterprise) {
    // Show defaults and ask if user wants to customize
    p.note(
      `Default theme: ${chalk.cyan('New York')} style, ${chalk.cyan('Zinc')} color, ${chalk.cyan('0.625rem')} radius`,
      'shadcn/ui defaults'
    );
    
    const customize = await p.confirm({
      message: `🎨 Customize shadcn/ui theme?`,
      initialValue: false,
    });
    
    if (p.isCancel(customize)) {
      p.cancel('Operation cancelled.');
      process.exit(0);
    }
    
    if (customize) {
      // Ask for style
      const styleChoice = await p.select({
        message: '🎨 Component style',
        options: [
          { value: 'new-york', label: 'New York (Recommended)', hint: 'Modern, rounded, subtle shadows' },
          { value: 'default', label: 'Default', hint: 'Classic, sharper edges, higher contrast' },
        ],
        initialValue: 'new-york',
      });
      
      if (p.isCancel(styleChoice)) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }
      shadcnStyle = styleChoice as ShadcnStyle;
      
      // Ask for base color
      const colorChoice = await p.select({
        message: '🎨 Base color theme',
        options: [
          { value: 'zinc', label: 'Zinc (Recommended)', hint: 'Neutral gray - versatile, modern' },
          { value: 'neutral', label: 'Neutral', hint: 'Pure neutral - no color cast' },
          { value: 'gray', label: 'Gray', hint: 'Warm gray palette' },
          { value: 'slate', label: 'Slate', hint: 'Cool gray - bluer tone' },
          { value: 'stone', label: 'Stone', hint: 'Warm beige-gray - earthy feel' },
        ],
        initialValue: 'zinc',
      });
      
      if (p.isCancel(colorChoice)) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }
      shadcnBaseColor = colorChoice as ShadcnBaseColor;
      
      // Ask for radius
      const radiusInput = await p.text({
        message: '📐 Border radius',
        placeholder: '0.625rem',
        initialValue: '0.625rem',
        validate: (value) => {
          if (!value.trim()) return 'Radius cannot be empty';
          if (!/^\d+(\.\d+)?(rem|px|em|%)$/.test(value.trim())) {
            return 'Please enter a valid CSS value (e.g., 0.5rem, 8px)';
          }
        },
      });
      
      if (p.isCancel(radiusInput)) {
        p.cancel('Operation cancelled.');
        process.exit(0);
      }
      shadcnRadius = radiusInput as string;
    }
  }
  
  s.start(`${chalk.cyan('🔨')} Creating ${preset} project: ${chalk.bold(name)}`);

  try {
    // Create project with sensible defaults
    // Enterprise preset gets production-ready defaults
    const config: ProjectConfig = {
      name,
      preset: normalizedPreset as PresetType,
      path: name,
      git: options.git !== false, // Default: true
      install: options.install !== false, // Default: true
      database: 'none', // Default: no database
      redis: false, // Default: no Redis
      useBunSecrets: false, // Default: use .env
      codeQuality: isEnterprise ? 'biome' : 'ultracite', // Enterprise uses biome, others use ultracite
      tsStrictness: 'strict', // Default: strict TypeScript
      testing: 'bun-test', // Default: bun's built-in test
      docker: false, // Default: no Docker
      cicd: false, // Default: no CI/CD
      envExample: true,
      pathAliases: true,
      // Enterprise preset defaults: Tailwind + shadcn/ui
      cssFramework: isEnterprise ? 'tailwind' : undefined,
      uiLibrary: isEnterprise ? 'shadcn' : undefined,
      shadcnStyle: isEnterprise ? shadcnStyle : undefined,
      shadcnBaseColor: isEnterprise ? shadcnBaseColor : undefined,
      shadcnRadius: isEnterprise ? shadcnRadius : undefined,
    };

    s.message(`${chalk.cyan('📁')} Creating project structure...`);
    await createProject(config);

    const projectPath = join(process.cwd(), config.path);
    const context = createTemplateContext(config);

    s.message(`${chalk.cyan('📝')} Generating project files...`);

    // Build preset-specific files
    switch (normalizedPreset) {
      case 'minimal':
        await buildMinimalPreset(projectPath, context);
        break;
      case 'nextjs':
        await buildWebPreset(projectPath, context);
        break;
      case 'hono-api':
        await buildApiPreset(projectPath, context);
        break;
      case 'bun-api':
        await buildBunApiPreset(projectPath, context);
        break;
      case 'bun-fullstack':
        await buildBunFullstackPreset(projectPath, context);
        break;
      case 'nextjs-monorepo':
        await buildFullPreset(projectPath, context);
        break;
      case 'bun-monorepo':
        await buildMonorepoBunPreset(projectPath, context);
        break;
      case 'enterprise-monorepo':
        await buildEnterprisePreset(projectPath, context);
        break;
    }

    s.message(`${chalk.cyan('✨')} Finalizing setup...`);
    
    // Install dependencies first (critical for monorepos with catalog: references)
    // This ensures Bun resolves all catalog: dependencies before shadcn CLI runs
    if (config.install !== false) {
      s.message(`${chalk.cyan('📦')} Installing dependencies...`);
      try {
        await installDependencies(projectPath);
      } catch (error) {
        s.message(`${chalk.yellow('⚠️')} Dependency installation had issues, but continuing...`);
      }
    }
    
    // Install default shadcn/ui components for enterprise preset with shadcn/ui
    // Dependencies must be installed first so Bun resolves catalog: references
    // shadcn CLI internally uses npm which doesn't understand catalog: protocol
    if (isEnterprise && config.uiLibrary === 'shadcn' && config.install !== false) {
      s.message(`${chalk.cyan('🧩')} Installing default shadcn/ui components...`);
      try {
        await installDefaultShadcnComponents(projectPath, {
          silent: false,
          skipDefaults: false,
        });
      } catch (error) {
        // Non-critical - components can be installed manually
        s.message(`${chalk.yellow('⚠️')} Could not install default components automatically`);
        s.message(`${chalk.dim('   You can install them manually:')} ${chalk.cyan('cd packages/ui && bun install && bunx shadcn@latest add button card')}`);
      }
    }
    
    s.stop(`${chalk.green('✅')} Project ${chalk.bold(name)} created successfully!`);

    const getPresetEmoji = () => {
      switch (normalizedPreset) {
        case 'minimal': return '⚡';
        case 'nextjs': return '🌐';
        case 'hono-api': return '🚀';
        case 'bun-api': return '⚡';
        case 'bun-fullstack': return '🔥';
        case 'nextjs-monorepo': return '📦';
        case 'bun-monorepo': return '🔥';
        case 'enterprise-monorepo': return '🏢';
        default: return '✨';
      }
    };

    // Show next steps with better formatting
    const nextStepsContent = [
      `${chalk.bold.cyan('📁 Navigate to your project')}`,
      `${chalk.cyan('cd')} ${chalk.bold(name)}`,
      '',
      options.install === false ? [
        `${chalk.bold.cyan('📦 Install dependencies')}`,
        `${chalk.cyan('bun install')}`,
        '',
      ].join('\n') : '',
      `${chalk.bold.cyan('🚀 Start development')}`,
      `${chalk.cyan(normalizedPreset === 'nextjs' ? 'bun dev' : 'bun run dev')} ${chalk.dim('# Start development server')}`,
      '',
      `${chalk.dim('─'.repeat(40))}`,
      `${chalk.bold.yellow('💡 Tip')}`,
      `  Use ${chalk.cyan('bunkit init')} for full customization options`,
    ].filter(Boolean).join('\n');

    console.log('\n' + boxen(nextStepsContent, {
      padding: { top: 1, bottom: 1, left: 2, right: 2 },
      title: `${getPresetEmoji()} Next Steps`,
      titleAlignment: 'left',
      borderColor: 'green',
      borderStyle: 'round',
      dimBorder: false,
    }));
  } catch (error) {
    s.stop(`${chalk.red('❌')} Project creation failed`);
    
    const errorBox = [
      `${chalk.bold.red('Error occurred')}`,
      '',
      chalk.red((error as Error).message),
      '',
      `${chalk.dim('Need help?')} ${chalk.cyan('https://github.com/Arakiss/bunkit/issues')}`,
    ].join('\n');

    console.log('\n' + boxen(errorBox, {
      padding: { top: 1, bottom: 1, left: 2, right: 2 },
      borderColor: 'red',
      borderStyle: 'round',
    }));

    throw error;
  }
}
