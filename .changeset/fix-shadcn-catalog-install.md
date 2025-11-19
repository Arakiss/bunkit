---
"bunkit-cli": patch
"@bunkit/templates": patch
---

Fix shadcn/ui component installation failing with catalog: dependencies

Fixed critical bug where shadcn CLI installation failed with "Unsupported URL Type catalog:" error. The issue occurred because shadcn CLI internally uses npm which doesn't understand Bun's catalog: protocol.

**Changes:**
- Install dependencies with Bun before running shadcn CLI to resolve catalog: references
- Add explicit dependency installation step in create command before component installation
- Update catalog versions to match root package.json
- Add lucide-react to root catalog

This ensures all catalog: dependencies are resolved to actual versions before shadcn CLI runs, preventing npm errors.
