# Testing Guide

This package uses [Bun Test](https://bun.sh/docs/cli/test) for testing, which is Jest-compatible and fast.

## Running Tests

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch

# Run tests with coverage
bun test --coverage

# Run specific test file
bun test src/project.test.ts
```

## Test Structure

Tests are co-located with source files using the `.test.ts` suffix:

```
packages/core/src/
  ├── project.ts          # Source file
  ├── project.test.ts     # Tests for project.ts
  ├── validation.ts
  └── validation.test.ts
```

## Writing Tests

### Basic Test Structure

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'bun:test';

describe('functionName', () => {
  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    // Cleanup after each test
  });

  it('should do something', () => {
    expect(actual).toBe(expected);
  });
});
```

### Testing Async Functions

```typescript
it('should handle async operations', async () => {
  await expect(asyncFunction()).resolves.toBe(expected);
  // or
  await expect(asyncFunction()).rejects.toThrow('Error message');
});
```

### Testing File System Operations

When testing file system operations, use temporary directories:

```typescript
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'pathe';

let testDir: string;

beforeEach(async () => {
  testDir = await mkdtemp(join(tmpdir(), 'bunkit-test-'));
  process.chdir(testDir);
});

afterEach(async () => {
  process.chdir(tmpdir());
  await rm(testDir, { recursive: true, force: true });
});
```

## Current Test Coverage

- ✅ `createProject` - Project creation logic and nested directory prevention
- ✅ `validateProjectName` - Project name validation
- ✅ `validatePath` - Path validation
- ✅ `validatePackageName` - Package name validation

## Areas Needing Tests

- [ ] `fs.ts` - File system utilities
- [ ] `git.ts` - Git operations
- [ ] `install.ts` - Dependency installation
- [ ] `monorepo.ts` - Monorepo detection and utilities
- [ ] `presets.ts` - Preset validation and utilities

## Best Practices

1. **Isolate tests**: Each test should be independent and not rely on other tests
2. **Clean up**: Always clean up temporary files and directories
3. **Test edge cases**: Don't just test happy paths
4. **Use descriptive names**: Test names should clearly describe what they're testing
5. **Keep tests fast**: Avoid slow operations, use mocks when necessary

## Coverage Goals

- **Current**: ~58% overall coverage
- **Target**: 80%+ coverage for critical paths
- **Priority**: Focus on core abstractions first (`project.ts`, `validation.ts`, `fs.ts`)

