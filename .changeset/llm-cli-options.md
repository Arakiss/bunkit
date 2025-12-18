---
"bunkit-cli": patch
"@bunkit/core": patch
---

Add complete CLI flags for LLM non-interactive mode

**Fixed:**
- Add missing CLI flags for shadcn/ui December 2025 options:
  - `--shadcn-base` (radix | base-ui)
  - `--shadcn-icon-library` (phosphor | lucide | iconoir)
  - `--shadcn-menu-accent` (subtle | bold)
  - `--shadcn-menu-color` (default | muted)
- Fix `createTemplateContext` to pass all shadcn options to template builders
- Update `--shadcn-style` flag to include all 7 styles

**Added:**
- Interactive prompts for shadcnBase, shadcnMenuAccent, shadcnMenuColor (only for modern styles)

LLMs can now use bunkit in fully non-interactive mode:
```bash
bunkit init \
  --name my-app \
  --preset nextjs-monorepo \
  --shadcn-style radix-maia \
  --shadcn-icon-library phosphor \
  --shadcn-menu-accent subtle \
  --non-interactive
```
