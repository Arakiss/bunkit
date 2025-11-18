---
"bunkit-cli": minor
"@bunkit/core": minor
"@bunkit/templates": minor
---

Major release: Supabase integration, dependency updates, and CLI improvements

## Supabase Integration

- Complete Supabase integration with granular feature selection
- New database options: `supabase` (client-only) and `supabase-drizzle` (with Drizzle ORM)
- Supabase presets: full-stack, auth-only, database-only, and custom
- Configurable Supabase features: auth, storage, realtime, edge-functions, database
- Interactive CLI prompts for Supabase configuration
- Dynamic code generation based on selected features
- Proper Docker and CI/CD configuration for Supabase projects

## Dependency Updates

- React: 19.1.0 → 19.2.0
- Next.js: 16.0.0 → 16.0.3
- Hono: 4.7.12 → 4.10.6
- Drizzle ORM: 0.38.0 → 0.44.7
- Drizzle Kit: 0.30.1 → 0.31.7
- Supabase JS: 2.48.1 → 2.81.1
- Tailwind CSS: 4.1.7 → 4.1.17
- Biome: 2.3.0 → 2.3.6
- Commander: 14.0.1 → 14.0.2
- Postgres: 3.4.5 → 3.4.7
- TypeScript types updated to latest versions

## Dependency Management

- New `update-deps` script for automated dependency updates
- New `check-deps` script to check for outdated dependencies
- Documentation for keeping dependencies updated

## CLI Developer Experience Improvements

- Enhanced banner with better styling, colors, and professional appearance
- Improved progress messages with colored emojis and more descriptive context
- Redesigned configuration summary with organized sections and visual separators
- Enhanced final project summary with comprehensive next steps and contextual tips
- Better error handling with troubleshooting tips and helpful suggestions
- Improved command descriptions and help text with examples
- Consistent visual design throughout all CLI interactions
- Better spacing, padding, and organization of information
- More informative hints and labels for all interactive prompts
- Professional nomenclature improvements across all commands
- Command aliases added (init|i, create|c, add|a)

