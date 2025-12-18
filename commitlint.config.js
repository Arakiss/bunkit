// =============================================================================
// bunkit Commitlint Configuration
// =============================================================================
// Enforces Conventional Commits format for semantic versioning
//
// Format: type(scope): description
//
// Examples:
//   feat(cli): add new preset option
//   fix(templates): resolve database setup error
//   refactor(core): improve file system utilities
//
// Product scopes (trigger releases):
//   cli, core, templates, generators
//
// Auxiliary scopes (don't trigger releases):
//   docs, ci, deps, release, test
// =============================================================================

export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Allowed commit types
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature (MINOR bump)
        'fix', // Bug fix (PATCH bump)
        'docs', // Documentation only
        'style', // Formatting, no code change
        'refactor', // Code change that neither fixes nor adds (PATCH bump)
        'perf', // Performance improvement (PATCH bump)
        'test', // Adding tests
        'build', // Build system or dependencies
        'ci', // CI configuration
        'chore', // Other changes
        'revert', // Revert commit
      ],
    ],

    // Allowed scopes (warning only, not blocking)
    'scope-enum': [
      1,
      'always',
      [
        // Package scopes (trigger releases)
        'cli',
        'core',
        'templates',
        'generators',

        // Auxiliary scopes (don't trigger releases)
        'docs',
        'ci',
        'deps',
        'release',
        'test',
        'config',
      ],
    ],

    // Allow any case in subject (we don't enforce lowercase)
    'subject-case': [0],

    // No limit on body line length (for detailed explanations)
    'body-max-line-length': [0],

    // No limit on header length (scopes can make headers long)
    'header-max-length': [0],
  },
};
