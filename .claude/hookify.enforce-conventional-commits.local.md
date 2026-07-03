---
name: enforce-conventional-commits
enabled: true
event: bash
action: block
pattern: git\s+commit(?=[\s\S]*\s-m\s)(?![\s\S]*(?:-m\s+["']|EOF["']?\n)(?:feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(?:\([^)]*\))?!?:\s)
---

🚫 **Commit message must follow Conventional Commits.**

This repo requires the format: `type(scope)?: subject`

Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

Examples:
- `feat: add social links component`
- `fix(header): correct mobile nav overflow`
- `chore(deps)!: upgrade Astro 7 stack`

Rewrite the commit message with a lowercase type prefix and retry.
