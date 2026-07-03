---
name: enforce-conventional-pr-titles
enabled: true
event: bash
action: block
pattern: gh\s+pr\s+(?:create|edit)(?=[\s\S]*--title)(?![\s\S]*--title[=\s]+["']?(?:feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(?:\([^)]*\))?!?:\s)
---

🚫 **PR title must follow Conventional Commits.**

Squash merges turn the PR title into the commit message, so titles need the
same format: `type(scope)?: subject`

Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

Examples:
- `feat: unify social icons into shared component`
- `chore(ci): cache npm dependencies`

Rewrite the `--title` value with a lowercase type prefix and retry.
