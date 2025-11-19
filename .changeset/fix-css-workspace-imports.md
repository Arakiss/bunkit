---
"bunkit-cli": patch
---

Fix CSS import paths in Next.js apps for workspace packages. Now imports CSS directly from workspace UI package in layout.tsx (like mycelio pattern), removes local globals.css files, configures postcss.config.mjs to re-export from UI package, and adds transpilePackages to next.config.ts. This ensures Tailwind CSS v4 works correctly with Bun 1.3 workspaces and isolated installs.

