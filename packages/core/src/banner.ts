import boxen from 'boxen';
import chalk from 'chalk';

/**
 * Inspirational quotes for CLI banner
 */
const quotes = [
  "Don't Panic - your app is being baked",
  'From scratch to production in seconds',
  'Modern tools for modern builders',
  'Ship faster, build smarter',
  'Type-safe, blazingly fast, production-ready',
  'Bake once, deploy everywhere',
  'The future of full-stack development',
  'Where speed meets elegance',
  'Built for indie hackers, loved by teams',
  'Your shortcut to production excellence',
];

/**
 * Get a random inspirational quote
 */
const getRandomQuote = () => {
  return quotes[Math.floor(Math.random() * quotes.length)];
};

/**
 * ASCII logo using standard characters (figlet-style)
 */
const logo = `
 ____              _    _ _
|  _ \\            | |  (_) |
| |_) |_   _ _ __ | | ___| |_
|  _ <| | | | '_ \\| |/ / | __|
| |_) | |_| | | | |   <| | |_
|____/ \\__,_|_| |_|_|\\_\\_|\\__|
`;

/**
 * Create the CLI banner with professional styling
 * @param version - CLI version to display
 */
export const createBanner = (version: string = '0.3.1') => {
  const quote = getRandomQuote();

  const content = [
    chalk.yellowBright(logo.trim()),
    '',
    chalk.bold.cyan('🍞 Bake production-ready apps in seconds'),
    chalk.dim('Modern • Fast • Opinionated • Type-Safe'),
    '',
    chalk.italic.cyan(quote),
    '',
    chalk.dim(`Version ${version}`),
  ].join('\n');

  return boxen(content, {
    padding: { top: 1, bottom: 1, left: 2, right: 2 },
    margin: { top: 1, bottom: 1 },
    borderColor: 'cyan',
    borderStyle: 'round',
    title: 'bunkit',
    titleAlignment: 'center',
  });
};

/**
 * Show the CLI banner
 * @param version - CLI version to display
 */
export const showBanner = (version?: string) => {
  console.log(createBanner(version));
};
