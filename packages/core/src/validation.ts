/**
 * Validate project name
 */
export function validateProjectName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Project name cannot be empty' };
  }

  if (name.length > 214) {
    return { valid: false, error: 'Project name must be less than 214 characters' };
  }

  if (name.startsWith('.') || name.startsWith('_')) {
    return { valid: false, error: 'Project name cannot start with . or _' };
  }

  if (!/^[@a-z0-9-_./]+$/i.test(name)) {
    return {
      valid: false,
      error: 'Project name can only contain letters, numbers, hyphens, underscores, slashes, and @',
    };
  }

  const reserved = [
    'node_modules',
    'favicon.ico',
    '.git',
    '.env',
    '.next',
    'dist',
    'build',
  ];

  if (reserved.includes(name.toLowerCase())) {
    return { valid: false, error: `"${name}" is a reserved name` };
  }

  return { valid: true };
}

/**
 * Validate path for project creation
 */
export function validatePath(path: string): { valid: boolean; error?: string } {
  if (!path || path.trim().length === 0) {
    return { valid: false, error: 'Path cannot be empty' };
  }

  if (path.includes('..')) {
    return { valid: false, error: 'Path cannot contain ".."' };
  }

  return { valid: true };
}

/**
 * Validate package name format
 */
export function validatePackageName(name: string): { valid: boolean; error?: string } {
  const result = validateProjectName(name);
  if (!result.valid) return result;

  if (name.length > 214) {
    return { valid: false, error: 'Package name must be less than 214 characters' };
  }

  if (name !== name.toLowerCase()) {
    return { valid: false, error: 'Package name must be lowercase' };
  }

  return { valid: true };
}
