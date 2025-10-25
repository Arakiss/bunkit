---
"bunkit-cli": patch
---

HOTFIX: Replace catalog: with explicit versions for npm compatibility

The catalog: protocol is Bun-specific and breaks when published to npm. This hotfix replaces all catalog: dependencies with explicit versions from the root catalog to ensure the package works correctly when installed from npm.
