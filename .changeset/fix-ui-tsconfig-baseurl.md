---
"bunkit-cli": patch
---

Fix Next.js path alias resolution for packages/ui workspace package. Added baseUrl to packages/ui/tsconfig.json which is REQUIRED for Next.js to resolve @ path aliases (like '@/lib/utils') when transpiling workspace packages. Without baseUrl, Next.js cannot resolve imports in shadcn/ui components, causing "Module not found: Can't resolve '@/lib/utils'" errors.

