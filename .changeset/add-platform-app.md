---
"@bunkit/templates": minor
---

Add platform app to full preset for enterprise SaaS trifecta

The full-stack monorepo preset now creates THREE apps instead of two:

1. **web** (port 3000) - Customer-facing app (landing, marketing, blog)
2. **platform** (port 3001) - Dashboard/Admin panel (auth required)
3. **api** - Backend API with Hono

This completes the enterprise SaaS architecture pattern. The README now documents the "Enterprise SaaS Trifecta" with detailed explanations of each app's purpose.

Also updates Next.js from 15.5.6 to 16.0.0 and removes --turbopack flags (now default).
