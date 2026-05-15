# Ernie — Project Memory

This file is loaded at the start of every Claude Code session. Keep it concise. Update it as conventions evolve.

## What we're building

**Ernie** — premium offline-first SRS flashcard mobile app. Paid upfront (₱199–299) with 14-day free trial. Native iOS + Android via React Native + Expo. No backend, no accounts, no sync in v1 — daily backup to user's own cloud (iCloud / Google Drive / Files).

Target users: serious learners — Filipino board exam preppers (NLE / Bar / CPA / NMAT), med students globally, serious language learners. Not casual high schoolers.

**Brand:** named after Ernie Baron, Filipino "Walking Encyclopedia." Warm scholarly aesthetic — see `docs/DESIGN.md`. Don't reference Ernie Baron explicitly anywhere in product copy; the cultural nod is implicit.

See `docs/PRD.md` for the full product spec, `docs/TECH_SPEC.md` for architecture, `docs/DESIGN.md` for the visual theme.

## Stack

- **React Native + Expo (managed workflow)** — TypeScript everywhere
- **op-sqlite** — fastest SQLite for RN, WAL mode
- **Drizzle ORM** — type-safe schema and queries over op-sqlite
- **ts-fsrs** — official FSRS implementation
- **Zustand** for global state, **TanStack Query** for async data flows
- **expo-router** for file-based navigation
- **NativeWind** (Tailwind for RN) for styling
- **expo-file-system** + **expo-document-picker** for backup to user's cloud

## Non-negotiable conventions

These are the rules — never break them without explicit user approval.

### Data model

- **UUIDs everywhere.** Never autoincrement IDs. Use `expo-crypto` randomUUID().
- **Every table has:** `id`, `created_at`, `updated_at`, `deleted_at` (nullable, soft-delete), `rev` (int, increment on every write).
- **ReviewLog is append-only.** Never update or delete rows. Conflict-free by design.
- **Notes vs Cards.** A Note is content. A Card is a scheduled review unit derived from a Note via a template. One note → many cards. Edit note once, cards update.
- **NoteType is data, not enum.** Stored in DB so v3 can add custom types without migration.
- **Timestamps in unix ms.** Not ISO strings.

### FSRS

- **Use `ts-fsrs`, do not roll your own.** It's the canonical implementation.
- **Card update + ReviewLog insert must be in a single transaction.** Atomic.
- **`previewIntervals` must match `applyReview`.** Same FSRS params. No drift between button labels and actual scheduling.
- **Default weights for new users.** "Optimize my schedule" button unlocks at 400+ reviews.
- **Show interval preview on each rating button** ("Good · 4d"). Hero UX moment — visible algorithmic rigor.

### Code style

- **Feature-first folder structure**, not layer-first.
  - `src/features/review/`, `src/features/decks/`, `src/features/notes/`
  - NOT `src/components/`, `src/screens/`, `src/types/`
- **Repository pattern** between UI and DB. UI components never call Drizzle directly — they use repository functions.
- **Zustand stores** scoped per-feature, not one giant global store.
- **TypeScript strict mode.** No `any` without comment justifying it. No `// @ts-ignore` without comment.
- **Functional components only.** No class components.
- **No default exports** except for route files (expo-router requires them). Named exports everywhere else.

### Files & UI

- Images compress on import: max long edge 1280px, JPEG q85 via `expo-image-manipulator`.
- Strip EXIF on import (manipulator handles this).
- Media stored under `${FileSystem.documentDirectory}media/`, referenced by filename in DB, never as blobs.
- Styling via NativeWind classes. No inline `StyleSheet.create` unless animation requires it.

### Testing

- **Jest + React Native Testing Library** for unit + component tests.
- Unit tests for: ts-fsrs calls, scheduler interval math, repository layer.
- Component tests for: review flow, deck CRUD, card creation.
- No tests for trivial UI; pragmatic coverage.

## What NOT to build (yet)

Permanently off-limits in v1, regardless of how clever the idea seems:

- Sync, accounts, cloud servers
- AI features (v2)
- Content packs / marketplace (v3+)
- Custom note type editor (v4+)
- Audio/video cards (v4+)

If you find yourself wanting to add one of these "real quick," stop and ask the user first.

## Agent delegation rules

**Designing a new screen?** Use `designer` subagent first to produce a design spec. Then proceed to planner → builder → reviewer with the spec as input. Or just use `/screen` which runs all four.

**Building non-trivial code (> 3 files or > 50 lines)?**
1. Invoke `planner` subagent first
2. Show the user the plan
3. Only after approval, invoke `builder`
4. Always invoke `reviewer` before committing

For quick edits (1 file, < 20 lines), work directly without subagents.

## Commit conventions

- Conventional commits: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `test:`
- Commit every 30–60 min of work
- Never `git push --force` to main
- Branch per feature: `feat/image-occlusion`, `fix/fsrs-edge-case`
