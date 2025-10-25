# bunkit 🍞

> Bake production-ready apps in seconds

**bunkit** is a modern CLI for scaffolding Bun-powered projects with enterprise-grade patterns and zero configuration.

## ✨ Features

- 🚀 **4 Presets** - minimal, web (Next.js 15), api (Hono), full (monorepo)
- 🎨 **Beautiful CLI** - Built with @clack/prompts (same as Astro)
- 📦 **Smart Defaults** - Supabase, Drizzle, shadcn/ui, Tailwind CSS 4
- ⚡ **Bun-First** - Leverages Bun 1.3 features (catalogs, native drivers, HMR)
- 🔒 **Type-Safe** - TypeScript strict mode everywhere
- 🎯 **Zero Config** - Works out of the box

## 🚀 Quick Start

```bash
# Using bunx (recommended)
bunx @bunkit/cli init

# Or install globally
bun add -g @bunkit/cli
bunkit init
```

## 📦 Presets

### `minimal` - Single Repo Clean Start
Perfect for CLIs, scripts, and proof-of-concepts.

```bash
bunkit create minimal my-tool
```

### `web` - Next.js 15 Frontend
Complete Next.js app with React 19, Tailwind CSS 4, and shadcn/ui.

```bash
bunkit create web my-app
```

### `api` - Hono Backend
Lightning-fast API with Hono and Bun.serve() HMR.

```bash
bunkit create api my-api
```

### `full` - Full-Stack Monorepo
Enterprise monorepo with Next.js, Hono, and shared packages.

```bash
bunkit create full my-saas
```

## 🔌 Features (Add-ons)

Add features to any preset:

```bash
bunkit add auth           # Supabase auth with PKCE
bunkit add database       # Drizzle + PostgreSQL
bunkit add ui             # shadcn/ui shared package
bunkit add payments       # Stripe integration
bunkit add email          # Resend + React Email
bunkit add storage        # Supabase Storage
```

## 📚 Documentation

Full documentation coming soon at [bunkit.dev](https://bunkit.dev)

## 🤝 Contributing

Contributions welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md)

## 📄 License

MIT © [Petru Cosmin Dumitru](https://github.com/Arakiss)

## 🙏 Acknowledgments

- Built with [@clack/prompts](https://www.clack.cc/) by the Astro team
- Inspired by create-t3-app, create-next-app, and Bun's philosophy

---

**Made with ❤️ for the indie hacker community**
