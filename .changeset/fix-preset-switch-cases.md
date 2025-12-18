---
"bunkit-cli": patch
"@bunkit/core": patch
"@bunkit/templates": patch
---

Fix critical bug where nextjs-monorepo and bun-monorepo presets fail to generate project structure

**Fixed:**
- Add missing `case 'nextjs-monorepo'` to switch statement in init command
- Add missing `case 'bun-monorepo'` to switch statement in init command
- Add default case to catch invalid presets with helpful error message
- Fix dependency installation condition to use `isMonorepoPreset` variable

**What was broken:**
- Running `bunkit init --preset nextjs-monorepo` created an empty project with no files
- The switch statement was missing cases for the new preset names
- Users could not scaffold monorepo projects using the documented preset names
