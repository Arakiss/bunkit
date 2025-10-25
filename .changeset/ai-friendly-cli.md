---
"bunkit-cli": minor
"@bunkit/core": minor
---

Make CLI 100% AI-controllable and fix cross-platform banner rendering

**Major Improvements:**

1. **Fixed Broken Banner (Cross-Platform)**
   - Replaced manual unicode box-drawing characters (╔═╗║) with professional `boxen` library
   - Banner now renders perfectly on all terminals (macOS, Linux, Windows)
   - Uses standard ASCII art (figlet-style) instead of custom unicode fonts
   - Added `boxen`, `chalk`, and `ora` for robust CLI presentation

2. **Non-Interactive Mode (AI-Friendly)**
   - Added full env var support: `BUNKIT_PROJECT_NAME`, `BUNKIT_PRESET`, `BUNKIT_GIT`, `BUNKIT_INSTALL`, `BUNKIT_NON_INTERACTIVE`
   - Added CLI flags: `--name`, `--preset`, `--no-git`, `--no-install`, `--non-interactive`
   - Priority system: env vars > flags > interactive prompts
   - AI agents (like Claude Code) can now create projects autonomously without human intervention

3. **Enhanced Developer Experience**
   - Configuration summary displayed in non-interactive mode
   - Clear error messages when required options are missing
   - Comprehensive documentation in README.md
   - Examples for both env vars and CLI flags

**Technical Changes:**
- Added `boxen@^8.0.1`, `chalk@^5.4.1`, `ora@^8.2.0` to dependency catalog
- Rewrote `packages/core/src/banner.ts` with boxen
- Updated `packages/cli/src/commands/init.real.ts` with `InitOptions` interface
- Added `getOptionValue()` helper for env var > flag > prompt priority
- Updated `packages/cli/src/index.ts` to pass options from Commander
- Documented non-interactive mode in `packages/cli/README.md`

**Breaking Changes:**
None. All changes are backward compatible. Interactive mode still works as before.

**Migration:**
No migration needed. This is a pure feature addition with bug fixes.
