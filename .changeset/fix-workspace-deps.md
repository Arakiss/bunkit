---
"bunkit-cli": patch
---

Fix installation issue by moving internal workspace dependencies to devDependencies

The package could not be installed due to workspace protocol references in dependencies.
Internal packages (@bunkit/core, @bunkit/templates, @bunkit/generators) are now devDependencies
since they are bundled into dist/index.js and not needed at runtime.
