---
"@bunkit/core": patch
"bunkit-cli": patch
---

Add comprehensive test suite with 98%+ code coverage

- Add tests for all core modules (fs, git, install, logger, monorepo, presets, project, validation, banner)
- Fix bug in git.ts to handle empty directory commits gracefully
- Refactor presets.ts to use dynamic path calculation for better testability
- Add test coverage badge to README
- All tests pass with Bun test framework

