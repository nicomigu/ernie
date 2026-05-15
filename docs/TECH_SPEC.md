# Recall — Technical Specification

**Status:** v1 build spec
**Owner:** Nico
**Last updated:** May 2026

> Companion to PRD.md. The PRD says *what* we're building. This says *how*.

---

## 1. Stack overview

| Concern | Choice | Why |
|---|---|---|
| Framework | React Native + Expo (managed) | Cross-platform, no Mac needed for dev, EAS Build for iOS |
| Language | TypeScript (strict) | Type safety on a long-lived offline-first app is non-negotiable |
| Database | op-sqlite | Fastest SQLite for RN, WAL mode, JSI bindings |
| ORM | Drizzle | Type-safe, migration-aware, lightweight |
| Scheduler | ts-fsrs | Canonical FSRS-5 implementation by FSRS project |
| State | Zustand + TanStack Query | Lightweight, no boilerplate, good for offline-first |
| Navigation | expo-router | File-based, type-safe, modern |
| Styling | NativeWind | Tailwind for RN, fast to iterate |
| ID generation | expo-crypto | UUID v4, cryptographically secure |
| Storage (files) | expo-file-system | Media, backups |
| Backup destination | expo-document-picker | User-chosen folder (iCloud / Drive / Files) |
| IAP (v1.5+) | react-native-iap | Trial + one-time purchase |
| Image manipulation | expo-image-manipulator | Compress, strip EXIF |

---

## 2. Folder structure

Feature-first, not layer-first. Each feature owns its own UI, logic, and data access.

```
recall/
├── app/                          # expo-router routes
│   ├── _layout.tsx               # root layout
│   ├── (tabs)/                   # main app tabs
│   │   ├── _layout.tsx
│   │   ├── today.tsx
│   │   ├── decks.tsx
│   │   └── settings.tsx
│   ├── review/[deckId].tsx       # review session
│   ├── note/new.tsx              # note creation
│   └── note/[id].tsx             # note edit
├── src/
│   ├── features/
│   │   ├── decks/
│   │   │   ├── DeckList.tsx
│   │   │   ├── DeckCard.tsx
│   │   │   ├── deckRepository.ts
│   │   │   ├── deckStore.ts      # Zustand store
│   │   │   └── deckRepository.test.ts
│   │   ├── notes/
│   │   │   ├── NoteEditor.tsx
│   │   │   ├── noteRepository.ts
│   │   │   └── ...
│   │   ├── review/
│   │   │   ├── ReviewScreen.tsx
│   │   │   ├── RatingButtons.tsx
│   │   │   ├── scheduler.ts      # FSRS wrapper
│   │   │   └── scheduler.test.ts
│   │   ├── stats/
│   │   ├── backup/
│   │   ├── search/
│   │   └── settings/
│   ├── core/
│   │   ├── db/
│   │   │   ├── schema.ts         # Drizzle schema
│   │   │   ├── client.ts         # DB connection singleton
│   │   │   ├── migrations/
│   │   │   └── seed.ts           # NoteTypes, default DeckConfig
│   │   ├── ids.ts                # UUID helpers
│   │   ├── time.ts               # date/time utilities
│   │   ├── i18n/                 # translations
│   │   └── theme/                # design tokens
│   └── ui/                       # shared dumb components
│       ├── Button.tsx
│       ├── Card.tsx
│       └── ...
├── assets/
├── CLAUDE.md
└── package.json
```

**Rules:**
- UI components inside `app/` and `src/features/*/` never call DB directly. They call repository functions.
- Repository functions are the only place Drizzle queries live.
- `src/core/db/` exposes the DB client + schema. Repositories import from it.
- `src/ui/` is for dumb, reusable components (Button, Card, Modal). No feature logic.

---

## 3. Data model

### Drizzle schema (canonical)

```typescript
// src/core/db/schema.ts
import { sqliteTable, text, integer, blob } from 'drizzle-orm/sqlite-core'

const sharedColumns = {
  id: text('id').primaryKey(),                    // UUID v4
  created_at: integer('created_at').notNull(),    // unix ms
  updated_at: integer('updated_at').notNull(),
  deleted_at: integer('deleted_at'),              // nullable; soft delete
  rev: integer('rev').notNull().default(0),       // incremented on every write
}

export const noteTypes = sqliteTable('note_types', {
  ...sharedColumns,
  name: text('name').notNull(),
  field_schema: text('field_schema').notNull(),   // JSON
  card_templates: text('card_templates').notNull(), // JSON
})

export const decks = sqliteTable('decks', {
  ...sharedColumns,
  parent_deck_id: text('parent_deck_id'),         // nullable, for nested decks
  name: text('name').notNull(),
  config_id: text('config_id').notNull(),
})

export const deckConfigs = sqliteTable('deck_configs', {
  ...sharedColumns,
  name: text('name').notNull(),
  new_cards_per_day: integer('new_cards_per_day').notNull().default(20),
  max_reviews_per_day: integer('max_reviews_per_day').notNull().default(200),
  fsrs_weights: text('fsrs_weights').notNull(),   // JSON: 19 floats
  target_retention: integer('target_retention').notNull().default(90), // 0-100
  learning_steps: text('learning_steps').notNull(), // JSON: array of minutes
  relearning_steps: text('relearning_steps').notNull(),
})

export const notes = sqliteTable('notes', {
  ...sharedColumns,
  note_type_id: text('note_type_id').notNull(),
  deck_id: text('deck_id').notNull(),
  field_values: text('field_values').notNull(),   // JSON
})

export const cards = sqliteTable('cards', {
  ...sharedColumns,
  note_id: text('note_id').notNull(),
  template_ordinal: integer('template_ordinal').notNull(),
  deck_id: text('deck_id').notNull(),             // denormalized for query speed
  state: text('state').notNull(),                 // 'new' | 'learning' | 'review' | 'relearning' | 'suspended'
  due_date: integer('due_date').notNull(),        // unix ms
  last_review: integer('last_review'),
  // FSRS state
  difficulty: integer('difficulty').notNull().default(0),
  stability: integer('stability').notNull().default(0),
  reps: integer('reps').notNull().default(0),
  lapses: integer('lapses').notNull().default(0),
})

// Append-only. Never updated or deleted.
export const reviewLogs = sqliteTable('review_logs', {
  id: text('id').primaryKey(),
  card_id: text('card_id').notNull(),
  reviewed_at: integer('reviewed_at').notNull(),
  rating: integer('rating').notNull(),            // 1 Again | 2 Hard | 3 Good | 4 Easy
  duration_ms: integer('duration_ms').notNull(),
  elapsed_days: integer('elapsed_days').notNull(),
  scheduled_days: integer('scheduled_days').notNull(),
  prev_stability: integer('prev_stability').notNull(),
  prev_difficulty: integer('prev_difficulty').notNull(),
  new_stability: integer('new_stability').notNull(),
  new_difficulty: integer('new_difficulty').notNull(),
})

export const tags = sqliteTable('tags', {
  ...sharedColumns,
  name: text('name').notNull(),
  parent_id: text('parent_id'),                   // hierarchical
})

export const noteTags = sqliteTable('note_tags', {
  note_id: text('note_id').notNull(),
  tag_id: text('tag_id').notNull(),
}, (table) => ({
  pk: [table.note_id, table.tag_id],
}))

export const media = sqliteTable('media', {
  ...sharedColumns,
  filename: text('filename').notNull(),
  mime_type: text('mime_type').notNull(),
  size_bytes: integer('size_bytes').notNull(),
  checksum: text('checksum').notNull(),
})

export const userPreferences = sqliteTable('user_preferences', {
  id: text('id').primaryKey(),                    // always 'singleton'
  theme: text('theme').notNull().default('system'),
  daily_goal: integer('daily_goal').notNull().default(50),
  timezone: text('timezone').notNull(),
  review_order: text('review_order').notNull().default('due'),
  backup_location: text('backup_location'),       // URI to user-chosen folder
  backup_retention_days: integer('backup_retention_days').notNull().default(14),
  backup_encryption_enabled: integer('backup_encryption_enabled').notNull().default(0),
  updated_at: integer('updated_at').notNull(),
})
```

### Conventions on the schema

- **UUIDs everywhere.** `expo-crypto.randomUUID()`.
- **Unix ms timestamps.** Not ISO strings. Cheaper to compare, easier to sort.
- **Soft delete on user-facing entities.** Hard delete only on `noteTags` (it's a join table; integrity is handled by app logic).
- **ReviewLog is append-only.** No updates, no deletes. Foundation for future FSRS optimization.
- **`rev` column on every mutable table.** Increments on every write. Sync uses it later.
- **JSON in TEXT columns** (`field_values`, `card_templates`, `fsrs_weights`, etc.) — pragmatic for v1, can normalize later if needed.

---

## 4. Repository pattern

UI never calls Drizzle directly. All DB access goes through a per-feature repository.

```typescript
// src/features/decks/deckRepository.ts
import { db } from '@/core/db/client'
import { decks } from '@/core/db/schema'
import { eq, isNull } from 'drizzle-orm'
import { newId, now } from '@/core/ids'

export const deckRepository = {
  async list() {
    return db.select().from(decks).where(isNull(decks.deleted_at))
  },

  async get(id: string) {
    const rows = await db.select().from(decks).where(eq(decks.id, id))
    return rows[0] ?? null
  },

  async create(input: { name: string; parent_deck_id?: string; config_id: string }) {
    const id = newId()
    const ts = now()
    await db.insert(decks).values({
      id,
      name: input.name,
      parent_deck_id: input.parent_deck_id ?? null,
      config_id: input.config_id,
      created_at: ts,
      updated_at: ts,
      deleted_at: null,
      rev: 0,
    })
    return id
  },

  async rename(id: string, name: string) {
    const ts = now()
    await db
      .update(decks)
      .set({ name, updated_at: ts, rev: sql`rev + 1` })
      .where(eq(decks.id, id))
  },

  async softDelete(id: string) {
    const ts = now()
    await db
      .update(decks)
      .set({ deleted_at: ts, updated_at: ts, rev: sql`rev + 1` })
      .where(eq(decks.id, id))
  },
}
```

**Rules:**
- Every write bumps `updated_at` and `rev`
- Soft delete sets `deleted_at`, doesn't actually delete the row
- All reads filter `WHERE deleted_at IS NULL` by default
- Repositories are pure async functions, no React in them

---

## 5. FSRS integration

The scheduler is the single most important piece of code in the app. It must be correct, atomic with ReviewLog writes, and well-tested.

```typescript
// src/features/review/scheduler.ts
import { FSRS, Rating, State as FsrsState, generatorParameters } from 'ts-fsrs'
import { db } from '@/core/db/client'
import { cards, reviewLogs } from '@/core/db/schema'
import { eq } from 'drizzle-orm'
import { newId, now } from '@/core/ids'

export type ReviewRating = 'Again' | 'Hard' | 'Good' | 'Easy'

const ratingMap: Record<ReviewRating, Rating> = {
  Again: Rating.Again,
  Hard: Rating.Hard,
  Good: Rating.Good,
  Easy: Rating.Easy,
}

/**
 * Apply a review to a card. Updates the card's FSRS state AND writes
 * a ReviewLog row in a single transaction. These must be atomic.
 */
export async function applyReview(
  cardId: string,
  rating: ReviewRating,
  weights: number[],
  targetRetention: number,
) {
  const ratingValue = ratingMap[rating]
  const reviewTime = new Date(now())

  const card = await getCardById(cardId)
  if (!card) throw new Error(`Card ${cardId} not found`)

  // Configure FSRS with this deck's weights + target retention
  const params = generatorParameters({
    w: weights,
    request_retention: targetRetention / 100,
  })
  const fsrs = new FSRS(params)

  // Build current FSRS card state from our DB
  const currentFsrsCard = toFsrsCard(card)

  // Get the scheduling result for this rating
  const result = fsrs.next(currentFsrsCard, reviewTime, ratingValue)
  const { card: newFsrsCard, log: fsrsLog } = result

  // Atomic write
  await db.transaction(async (tx) => {
    await tx
      .update(cards)
      .set({
        state: fromFsrsState(newFsrsCard.state),
        due_date: newFsrsCard.due.getTime(),
        last_review: reviewTime.getTime(),
        difficulty: newFsrsCard.difficulty,
        stability: newFsrsCard.stability,
        reps: newFsrsCard.reps,
        lapses: newFsrsCard.lapses,
        updated_at: now(),
        rev: card.rev + 1,
      })
      .where(eq(cards.id, cardId))

    await tx.insert(reviewLogs).values({
      id: newId(),
      card_id: cardId,
      reviewed_at: reviewTime.getTime(),
      rating: ratingValue,
      duration_ms: fsrsLog.review,  // ts-fsrs provides this
      elapsed_days: fsrsLog.elapsed_days,
      scheduled_days: fsrsLog.scheduled_days,
      prev_stability: card.stability,
      prev_difficulty: card.difficulty,
      new_stability: newFsrsCard.stability,
      new_difficulty: newFsrsCard.difficulty,
    })
  })
}

/**
 * Preview next intervals for all 4 ratings without committing.
 * Powers the "Good · 4d" UI on rating buttons.
 */
export function previewIntervals(
  card: CardRow,
  weights: number[],
  targetRetention: number,
): Record<ReviewRating, number> {
  const params = generatorParameters({
    w: weights,
    request_retention: targetRetention / 100,
  })
  const fsrs = new FSRS(params)
  const fsrsCard = toFsrsCard(card)
  const reviewTime = new Date(now())

  const results = fsrs.repeat(fsrsCard, reviewTime)

  return {
    Again: results[Rating.Again].card.scheduled_days,
    Hard: results[Rating.Hard].card.scheduled_days,
    Good: results[Rating.Good].card.scheduled_days,
    Easy: results[Rating.Easy].card.scheduled_days,
  }
}
```

**Critical correctness rules:**
- `applyReview` MUST be in a transaction. Card update + ReviewLog insert are atomic.
- Never compute intervals yourself. Always go through `ts-fsrs`.
- `previewIntervals` and `applyReview` must use the SAME FSRS params. The interval shown on the button must match what gets applied.
- Tests required: known-input → known-output, against ts-fsrs's own test vectors.

---

## 6. Image handling

```typescript
// src/features/notes/imageImport.ts
import * as ImageManipulator from 'expo-image-manipulator'
import * as FileSystem from 'expo-file-system'
import { newId } from '@/core/ids'

const MAX_LONG_EDGE = 1280
const JPEG_QUALITY = 0.85

export async function importImage(sourceUri: string) {
  // 1. Resize (auto-compresses, strips EXIF as a side effect)
  const result = await ImageManipulator.manipulateAsync(
    sourceUri,
    [{ resize: { width: MAX_LONG_EDGE } }],  // height auto, preserves aspect
    { compress: JPEG_QUALITY, format: ImageManipulator.SaveFormat.JPEG },
  )

  // 2. Move to permanent media dir
  const filename = `${newId()}.jpg`
  const mediaDir = `${FileSystem.documentDirectory}media/`
  await FileSystem.makeDirectoryAsync(mediaDir, { intermediates: true })
  const destination = `${mediaDir}${filename}`
  await FileSystem.moveAsync({ from: result.uri, to: destination })

  // 3. Get file info for the media row
  const info = await FileSystem.getInfoAsync(destination, { size: true })
  return {
    filename,
    mime_type: 'image/jpeg',
    size_bytes: info.size ?? 0,
  }
}
```

Rules:
- Long edge max 1280px. Sufficient for any phone, kills bloat.
- JPEG quality 0.85. Visually identical to original, 5-10x smaller.
- EXIF stripped by manipulator (it doesn't preserve metadata).
- Stored as files under `documentDirectory/media/`, NOT as DB blobs.
- Referenced from `notes.field_values` as `![](media_id)` or similar.

---

## 7. Backup

The v1 hero feature. Has to be bulletproof.

```typescript
// src/features/backup/backup.ts
import * as FileSystem from 'expo-file-system'
import * as DocumentPicker from 'expo-document-picker'
import { db } from '@/core/db/client'
// ... zip + crypto helpers

const DB_FILENAME = 'recall.db'

export async function performDailyBackup(opts: {
  destinationUri: string  // user-chosen folder URI
  encryptionPassword?: string
}) {
  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  const backupName = `recall-backup-${ts}.zip`

  // 1. Create a clean DB snapshot via VACUUM INTO
  const dbSnapshot = `${FileSystem.cacheDirectory}snapshot-${ts}.db`
  await db.run(sql`VACUUM INTO ${dbSnapshot}`)

  // 2. Zip the snapshot + media folder
  const zipPath = `${FileSystem.cacheDirectory}${backupName}`
  await createZip([
    { from: dbSnapshot, as: DB_FILENAME },
    { from: `${FileSystem.documentDirectory}media/`, as: 'media/' },
  ], zipPath)

  // 3. Encrypt if password provided
  let finalPath = zipPath
  if (opts.encryptionPassword) {
    finalPath = await encryptFile(zipPath, opts.encryptionPassword)
  }

  // 4. Copy to user's chosen folder (SAF on Android, iCloud on iOS)
  await copyToUserFolder(finalPath, opts.destinationUri, backupName)

  // 5. Update last-backup timestamp in UserPreferences
  // 6. Prune backups older than retention setting
}
```

**Critical correctness rules:**
- Use `VACUUM INTO` for the DB snapshot. Never copy the raw DB file while it's open — risk of corruption.
- Run backups on app launch, after any pending writes are committed.
- If a backup is in progress, defer DB writes via a mutex.
- Failed backups must NOT block app use. Log the failure, show a non-blocking warning.
- Test the restore flow as much as the backup flow. A backup you can't restore is worthless.

---

## 8. State management

### Zustand for client-only state (per-feature)

```typescript
// src/features/review/reviewStore.ts
import { create } from 'zustand'

interface ReviewState {
  currentDeckId: string | null
  currentCardId: string | null
  sessionStartedAt: number | null
  cardsReviewedInSession: number
  startSession: (deckId: string) => void
  setCurrentCard: (cardId: string | null) => void
  incrementReviewed: () => void
  endSession: () => void
}

export const useReviewStore = create<ReviewState>((set) => ({
  currentDeckId: null,
  currentCardId: null,
  sessionStartedAt: null,
  cardsReviewedInSession: 0,
  startSession: (deckId) => set({
    currentDeckId: deckId,
    sessionStartedAt: Date.now(),
    cardsReviewedInSession: 0,
  }),
  setCurrentCard: (cardId) => set({ currentCardId: cardId }),
  incrementReviewed: () => set((s) => ({
    cardsReviewedInSession: s.cardsReviewedInSession + 1,
  })),
  endSession: () => set({
    currentDeckId: null,
    currentCardId: null,
    sessionStartedAt: null,
    cardsReviewedInSession: 0,
  }),
}))
```

### TanStack Query for async data flows

```typescript
// src/features/decks/useDecks.ts
import { useQuery } from '@tanstack/react-query'
import { deckRepository } from './deckRepository'

export function useDecks() {
  return useQuery({
    queryKey: ['decks'],
    queryFn: () => deckRepository.list(),
  })
}
```

After mutations, invalidate queries to refresh UI. Don't try to manually sync Zustand with repository state — let TanStack Query handle async data.

---

## 9. Testing strategy

### Unit tests (Jest)

Required for:
- All repository functions (CRUD + edge cases)
- `scheduler.applyReview` against known FSRS vectors
- `scheduler.previewIntervals` matches what `applyReview` actually produces (no drift)
- Image compression preserves correct dimensions
- Backup creates a valid zip with correct contents

```typescript
// src/features/review/scheduler.test.ts
describe('applyReview', () => {
  it('writes both card update and review log atomically', async () => {
    const cardId = await createTestCard()
    await applyReview(cardId, 'Good', defaultWeights, 90)

    const card = await getCardById(cardId)
    const logs = await getReviewLogsForCard(cardId)

    expect(card.reps).toBe(1)
    expect(logs).toHaveLength(1)
    expect(logs[0].rating).toBe(3)  // Good = 3
    expect(logs[0].new_stability).toBe(card.stability)
  })
})
```

### Component tests (React Native Testing Library)

For:
- Review screen flow: card displays → user taps Good → next card appears
- Deck creation: form fills → submit → deck appears in list
- Note editor: type content → save → note persists

### Manual testing

On real iPhone via Expo Go, daily. Things that need human eyes:
- Animation feel
- Touch target ergonomics (especially review rating buttons one-handed)
- Dark mode aesthetics
- Keyboard behavior
- Gesture responsiveness

---

## 10. Performance considerations

- **Review queue.** Pre-fetch the next 5 cards in background, decode their images, so swiping between cards is instant.
- **Heavy lists.** Use FlashList from Shopify for deck list, note list, search results.
- **SQLite indexes.** Add indexes on:
  - `cards.due_date` (for daily queue queries)
  - `cards.deck_id` (for per-deck stats)
  - `notes.deck_id` (for note listing)
  - `review_logs.card_id` (for retention curves)
- **Avoid N+1 queries.** Repository methods that need related data should JOIN, not loop.

---

## 11. Open questions / decisions still needed

- **Drizzle migrations strategy.** Drizzle Kit generates migrations from schema diffs. For v1 with no users yet, we can iterate on schema directly. Once we have real users, lock to migration files.
- **Full-text search.** SQLite FTS5 is the right choice. Decision deferred to when search ships.
- **Encryption library for backups.** `react-native-crypto-js` works but is JS-only. For performance, consider native solutions later.
- **Cloud folder write API differences.** iCloud vs Google Drive vs Files-via-SAF all have subtly different file-write semantics. Test thoroughly on real devices.
