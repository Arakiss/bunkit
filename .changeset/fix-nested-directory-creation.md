---
"@bunkit/core": patch
"bunkit-cli": patch
---

Fix issue where creating a project with the same name as the current directory would result in nested directories (e.g., `mycelio/mycelio`). Now detects this scenario and provides clear error messages guiding users to use `bunkit init` or navigate to the parent directory first.

