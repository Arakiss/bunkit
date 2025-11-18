---
"@bunkit/templates": patch
"@bunkit/core": patch
"bunkit-cli": patch
---

Fix Ultracite integration to follow official documentation structure. Updated preset selection logic to dynamically apply ultracite/core, ultracite/react, and ultracite/next based on project type. Fixed file paths for AI editor rules (.cursor/rules/, .windsurf/rules/, .claude/). Updated Ultracite version to 6.3.4. Corrected package.json scripts to use ultracite check and ultracite fix commands. Added preset to TemplateContext for proper configuration.
