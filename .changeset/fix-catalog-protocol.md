---
"bunkit-cli": patch
---

Fix npm installation by replacing catalog: with explicit versions

Bun's catalog: protocol is not recognized by npm. All dependencies now use
explicit version ranges matching the root package.json catalog. Internal
packages (@bunkit/core, @bunkit/templates, @bunkit/generators) are marked
as private to prevent accidental publishing.
