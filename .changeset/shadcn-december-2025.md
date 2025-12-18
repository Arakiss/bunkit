---
"bunkit-cli": minor
"@bunkit/core": minor
"@bunkit/templates": minor
---

Add support for shadcn/ui December 2025 "create" feature

**New Features:**

- Add 5 new modern shadcn/ui styles: `radix-maia`, `radix-vega`, `radix-nova`, `radix-lyra`, `radix-mira`
- Add new shadcn/ui configuration options:
  - `shadcnBase`: Choose between `radix` (default) or `base-ui` as component foundation
  - `shadcnIconLibrary`: Choose between `phosphor` (default), `lucide`, or `iconoir`
  - `shadcnMenuAccent`: Style for menu accents (`subtle` or `bold`)
  - `shadcnMenuColor`: Color for menus (`default` or `muted`)
- Generate modern CSS with new imports: `@import "tw-animate-css"`, `@import "shadcn/tailwind.css"`, `@custom-variant dark`
- Add extended radius variables: `--radius-xl` through `--radius-4xl`
- Add font CSS variables: `--font-sans`, `--font-mono`

**Architecture:**

- Add PresetRegistry as single source of truth for preset metadata
- Add shared builder utilities in `@bunkit/templates`
- Add new catalog dependencies: `radix-ui`, `@base-ui/react`, `shadcn`, `@phosphor-icons/react`, `tw-animate-css`

**Breaking Changes:**

- None. Legacy styles (`new-york`, `default`) continue to work as before.
