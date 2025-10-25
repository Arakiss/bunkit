import pc from 'picocolors';

const quotes = [
  "Don't Panic - your app is being baked",
  "From scratch to production in seconds",
  "Freshly baked, ready to serve",
  "The best code is the code you don't write",
  "Keep calm and bake on",
  "Made with ♥ for indie hackers",
  "Ship fast, iterate faster",
  "Less boilerplate, more building",
  "Your next big idea starts here",
  "Baking dreams into reality"
];

const getRandomQuote = () => {
  return quotes[Math.floor(Math.random() * quotes.length)];
};

export const createBanner = (version: string = '0.3.0') => {
  const quote = getRandomQuote();

  return `
${pc.dim('╔' + '═'.repeat(50) + '╗')}
${pc.dim('║')}                                                  ${pc.dim('║')}
${pc.dim('║')}   ${pc.yellow('┏┓ ┳ ┳┏┓┓┏o╋')}                                  ${pc.dim('║')}
${pc.dim('║')}   ${pc.yellow('┣┫ ┃ ┃┃┃┣┫┃ ┃')}   ${pc.dim('Modern. Fast. Opinionated.')}    ${pc.dim('║')}
${pc.dim('║')}   ${pc.yellow('┗┛•┗━┛┛┗┛┗┻ ┻')}                                  ${pc.dim('║')}
${pc.dim('║')}                                                  ${pc.dim('║')}
${pc.dim('║')}   ${pc.cyan(quote.padEnd(46))}   ${pc.dim('║')}
${pc.dim('║')}                                                  ${pc.dim('║')}
${pc.dim('║')}   ${pc.dim(`v${version}`)}${' '.repeat(43 - version.length)}🍞  ${pc.dim('║')}
${pc.dim('╚' + '═'.repeat(50) + '╝')}
`;
};

export const showBanner = (version?: string) => {
  console.log(createBanner(version));
};
