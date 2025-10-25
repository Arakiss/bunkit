import pc from 'picocolors';

/**
 * Simple logger with colored output
 */
export const logger = {
  info(message: string): void {
    console.log(pc.blue('ℹ'), message);
  },

  success(message: string): void {
    console.log(pc.green('✔'), message);
  },

  warn(message: string): void {
    console.log(pc.yellow('⚠'), message);
  },

  error(message: string): void {
    console.error(pc.red('✖'), message);
  },

  step(message: string): void {
    console.log(pc.cyan('→'), message);
  },

  debug(message: string): void {
    if (process.env.DEBUG) {
      console.log(pc.gray('[DEBUG]'), message);
    }
  },

  dim(message: string): void {
    console.log(pc.dim(message));
  },

  br(): void {
    console.log();
  },
};
