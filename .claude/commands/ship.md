---
description: Run the full check + commit pipeline. Use at the end of every working session.
allowed-tools: Bash, Read
---

# /ship — End-of-session pipeline

Run this when you're done with a chunk of work and ready to commit. Stops at the first failure so you can fix before continuing.

## Steps

1. Run `pnpm lint` (or `npm run lint`). If errors, stop and report them.
2. Run `pnpm typecheck` (or `tsc --noEmit`). If type errors, stop and report.
3. Run `pnpm test`. If any test fails, stop and report.
4. Run `git status` to show what's changed.
5. Show the diff via `git diff --stat`.
6. Ask the user: "Ready to commit? (y/n) — if yes, suggest a conventional commit message"
7. On approval, run `git add -A && git commit -m "<message>"`.
8. DO NOT push. The user pushes manually.

## Notes

- If the user is mid-feature and not ready to commit, just run lint + typecheck + test and stop there.
- Suggest commit messages that follow conventional commits: feat/fix/refactor/chore/docs/test.
