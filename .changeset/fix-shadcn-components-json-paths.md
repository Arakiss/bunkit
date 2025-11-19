---
"bunkit-cli": patch
---

Fix shadcn CLI component installation paths in monorepo. shadcn CLI interprets aliases in components.json as literal file paths for installation locations. Using @ aliases (like '@/components') caused shadcn CLI to create literal @ directories (e.g., packages/ui/@/components/ui/). Changed to use relative paths (./src/components, ./src/components/ui) for installation paths while keeping @ aliases for import paths (utils, lib, hooks) which are resolved by tsconfig.json.

