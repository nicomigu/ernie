# Ernie — Design System

Reference doc for the visual theme. The `designer` subagent reads this. Update it as the design evolves.

## Theme: "Studious Warmth"

Evokes late-night study at a kitchen table with one warm lamp on. Old encyclopedias and well-loved paperbacks. Vintage AM radio warmth. Scholarly without being stuffy. The Filipino domestic study aesthetic that international users read as "premium indie."

Reference Ernie Baron — Filipino "Walking Encyclopedia" — without explicitly invoking him. The warmth and intellectual seriousness are the brand.

## Color tokens

### Dark mode (primary)

| Token | Hex | Use |
|---|---|---|
| `bg.primary` | `#1A1410` | App background |
| `bg.surface` | `#221A14` | Cards, sheets |
| `bg.elevated` | `#2A1F18` | Modals, popovers |
| `border.subtle` | `#3D2E22` | Hairline dividers |
| `border.default` | `#4F3D2E` | Input borders, card edges |
| `text.primary` | `#F5EBDC` | Body text |
| `text.secondary` | `#C4B5A0` | Secondary text |
| `text.tertiary` | `#8C7B66` | Tertiary, hints |
| `accent.default` | `#D4A574` | Primary accent (amber/brass) |
| `accent.muted` | `#A8855E` | Pressed states |
| `accent.subtle` | `#3D2E1F` | Accent backgrounds |

### Light mode (secondary)

| Token | Hex | Use |
|---|---|---|
| `bg.primary` | `#F8F2E8` | App background |
| `bg.surface` | `#F2EADD` | Cards, sheets |
| `bg.elevated` | `#FFFAF0` | Modals, popovers |
| `border.subtle` | `#E5D9C5` | Hairline dividers |
| `border.default` | `#C9B89A` | Input borders, card edges |
| `text.primary` | `#2A1F14` | Body text |
| `text.secondary` | `#5C4A35` | Secondary text |
| `text.tertiary` | `#8C7B66` | Tertiary, hints |
| `accent.default` | `#A8855E` | Primary accent |
| `accent.muted` | `#8B6E4A` | Pressed states |
| `accent.subtle` | `#EDDFC5` | Accent backgrounds |

### Rating button colors (review screen, both modes)

| Rating | Dark | Light | Note |
|---|---|---|---|
| Again | `#C97364` (muted terracotta) | `#A65442` | Failure, not alarm |
| Hard | `#9C8474` (warm gray) | `#7A6552` | Neutral |
| Good | `#8A9B6E` (sage olive) | `#6B7C50` | Success, not bright green |
| Easy | `#D4A574` (amber, same as accent) | `#A8855E` | The "good plus" reward |

All within the warm earth-tone palette. Never rainbow.

### Anti-colors

- Pure black (`#000`)
- Pure white (`#FFF`)
- Cold gray (`#808080`)
- Bright blue / purple / indigo (the startup palette)
- Material You dynamic color
- Anything that signals "fun gamified study app"

## Typography

### Fonts

- **Inter** — UI chrome (buttons, labels, nav, headers in most contexts)
- **Source Serif Pro** or **Fraunces** — flashcard content specifically
- **Geist Mono** or **IBM Plex Mono** — code blocks, cloze text

Why serif on flashcards: cards are the focal content. Sans-serif chrome + serif content visually separates "the app" from "what you're studying." Evokes encyclopedia / book / index card feel. This is the single most defining detail of the visual identity.

### Scale (NativeWind tokens)

| Token | Size | Use |
|---|---|---|
| `text-xs` | 12px | Captions, hints, metadata |
| `text-sm` | 14px | Secondary body |
| `text-base` | 16px | Body |
| `text-lg` | 18px | Card front (short) |
| `text-xl` | 20px | Card content (default) |
| `text-2xl` | 24px | Screen titles |
| `text-3xl` | 30px | Display, brand mark |

### Line height

Generous. `leading-relaxed` (1.625) on body and card content. Cramped line height feels cheap.

## Spacing

Use NativeWind/Tailwind defaults. Lean generous.

- Section padding: `p-5` to `p-6`
- Card internal padding: `p-6`
- Vertical rhythm between elements: `gap-3` (default), `gap-6` (between sections)
- Screen edge safe area: always `px-5` minimum

## Corners

- Buttons: `rounded-lg` (8px)
- Cards: `rounded-xl` (12px)
- Modals/sheets: `rounded-2xl` (16px) at top edges
- Inputs: `rounded-lg`

Never sharp corners. Never overly round (Material-style 24px+).

## Surfaces and depth

**Flat-first.** No drop shadows. Hierarchy via:

1. Background tone shifts (`bg.primary` → `bg.surface` → `bg.elevated`)
2. Hairline borders (1px, `border.subtle`)
3. Spacing

If you reach for a shadow, stop and reconsider. The aesthetic is flat-with-warmth, not depth-with-shine.

Optional: subtle paper-grain noise overlay on light mode backgrounds (2-3% opacity). Use a Lottie or static PNG tile. Skip on dark mode (looks dirty).

## Motion

- Transitions: 200-300ms, ease-out
- Card flips (review): 350ms with a real Y-axis rotation
- Touch feedback: 80ms darken in, 200ms recede (like ink)
- Page transitions: native stack default, no custom flourishes
- NO bouncy springs except for tactile rating-tap feedback

## Iconography

**Phosphor Icons** (preferred) or Lucide. Use:

- `regular` or `duotone` weight (Phosphor) — soft, scholarly feel
- Never `bold` or `fill` for primary UI
- Size: `size-5` (20px) default, `size-6` (24px) for primary actions

## Components (build these in `src/ui/`)

Build once, use everywhere:

- `Button` (primary, secondary, ghost variants)
- `Card` (note display, deck tile, generic surface)
- `Input` (text, number, password)
- `ListItem` (deck row, settings row, note row)
- `Sheet` (bottom modal)
- `Toast` (non-blocking notification)
- `Tabs`
- `RatingButton` (specific to review — 4 colors, label + interval)
- `EmptyState` (icon + title + description + action)
- `LoadingShimmer` (warm-toned, not gray)

## Empty state pattern

Every list and screen has a designed empty state. The pattern:

```
[Phosphor icon, size-12, color-tertiary]
Title (text-lg, text-primary)
Description, one sentence, why it's empty (text-sm, text-secondary)
[Primary button: the next action]
```

Examples:

**No decks yet:**
- Icon: books
- Title: "No decks yet"
- Description: "Decks group your flashcards. Make your first one to start."
- Button: "Create a deck"

**Today, all caught up:**
- Icon: tea cup or steam (cozy)
- Title: "Done for today"
- Description: "Come back tomorrow or study ahead."
- Button: "Study ahead"

## Localization notes

- Default language: English
- Tagalog: full localization planned for v1
- Taglish welcome in marketing copy, English-only in core UI for clarity
- Specific phrases that resonate (use where natural, never forced):
  - "Tandaan mo 'yan" (Remember that)
  - "Tara, simulan natin" (Let's begin)
  - "Magaling!" (Great job — but use sparingly to avoid gamification)
  - "Done for today" / "Tapos na ngayong araw"

## Reference apps to study

Install and use these. Take screenshots of moments that feel right.

**Primary references (closest to Ernie's aesthetic):**
- Things 3 (iOS) — calmness, premium feel
- Bear Notes — typography-forward, serif handling
- Linear — dense info handled cleanly, dark mode mastery

**Secondary references:**
- Day One (journaling) — warm photo + text mobile UX
- Reeder 5 — calm reading aesthetic
- Mochi Cards — closest SRS analog with calm aesthetic

**Anti-references (study to avoid):**
- Duolingo, Quizlet, kwek — gamified study app aesthetic
- Material You default apps — loud, dynamic-color
- Modern Vercel-style apps — too neutral/cold for Ernie

## Updating this doc

When you make a design decision that breaks or extends the system:
1. Update this doc in the same commit
2. Mention in commit message: "design: add X token"
3. The designer subagent will pick it up next session
