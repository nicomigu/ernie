# Claude Code Essentials for Recall

Everything you need to know to make Recall actually Claude-assisted. Read this once, refer back when stuck.

---

## The mental model

Three things matter. Skip the rest until you need it.

1. **CLAUDE.md** — project memory loaded every session
2. **Subagents** — specialized sub-Claudes with isolated contexts
3. **Slash commands** — your daily macros

That's it. Skills, hooks, plugins, MCP servers — all optional, ignore for v1.

---

## Daily workflow

### Starting a session

```bash
cd ~/code/recall
claude
```

When Claude Code launches it reads `CLAUDE.md` automatically. You don't need to remind it of your project conventions.

### What to do first

Tell Claude what you're working on today, in one sentence.

> "Today I'm building the deck list screen and the create-deck flow."

If it's > 30 min of work, immediately:

> `/feature build the deck list screen with Zustand for state and using deckRepository for data`

This invokes the **planner → builder → reviewer** pipeline. The planner explores the codebase, returns a plan, you approve, builder implements, reviewer checks.

### Ending a session

```
/ship
```

This runs lint + typecheck + tests, shows the diff, suggests a commit message, commits on approval.

---

## The four subagents (already in your `.claude/agents/`)

### `designer` — read-only, makes design specs

Use when starting a new screen, redesigning, or stuck on layout. Returns a complete design spec with layout, components, interactions, states, and platform notes. Grounded in `docs/DESIGN.md` (Ernie theme).

```
> Use the designer to design the deck list screen
```

Output: full visual spec ready to hand to the planner/builder.

### `planner` — read-only, makes implementation plans

Use before any non-trivial work. Returns a focused implementation plan without touching files.

```
> Use the planner to scope out the daily review queue screen
```

Output: list of files to touch, approach in 2-4 sentences, convention checks, risks, estimated effort.

You review the plan BEFORE any code is written. Catches 90% of misunderstandings cheaply.

### `builder` — implements an approved plan

After plan approval:

```
> Builder, implement this plan
```

Stays in scope, follows CLAUDE.md conventions, runs lint + tests, reports done.

### `reviewer` — quality gate before commits

After builder finishes:

```
> Reviewer, check the changes
```

Read-only audit: schema integrity, FSRS correctness, architecture compliance, RN gotchas. Returns ✅ / ⚠️ / ❌ with specific issues.

---

## Slash commands (already in your `.claude/commands/`)

### `/screen` — full design → build pipeline for new screens

For building a new screen from scratch. Runs designer → planner → builder → reviewer. Best for any new UI you've never built before.

```
> /screen build the deck list screen
```

### `/feature` — Explore → Plan → Execute pipeline (no design step)

For non-UI features or screens you've already designed. Runs planner → builder → reviewer.

### `/ship` — end-of-session pipeline

Runs lint + typecheck + tests, stops on first failure, shows diff, suggests conventional commit message, commits on approval. **Doesn't push** — you push manually.

---

## When NOT to use the pipeline

For quick edits (1 file, < 20 lines), just work directly:

> "Fix the typo in DeckCard.tsx, line 23"

Or:

> "Add a `disabled` prop to the Button component"

The pipeline is overhead. Use it when overhead is worth it (multi-file changes, new features, refactors).

---

## Working at 3 hours/day — practical patterns

### One task per session

Don't context-switch mid-session. If you finish the deck list screen and have time left, **commit it and start a fresh session** for the next thing. Long sessions accumulate noise that hurts Claude's output quality.

### Commit every 30-60 minutes

Run `/ship` whenever you have a logical stopping point. Commits are your safety net. Claude Code can sometimes go off the rails — frequent commits mean you lose at most an hour to a bad merge.

### Plan mode for tricky changes

Press **Shift+Tab** to enter plan mode. Claude proposes a plan, you approve, only then does it touch files. This is built into Claude Code, separate from your `/feature` command.

Use plan mode when:
- Refactoring across multiple files
- Making schema changes (high risk)
- You're unsure what the right approach is and want to discuss before code

### Background tasks (Ctrl+B)

If you launch a long-running task (e.g., running the test suite), press **Ctrl+B** to background it. You can keep working in your main session while it runs.

### Edit CLAUDE.md when conventions change

Out-of-date project memory poisons every future session. If you decide "actually we're using Jotai not Zustand" — update CLAUDE.md immediately, in the same commit as the conventions change.

---

## How to write good prompts to Claude Code

### Bad

> "Make the review screen"

Vague. Claude will ask 5 clarifying questions or guess wrong.

### Better

> "Build the review screen at app/review/[deckId].tsx. Show the front of the next due card, with rating buttons (Again/Hard/Good/Easy) at the bottom showing interval previews. On tap, apply the review via scheduler.applyReview, then advance to the next card. Use the planner first since this touches the scheduler."

Specific outcome, mentions the file, references existing conventions, invokes the right tool.

### Best for big features

Use `/feature` and let the planner write the spec for you.

> `/feature build the review screen with rating buttons, interval previews, and scheduler integration`

Planner produces the spec, you tweak it, builder executes. You spend 2 minutes on requirements instead of 20.

---

## Things Claude Code is great at

- Boilerplate (forms, lists, navigation)
- Implementing a clear spec
- Reading the codebase to understand patterns before adding new code
- Writing tests for code that already exists
- Refactoring within a clear scope

## Things Claude Code is bad at

- **Architecture decisions.** It will happily implement bad architectures. You decide structure, it implements.
- **Open-ended product decisions.** "Should we use Zustand or Jotai?" — Claude will pick something, but YOU should decide based on your knowledge.
- **Knowing when to stop.** If you don't constrain scope, it will add "helpful" code you didn't ask for. The reviewer subagent catches this.
- **UX feel.** It can't tell if a button is the right size on a real iPhone. That's your job.

---

## When sessions get noisy

Sometimes a session accumulates a lot of file reads, search results, error output. Output quality drops. Two fixes:

1. **Use subagents for noisy operations.** Tell the planner to "read all files in src/features/decks/" — that noise stays in the planner's context, not yours.
2. **Just start a new session.** It's free. Commit, exit Claude Code, restart, briefly state what you're doing next.

---

## Setup checklist (one-time, day 1)

- [ ] Node 20+ installed
- [ ] `npm install -g @anthropic-ai/claude-code`
- [ ] Sign in: `claude login` (uses Claude.ai account)
- [ ] `cd` to repo, run `claude` to verify it works
- [ ] Verify it loads CLAUDE.md: ask "What conventions does this project use?"
- [ ] Verify subagents are visible: type `/agents` and confirm planner/builder/reviewer appear
- [ ] Verify slash commands work: type `/` and confirm `/ship` and `/feature` appear

---

## Cheat sheet

| Situation | Do this |
|---|---|
| Starting day's work | `cd ernie && claude`, state today's goal |
| Building a new screen | `/screen <description>` |
| Big task, non-UI | `/feature <description>` |
| Small edit | Just describe the change directly |
| Architecture question | Plan mode (Shift+Tab) |
| End of session | `/ship` |
| Made a mistake | `git reset --hard HEAD~1` (you committed often, right?) |
| Session feels off | Commit, exit, restart fresh |
| Adding a new convention | Update CLAUDE.md in same commit |
| Adding a design token | Update docs/DESIGN.md in same commit |
| Long-running task | Run it, Ctrl+B to background, keep working |

---

## What to do on actual Day 1

1. Read `TIMELINE.md` end to end
2. Read this file (Claude Code Essentials) end to end
3. Install Node, install Claude Code, get logged in
4. Create the repo, drop in CLAUDE.md + `.claude/`
5. `claude` → verify it sees the conventions
6. Start Day 1 tasks from TIMELINE.md

The starter kit does the heavy lifting. You're just executing.

Ship it. 🚢
