import pc from 'picocolors';

export const banner = `
${pc.yellow('    ____              __   _ __     🍞')}
${pc.yellow('   / __ )__  ______  / /__(_) /_')}
${pc.yellow('  / __  / / / / __ \\/ //_/ / __/')}
${pc.yellow(' / /_/ / /_/ / / / / ,< / / /_')}
${pc.yellow('/_____/\\__,_/_/ /_/_/|_/_/\\__/')}

${pc.dim('━'.repeat(40))}
${pc.cyan('  Bake production-ready apps in seconds')}
${pc.dim('━'.repeat(40))}
`;

export const showBanner = () => {
  console.log(banner);
};
