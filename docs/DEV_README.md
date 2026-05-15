# Ernie — Project Bundle

Everything you need to start building. Drop into your repo on Day 1.

## What's in here

```
ernie/
├── CLAUDE.md                              # Project memory (loaded every Claude Code session)
├── docs/
│   ├── PRD.md                             # Product requirements (the what)
│   ├── TECH_SPEC.md                       # Technical architecture (the how)
│   ├── DESIGN.md                          # Visual theme and design system
│   ├── CLAUDE_CODE_ESSENTIALS.md          # Daily Claude Code reference
│   └── TIMELINE.md                        # 4-week plan to closed beta
├── .claude/
│   ├── agents/
│   │   ├── designer.md                    # Design agent (makes screen specs)
│   │   ├── planner.md                     # Plan agent (read-only, makes plans)
│   │   ├── builder.md                     # Build agent (writes code per plan)
│   │   └── reviewer.md                    # Review agent (quality gate)
│   └── commands/
│       ├── screen.md                      # /screen — design + build a screen
│       ├── feature.md                     # /feature — plan + build a feature
│       └── ship.md                        # /ship — lint + test + commit
└── README.md                              # This file
```

## Day 1 setup

1. Create repo: `git init recall`
2. Copy this bundle's contents into the repo root (yes, including `.claude/` and `docs/`)
3. Read in this order:
   - `docs/PRD.md` (~10 min) — refresh what you're building
   - `docs/CLAUDE_CODE_ESSENTIALS.md` (~10 min) — how to use Claude Code daily
   - `docs/TIMELINE.md` end to end (~15 min) — your map
   - `docs/TECH_SPEC.md` — reference while building, don't memorize
4. Install Claude Code: `npm install -g @anthropic-ai/claude-code`
5. Run `claude login`, then `claude` in the repo
6. Verify CLAUDE.md is loaded: ask "What conventions does this project use?"
7. Start Day 1 tasks from TIMELINE.md

## The four key documents, summarized

| Doc | Purpose | When to read |
|---|---|---|
| `CLAUDE.md` | Project conventions Claude loads every session | Read once, edit when conventions change |
| `docs/PRD.md` | What you're building and why | Read once on Day 1, refer back when scope drifts |
| `docs/TECH_SPEC.md` | How to build it (architecture, schema, patterns) | Reference while building |
| `docs/CLAUDE_CODE_ESSENTIALS.md` | How to use Claude Code at 3hr/day | Read on Day 1, refer when stuck |
| `docs/TIMELINE.md` | Day-by-day build plan | Read once, follow daily |

## Two rules to remember

1. **CLAUDE.md is sacred.** Update it whenever you change a convention. Stale project memory poisons every future session.
2. **Don't skip the planner.** It's tempting to dive into code. Resist. 5 minutes of planning saves 30 minutes of bad code you'd have to undo.

Good luck. Ship it.
