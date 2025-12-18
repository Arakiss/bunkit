import type { TemplateContext } from '@bunkit/core';

/**
 * Generate bunfig.toml content with sensible defaults and documentation
 */
export function generateBunfigContent(context: TemplateContext): string {
  const isMonorepo = context.preset === 'full';
  const hasTesting = context.testing !== 'none';

  return `# bunfig.toml
# Bun configuration file - customize Bun's behavior for this project
# Documentation: https://bun.sh/docs/cli/bunfig

# ========================================
# Package Installation
# ========================================
[install]
# Don't freeze lockfile during development for faster installs
# Set to true in CI/CD for reproducible builds
frozenLockfile = false

# Auto-install dependencies when running scripts
# Options: "auto" | "force" | "disable" | "fallback"
# - "auto": Install if node_modules doesn't exist (default)
# - "force": Always auto-install
# - "disable": Never auto-install
# - "fallback": Check node_modules first, then auto-install missing packages
auto = "auto"

# Install optional dependencies (default: true)
optional = true

# Install dev dependencies (default: true)
dev = true

# Install peer dependencies (default: true)
peer = true

# Use exact versions instead of caret ranges (default: false)
# Set to true for stricter version control
exact = false

# Generate text-based lockfile (bun.lock) instead of binary (bun.lockb)
# Text lockfiles are easier to review in git diffs (default: true since Bun v1.2)
saveTextLockfile = true

${
  isMonorepo
    ? `# Monorepo: Use isolated installs for better dependency isolation
# Options: "hoisted" | "isolated"
# - "hoisted": Shared node_modules (faster, less disk space)
# - "isolated": Per-package node_modules (better isolation, more disk space)
linker = "isolated"

# Link workspace packages to node_modules (default: true)
linkWorkspacePackages = true
`
    : ''
}

# ========================================
# Runtime Configuration
# ========================================
# Log level for Bun runtime
# Options: "debug" | "warn" | "error"
# Set to "debug" for verbose output during development
logLevel = "warn"

# Enable telemetry (default: true)
# Bun records bundle timings and feature usage to improve performance
# Set to false to disable (equivalent to DO_NOT_TRACK env variable)
telemetry = true

# Console output depth for object inspection (default: 2)
# Higher values show more nested properties
[console]
depth = 2

${
  hasTesting
    ? `# ========================================
# Test Runner Configuration
# ========================================
[test]
# Enable test coverage reporting
# Use --coverage flag to override
coverage = true

# Coverage threshold (0.0 to 1.0)
# If coverage is below this threshold, tests will fail
# Uncomment and adjust as needed:
# coverageThreshold = 0.8
# Or specify per metric:
# coverageThreshold = { line = 0.8, function = 0.9, statement = 0.85 }

# Skip test files when computing coverage (default: false)
coverageSkipTestFiles = false

# Coverage report formats
# Options: "text" | "lcov" | "json"
# "lcov" is recommended for CI/CD and coverage tools
coverageReporter = ["text", "lcov"]

# Directory for coverage reports (default: "coverage")
coverageDir = "coverage"

# Exclude files from coverage using glob patterns
# coveragePathIgnorePatterns = [
#   "**/*.spec.ts",
#   "**/*.test.ts",
#   "src/utils/**",
#   "*.config.js"
# ]

# Run tests in random order to catch interdependencies (default: false)
# Set to true to randomize test execution order
randomize = false

# Random seed for reproducible test order (requires randomize = true)
# seed = 1234567890

# Re-run each test file N times to catch flaky tests (default: 0)
# rerunEach = 3

# Glob pattern for tests that should run concurrently
# Example: concurrentTestGlob = "**/concurrent-*.test.ts"
# concurrentTestGlob = "**/*.test.ts"

# Only show failed tests in output (default: false)
# Reduces noise in large test suites
onlyFailures = false

# Test reporter configuration
[test.reporter]
# Enable dots reporter (compact output)
# dots = true

# Generate JUnit XML report for CI/CD
# junit = "test-results.xml"
`
    : ''
}

# ========================================
# Script Execution (bun run)
# ========================================
[run]
# Shell to use for package.json scripts
# Options: "system" | "bun"
# - "system": Use system shell (default on Unix)
# - "bun": Use Bun's built-in shell (default on Windows)
shell = "system"

# Auto-alias 'node' to 'bun' in scripts (default: true if node not in PATH)
# When true, scripts calling 'node' will actually run 'bun'
# Equivalent to --bun flag for all bun run commands
bun = true

# Suppress command output (default: false)
# When true, don't print the command being run
# silent = false

# ========================================
# Development Tips
# ========================================
# Debug network requests:
#   Set BUN_CONFIG_VERBOSE_FETCH=true to see fetch requests
#   Set BUN_CONFIG_VERBOSE_FETCH=curl to see as curl commands
#
# Debug install issues:
#   Set BUN_CONFIG_VERBOSE_INSTALL=true for detailed install logs
#
# Performance profiling:
#   Use bun --profile script.ts to generate performance profile
#
# Memory profiling:
#   Use bun --inspect script.ts for Node.js-compatible debugging
`;
}
