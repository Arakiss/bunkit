---
"bunkit-cli": patch
---

Fix broken Next steps box by using boxen uniformly

Replace @clack/prompts p.note() with boxen in init and create commands for consistent cross-platform box rendering. All CLI boxes now use boxen library instead of mixed unicode from different libraries.
