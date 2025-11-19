---
"bunkit-cli": patch
---

Fix critical issue where packages/ui package was missing tailwindcss and @tailwindcss/postcss dependencies. The UI package imports tailwindcss in its CSS file and uses @tailwindcss/postcss in postcss.config.mjs, but these dependencies were not declared, causing resolution errors when PostCSS processes the CSS. This fix ensures all monorepo presets (enterprise, full) that use shadcn/ui have the correct dependencies declared.

