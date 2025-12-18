---
"bunkit-cli": patch
"@bunkit/templates": patch
---

Fix missing UI package dependencies and DOM types for generated projects

**Fixed:**
- Add missing dependencies to UI package: `radix-ui`, `@phosphor-icons/react`, `tw-animate-css`, `shadcn`
- Add DOM and DOM.Iterable types to `library.json` for TypeScript to properly type React components (HTMLButtonElement, etc.)
- Generated projects now properly compile shadcn/ui components without TypeScript errors
