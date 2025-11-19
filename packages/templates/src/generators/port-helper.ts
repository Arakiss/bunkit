import { join } from 'pathe';
import { writeFile, ensureDirectory } from '@bunkit/core';

/**
 * Create a dev script wrapper that handles port conflicts gracefully
 * This script will try the default port, and if it fails, suggest alternatives
 */
export async function createDevScriptWrapper(
  projectPath: string,
  appName: string,
  defaultPort: number
): Promise<void> {
  const scriptsPath = join(projectPath, 'scripts');
  await ensureDirectory(scriptsPath);

  const scriptContent = `#!/usr/bin/env bun
/**
 * Dev script wrapper for ${appName}
 * Handles port conflicts gracefully
 */

const DEFAULT_PORT = ${defaultPort};
const PORT = parseInt(process.env.PORT || DEFAULT_PORT.toString(), 10);

// Set PORT for Next.js to use
process.env.PORT = PORT.toString();

// Import and run Next.js dev server
import { spawn } from 'bun';
import { join } from 'path';

const nextBin = join(process.cwd(), 'node_modules', '.bin', 'next');

const proc = spawn({
  cmd: [nextBin, 'dev', '-p', PORT.toString()],
  stdio: ['inherit', 'inherit', 'inherit'],
  env: {
    ...process.env,
    PORT: PORT.toString(),
  },
});

proc.exited.then((code) => {
  if (code !== 0 && code !== null) {
    console.error(\`\\n❌ Failed to start server on port \${PORT}\\n\`);
    console.error(\`💡 Try using a different port:\\n\`);
    console.error(\`   PORT=\${PORT + 1} bun dev\\n\`);
    process.exit(code);
  }
});
`;

  await writeFile(join(scriptsPath, `${appName}-dev.ts`), scriptContent);
}

/**
 * Create a port helper script that detects available ports
 * This allows apps to automatically find available ports if the default is in use
 */
export async function createPortHelper(projectPath: string): Promise<void> {
  const scriptsPath = join(projectPath, 'scripts');
  await ensureDirectory(scriptsPath);

  // Port detection helper script
  const portHelperContent = `#!/usr/bin/env bun
/**
 * Port detection helper for bunkit projects
 * Automatically finds an available port if the default is in use
 */

const DEFAULT_PORT = parseInt(process.env.DEFAULT_PORT || '3000', 10);
const MAX_ATTEMPTS = 10;

/**
 * Check if a port is available
 */
async function isPortAvailable(port: number): Promise<boolean> {
  try {
    const server = Bun.serve({
      port,
      fetch: () => new Response('test'),
    });
    server.stop();
    return true;
  } catch {
    return false;
  }
}

/**
 * Find an available port starting from the default port
 */
async function findAvailablePort(startPort: number): Promise<number> {
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const port = startPort + i;
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  
  // If no port found in range, throw error
  throw new Error(
    \`No available ports found in range \${startPort}-\${startPort + MAX_ATTEMPTS - 1}.\\n\` +
    \`Please free up a port or set PORT environment variable.\`
  );
}

/**
 * Get port to use (from env, or find available)
 */
async function getPort(): Promise<number> {
  // If PORT is explicitly set, use it
  if (process.env.PORT) {
    const port = parseInt(process.env.PORT, 10);
    if (await isPortAvailable(port)) {
      return port;
    }
    throw new Error(
      \`Port \${port} is already in use.\\n\` +
      \`Please free up the port or set PORT to a different value.\\n\` +
      \`Suggested ports: \${port + 1}, \${port + 2}, \${port + 3}\`
    );
  }

  // Try default port first
  if (await isPortAvailable(DEFAULT_PORT)) {
    return DEFAULT_PORT;
  }

  // Find next available port
  console.warn(
    \`⚠️  Port \${DEFAULT_PORT} is already in use. Finding next available port...\\n\`
  );
  
  const availablePort = await findAvailablePort(DEFAULT_PORT);
  
  if (availablePort !== DEFAULT_PORT) {
    console.warn(
      \`✅ Using port \${availablePort} instead.\\n\` +
      \`💡 Tip: Set PORT=\${availablePort} to use this port explicitly.\\n\`
    );
  }

  return availablePort;
}

// Main execution
if (import.meta.main) {
  try {
    const port = await getPort();
    console.log(port.toString());
    process.exit(0);
  } catch (error) {
    console.error(\`❌ \${(error as Error).message}\`);
    process.exit(1);
  }
}

export { getPort, isPortAvailable, findAvailablePort };
`;

  await writeFile(join(scriptsPath, 'port-helper.ts'), portHelperContent);
}

/**
 * Create a dev script wrapper that uses port detection
 */
export function createDevScriptWithPortDetection(
  defaultPort: number,
  command: string = 'next dev'
): string {
  return `bun run scripts/port-helper.ts --default-port=${defaultPort} | xargs -I {} ${command} -p {} || ${command} -p ${defaultPort}`;
}

/**
 * Create a simpler dev script that uses PORT env var with fallback
 * This is cleaner and more standard
 */
export function createDevScriptWithEnvPort(
  defaultPort: number,
  command: string = 'next dev'
): string {
  return `${command} -p \${PORT:-${defaultPort}}`;
}

