# PRD: Recall — Offline-First Spaced Repetition App

**Status:** Draft v0.4 (locked for v1 build)
**Owner:** Nico
**Last updated:** May 2026

> Working name: Recall. Naming TBD before launch.

---

## TL;DR

A premium, offline-first SRS flashcard app for users who study seriously. **Paid upfront with a 14-day free trial.** ₱199 launch / ₱299 standard in PH; regional pricing globally. Native iOS + Android via React Native + Expo.

- **v1:** Fully local app, FSRS-5 scheduling, daily backup to user's own cloud
- **v2:** AI layer (BYOK + consumable credit packs)
- **v3:** First-party curated content packs (small experiment, then expand if signal)
- **v4+:** Sync, web/desktop, marketplace (only if revenue justifies)

## 1. Problem

Serious SRS users in 2026 face a tradeoff: the dominant tool has a brutal UX and aging defaults; modern competitors are PWAs with watered-down SRS and monthly subscriptions; Filipino students in particular have no SRS app priced and designed for them. There's a clean lane for a *premium, native, offline-first* tool with one-time pricing.

## 2. Vision

The SRS app for people who actually need to remember. Native, offline, one-time payment, respects your data, gets out of your way.

## 3. Goals (v1)

- Works fully offline. Network state never blocks the user.
- < 30 seconds from "I want to remember this" to a saved card.
- FSRS-5 scheduling with real algorithmic rigor.
- Zero telemetry. Zero ads. No subscription anywhere in the app.
- Schema designed sync-ready from day 1 (sync ships in v4+ if revenue justifies).
- Ship to Android first (closed beta), iOS shortly after via EAS Build.

## 4. Non-goals (v1)

Sync · accounts · cloud servers · social/shared decks · AI · web/desktop app · audio/video cards · plugins · custom note type editor · freemium tier · content marketplace.

## 5. Target users

**Primary (all three weighted equally):**

- **Filipino board exam preppers** — NLE, NMAT/PLE, Bar, CPA, LET. High retention needs over 6–18 month prep cycles. Mobile-first.
- **Medical students globally** — heavy SRS users by necessity. Massive image-occlusion needs. Strong word-of-mouth networks.
- **Serious language learners** — long-haul JP/KR/ZH/AR learners working through 5,000–20,000+ card decks over years. Active communities (Refold, immersion-learning subs).

**Secondary:** devs prepping for technical interviews, power users churning from incumbent SRS apps, self-directed learners with real retention goals.

**Not targeting:** casual students using flashcards for next week's quiz.

## 6. Competitive positioning

The SRS market splits into two camps: the dominant free/open-source tool with deep features but aging UX, and modern subscription-based study apps that often skip real SRS scheduling for gamified quizzing. Native mobile + true offline + real FSRS scheduling + one-time pricing is an unoccupied lane.

**Differentiation pillars:**

- Truly native + truly offline (works on the LRT, on a plane, on a dead prepaid SIM)
- Real algorithmic rigor — FSRS-5, visible to user via interval previews
- One-time payment — no subscription drag
- Privacy-first — no servers, no accounts, backup to user's own cloud

**Marketing line:** *"₱299 once. Yours forever. No subscription."* Or in Taglish: *"Bayad minsan. Hindi buwanan."*

## 7. Pricing & monetization

### v1: Paid upfront with 14-day free trial

- **Free trial:** 14 days, full feature access, store-native (Apple/Google handle billing)
- **One-time purchase:**
  - PH launch (first 3 months): **₱199 founder pricing**
  - PH standard: **₱299**
  - Global tiered:
    - Developed (US/EU/UK/AU/CA/JP/KR/SG): ~$6 launch / ~$7 standard
    - Emerging (LatAm / India / SEA non-PH): ~$3 launch / ~$4 standard
- **All features included.** No tiers, no Pro+, ever. Pay once, get everything, future updates included.
- **Day 12 in-app reminder:** "Your trial ends in 2 days. Keep all your progress for ₱299 once."

### v2: AI features

- **BYOK** — user provides their own Anthropic/OpenAI/Gemini API key. Free, app charges nothing.
- **App-managed credits** — consumable IAP packs:
  - ₱149 / ~$2.50 = ~200 card generations
  - ₱449 / ~$8 = ~700 card generations
- **No AI subscription.** Pay only when you use it.
- **Local models** (Apple Intelligence, Gemini Nano) for lightweight tasks — free, on-device.

### v3: First-party content packs (experiment)

Realistic PH pricing (calibrated to what students actually spend on supplementary materials):

- **Subject-specific deck:** ₱299–499 (e.g., "NLE Pharmacology Complete")
- **Combined bundle:** ₱799–1,299 (e.g., "NLE Final Sprint — 6 subjects")
- **Full prep package:** ₱1,499–1,999 max (positioned as "replaces ₱5k of books")
- Global tiered, same as app pricing logic

**Creator revenue share:** 70% to creator, 30% to platform. Statements monthly, payouts via GCash/InstaPay (PH) or Wise (international).

**Volume reality:** content business at PH prices realistically generates ₱300–500k gross / year at 5k users with 5 packs. Useful supplementary income, not a transformation. Stays small + curated unless signals say otherwise.

### Why not freemium

Freemium = feature-gating, upgrade prompts, conversion funnels, support burden from non-paying users. Premium pricing aligns with the product ethos, sorts for serious users, matches reference-class indie apps (Things 3, Tot, Soulver, Obsidian).

### Revenue reality check

- Year 1 realistic: 500–2,000 installs → ₱150k–600k gross → ~₱105k–420k net after store fees
- v1 server costs: **₱0** (no servers — everything local + user's own cloud for backup)
- v2 AI infrastructure: pay-as-you-go via credit margin, BYOK eats nothing
- Year 1 = supplemental income tier. Year 2 with AI + word-of-mouth = compounding.

## 8. Platform & stack

- **Framework:** React Native + Expo (managed workflow), TypeScript
- **DB:** op-sqlite + Drizzle ORM (type-safe schema)
- **Scheduler:** ts-fsrs (canonical FSRS-5 implementation)
- **State:** Zustand + TanStack Query
- **Navigation:** expo-router (file-based)
- **Styling:** NativeWind (Tailwind for RN)
- **Backup:** expo-file-system + expo-document-picker

**Release order:** Android first (closed beta day 12), iOS shortly after via EAS Build from Windows laptop.

---

## 9. MVP scope (v1)

### Cards

- **Note types** (hardcoded in v1, stored in DB as data for v3 extensibility): Basic, Basic + Reverse, Cloze, Image Occlusion
- Rich text in fields: bold, italic, code, lists
- Image attachments with auto-compression (long edge 1280px, EXIF stripped)
- Hierarchical tags (`lang::japanese::n3`)
- Full-text search across notes

### Decks

- Create / rename / delete; nested decks
- Per-deck config: new cards/day, max reviews/day, FSRS params, target retention

### Review

- **FSRS-5** scheduler via `ts-fsrs`
- 4-button rating: Again / Hard / Good / Easy
- **Interval preview on each button** ("Good · 4d") — visible algorithmic rigor
- Daily queue with progress indicator
- Undo last review
- Default FSRS weights; "Optimize my schedule" button unlocks at 400+ reviews

### Stats

- Today view: cards reviewed, time spent, retention %
- 90-day calendar heatmap
- Per-deck progress + 7-day workload forecast
- Full retention curve + hardest-cards analytics

### Backup (v1 hero feature)

- **Automatic daily backup** to user's chosen location: iCloud Drive (iOS) / Google Drive / SAF folder (Android) / Files app
- Backup contains full database + media zip
- Retention settings: 7 / 14 / 30 days / all
- Manual "Backup now" + "Restore from backup..." in settings
- Optional password-protected encrypted backup (AES-256, user-supplied password)
- Last-backup timestamp + size visible in UI

### Data

- SQLite (op-sqlite) with WAL mode
- CSV import with column mapping
- CSV + native-format export (full data ownership)
- Manual backup to share sheet / file picker

---

## 10. v2 — AI layer

**Core principle:** AI is additive. Every feature independently toggleable. Offline mode stays fully functional with zero AI.

### Features (priority order)

1. **Card generation from source** — paste text/PDF/URL → AI proposes cards → user reviews & accepts. Never auto-adds.
2. **Smart cloze** — highlight a passage, AI suggests blanks.
3. **"Explain again"** — in-review explanation for cards you keep failing.
4. **Mnemonic generator** — memory hooks for user-flagged hard cards.
5. **Duplicate detection** — semantic similarity check on card creation.
6. **Conversational review** — AI quizzes with varied phrasing.
7. **Auto-tagging** — suggest tags from card content.

### Model strategy

- **BYOK** — free for user, $0 cost to us
- **App-managed (credits)** — for users who don't want to handle API keys
- **Local models** — Apple Intelligence, Gemini Nano. Free, on-device, reinforces offline-first

---

## 11. v3 — Content packs (experiment, then expand)

Trigger conditions before shipping v3:
- v1 + v2 launched and stable
- ≥ 3,000 active app users
- AI credit revenue demonstrating user willingness to spend beyond ₱299
- Demand signal: repeated "is there a deck for X" requests across support/Reddit/socials

### v3 launch shape

- **1–2 flagship packs**, first-party / paid partnership only
- Most likely: NLE Pharmacology (largest single audience in PH)
- Pricing: ₱299–499 per pack, ₱899–1,299 bundle
- Creator partnerships via DMs/email — no full marketplace
- Trust mechanism: detailed monthly PDF statements + shared Google Sheet for creators
- Operational infra: Google Sheet + reconciliation script (Phase 1 from earlier discussion)

### Decision points after v3 launch

If first pack sells 100+ copies in launch month → expand to 3–5 packs across NLE / Bar / CPA / JLPT.
If first pack sells < 30 copies → drop content business, focus on app + AI.

### Permanently out of scope until further notice

- Open marketplace with user-submitted decks
- Creator self-serve portal
- Marketplace search / discovery / ratings
- Refund disputes / chargeback workflows

---

## 12. v4+ — "When we're swimming in money"

Ship only when revenue + capacity justifies:

- Cross-device sync (E2E encrypted, self-host Docker option)
- Web/desktop apps
- Custom note type editor (UI for what's already in schema)
- Audio/video cards
- Open content marketplace with user submissions
- TTS / pronunciation features
- Family / classroom plans

**Principle:** do not ship sync until users are asking AND revenue covers ongoing server cost AND there's capacity to support it. Local-first + daily backup to user's own cloud is the v1 story, and it's *better* than half-baked sync.

---

## 13. Marketing strategy

**Budget: ₱0. Channels: ASO, Reddit, own socials.**

### App Store Optimization

- Title: "Recall: Flashcards & SRS" (or similar with strongest keyword)
- Subtitle/short description as second keyword slot
- iOS keywords field — 100 chars, no spaces
- Screenshots lead with captions:
  - "Works fully offline"
  - "No subscription. ₱299 once."
  - "Real spaced repetition with FSRS-5"
  - "Daily backup to your cloud"
- Localize listing to Tagalog, Spanish, Portuguese, Japanese, Korean, Indonesian
- 14-day trial mentioned prominently

### Reddit (highest-impact launch channel)

- Build presence in r/Anki, r/medicalschoolanki, r/languagelearning, r/medicalschool, r/LSAT, r/MCAT, r/medstudentph BEFORE launching
- One launch post per relevant sub, spaced out
- Frame as "I built this because [specific frustration], here's what's different, here's the trial"
- Reply to every comment in first 6 hours

### Own socials

- Build-in-public posts → audience (multi-year compounding play)
- Short videos (30–60s) showing single wow features → faster install ROI
- Post in Taglish for Filipino studygram community

### Cornerstone content

One really good evergreen piece:
- "FSRS explained" / "Why your flashcard app sucks" / "How to study for [PH board] with SRS"
- Hosted on landing page that doubles as app website

### Pricing as marketing

- "₱299 once. Subscription competitors charge ₱2,000+/year."
- Founder pricing urgency: ₱199 first 3 months
- "All future updates included"

### Explicitly skip

Product Hunt · paid ads · influencer outreach (no leverage yet) · TikTok unless genuinely enjoyable · press outreach

---

## 14. Risks & open questions

- **Trial conversion rate** — unknown. Industry says 8–20% for 14-day trials. Validate post-launch.
- **Incumbent gravity** — dominant SRS app has 15 years of momentum. Compete on UX + ethos + algorithmic visibility, not feature parity.
- **Solo dev capacity at 3hr/day** — ambitious scope. Cut ruthlessly if needed. Image Occlusion is the v1 → v1.1 candidate.
- **AI token cost forecasting (v2)** — credit pricing assumes 2026 token rates; need monitoring + repricing flexibility.
- **Apple/Google policy on BYOK** — verify approval before v2 ships.
- **Content business operational tax** — even at small scale, BIR compliance + monthly creator payouts is real ongoing work. Defer until signals.
- **No Mac for iOS builds** — EAS Build covers this for v1, but might bite for iOS-specific debugging. Borrow a Mac if needed.

## 15. Permanently out of scope

Real-time collab · heavy gamification (streaks beyond simple daily, leagues, leaderboards) · third-party analytics SDKs · plugin system · ads in any form · selling user data

---

## Next decisions before code

1. **Brand name confirmation** (Recall vs alternatives)
2. **v1 ship target date** (Day 28 closed beta per TIMELINE.md)
3. **First curated partnership conversations** — start identifying who you'd partner with for v3 content, even if just informally
