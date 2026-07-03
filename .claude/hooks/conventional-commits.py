#!/usr/bin/env python3
"""PreToolUse hook: enforce Conventional Commits.

Reads the Bash tool call JSON from stdin and denies the call when a
`git commit -m` message or a `gh pr create/edit --title` value does not
match `type(scope)?: subject`.

Heredoc bodies are extracted before command inspection, so text inside a
commit message body (e.g. a sentence mentioning `gh pr create --title`)
is never mistaken for a real command or flag.

See https://code.claude.com/docs/en/hooks for the hook I/O contract.
"""

import json
import re
import sys

TYPES = "feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert"
# Subject must start with a non-whitespace character — "feat:   " is not
# a real subject.
CONVENTIONAL = re.compile(rf"^(?:{TYPES})(?:\([^)]*\))?!?: \S.*")

HEREDOC = re.compile(r"<<-?\s*(['\"]?)(\w+)\1\s*\n(.*?)\n\s*\2(?=\s|$|\))", re.S)
# Value forms: "double quoted", 'single quoted', or bare word.
VALUE = r"(\"(?:[^\"\\]|\\.)*\"|'[^']*'|\S+)"
# -m in any short-flag bundle (-am, -sm), with the value spaced or attached
# (-m"msg"), plus the --message long form. search() takes the FIRST match,
# which git uses as the subject line.
COMMIT_MSG = re.compile(rf"(?:^|\s)(?:--message(?:=|\s+)|-[a-zA-Z]*m\s*){VALUE}")
PR_TITLE = re.compile(rf"(?:^|\s)(?:--title(?:=|\s+)|-t\s*){VALUE}")


def deny(kind, subject):
    types = TYPES.replace("|", ", ")
    json.dump(
        {
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "permissionDecision": "deny",
                "permissionDecisionReason": (
                    f"{kind} does not follow Conventional Commits: {subject!r}. "
                    f"Required format: type(scope)?: subject, lowercase type "
                    f"from: {types}. Example: feat(header): add social links. "
                    f"Rewrite and retry."
                ),
            }
        },
        sys.stdout,
    )
    sys.exit(0)


def first_line(raw, heredocs):
    """Resolve a captured flag value to the first line of its message."""
    if raw[:1] in "\"'":
        raw = raw[1:-1]
    placeholder = re.search(r"__HEREDOC_(\d+)__", raw)
    if placeholder:
        raw = heredocs[int(placeholder.group(1))]
    return raw.split("\n", 1)[0].strip()


def main():
    try:
        data = json.load(sys.stdin)
    except (json.JSONDecodeError, ValueError):
        return
    if data.get("tool_name") != "Bash":
        return
    command = (data.get("tool_input") or {}).get("command") or ""

    heredocs = []

    def stash(match):
        heredocs.append(match.group(3))
        return f"__HEREDOC_{len(heredocs) - 1}__"

    stripped = HEREDOC.sub(stash, command)

    if re.search(r"\bgit\s+commit\b", stripped):
        match = COMMIT_MSG.search(stripped)
        if match:
            subject = first_line(match.group(1), heredocs)
            if not CONVENTIONAL.match(subject):
                deny("Commit message", subject)

    if re.search(r"\bgh\s+pr\s+(?:create|edit)\b", stripped):
        match = PR_TITLE.search(stripped)
        if match:
            subject = first_line(match.group(1), heredocs)
            if not CONVENTIONAL.match(subject):
                deny("PR title", subject)


if __name__ == "__main__":
    main()
