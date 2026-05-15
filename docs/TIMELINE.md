# Timeline: Recall → Closed Beta on Google Play

**Target:** Closed Testing track live on Google Play with 12+ opted-in testers, 14-day clock ticking.
**Budget:** 3 hours/day = 21 hr/week.
**Method:** Solo dev + Claude Code with planner/builder/reviewer pipeline.
**Stack:** React Native + Expo + TypeScript.
**Dev machine:** Windows laptop + iPhone (Expo Go for live testing) + Android emulator.

## Strategy

The Google Play 14-day closed testing clock starts when:
1. Your app build is approved on the Closed Testing track
2. 12 testers have opted in

**The move:** race to a working-enough-to-test build, push it, start the clock, then keep building features in parallel while testers play with it. The 14-day clock is FREE TIME. Use it.

Realistic target: **closed beta build live by day 12**. Production submission ~2 weeks after that.

---

## Daily testing setup (works from day 1)

- iPhone and Windows laptop on same WiFi
- Install **Expo Go** on iPhone from App Store (free, no Apple Developer account)
- On laptop: `npx expo start`
- On iPhone: scan QR code → app loads in Expo Go
- Edit code on laptop → save → app hot-reloads on iPhone in 1-3 seconds

You're testing on real iOS hardware from day 1. No Mac needed.

For Android: use Android Studio's emulator on Windows. Borrow a physical Android phone if you can — emulator is fine for development but real device is better for UX validation.

When you add native modules (`react-native-iap` for trial, custom op-sqlite config): use **EAS Build** (Expo's cloud Mac service, free tier) to make a development build. Install on iPhone via TestFlight or direct link. Same hot-reload workflow continues.

---

## Week 1 — Setup & Foundation (Days 1–7)

Goal: working "hello Expo" build pushed to Google Play Internal Testing track. Schema, repos, FSRS wired.

### Day 1 — Tooling (3 hr)
- [ ] Install Node 20+, pnpm, watchman
- [ ] Install Expo CLI: `npm install -g expo`
- [ ] Install Android Studio + Android SDK + create AVD
- [ ] Install Claude Code: `npm install -g @anthropic-ai/claude-code`
- [ ] `claude login` and run `claude` in a new directory, walk through onboarding
- [ ] Create GitHub repo `recall` (private)
- [ ] Drop in starter kit: `CLAUDE.md`, `docs/PRD.md`, `docs/TECH_SPEC.md`, `docs/CLAUDE_CODE_ESSENTIALS.md`, `.claude/agents/`, `.claude/commands/`
- [ ] Install **Expo Go** on iPhone from App Store
- [ ] Commit + push the starter kit

### Day 2 — Expo scaffold (3 hr)
- [ ] `pnpm create expo recall --template default` (uses expo-router by default)
- [ ] Add dependencies: `op-sqlite`, `drizzle-orm`, `drizzle-kit`, `ts-fsrs`, `zustand`, `@tanstack/react-query`, `nativewind`, `expo-crypto`, `expo-file-system`, `expo-document-picker`, `expo-image-manipulator`
- [ ] Configure NativeWind + TypeScript strict mode
- [ ] Set up feature-first folder structure (`src/features/`, `src/core/`, `src/ui/`)
- [ ] Get "Hello Recall" running on Android emulator AND on iPhone via Expo Go
- [ ] Commit. Use `/ship`.

### Day 3 — Google Play Console setup (3 hr)
- [ ] Create Google Play Console developer account ($25 one-time if you don't have one)
- [ ] Create app listing: name, short description, basic store listing
- [ ] Configure app signing (use Play App Signing)
- [ ] First build: `eas build --platform android --profile preview` (or `expo run:android` for local)
- [ ] Upload AAB to **Internal Testing track** (no review, fastest)
- [ ] Add yourself as internal tester, install on a real Android device if available
- [ ] **You now have a real app distribution channel set up. Huge unlock.**

### Day 4 — Data model with Drizzle (3 hr)
- [ ] Use `/feature` to invoke planner: "implement core schema from TECH_SPEC.md: Note, Card, Deck, NoteType, ReviewLog, DeckConfig, Tag, Media, UserPreferences via Drizzle"
- [ ] Approve plan, builder writes Drizzle schema + migration setup
- [ ] Reviewer checks conventions
- [ ] Commit via `/ship`
- [ ] **The schema is the foundation. Don't rush this day.**

### Day 5 — Repository layer (3 hr)
- [ ] `/feature` planner: "implement repositories for Note, Card, Deck with CRUD operations following the repository pattern in CLAUDE.md"
- [ ] Build + review + ship
- [ ] Write Jest unit tests for repositories (planner → builder → reviewer)

### Day 6 — FSRS integration (3 hr)
- [ ] `/feature` planner: "wire up ts-fsrs into a Scheduler service per TECH_SPEC.md section 5. On rating, update Card FSRS state and write ReviewLog atomically in a single transaction"
- [ ] Build + review
- [ ] Unit tests against known FSRS test vectors
- [ ] **This is the heart of the app. Get it right.**

### Day 7 — Buffer / catch-up
- [ ] Use this day to finish anything that slipped
- [ ] If on track, set up Jest + React Native Testing Library properly
- [ ] Run through the app on your iPhone via Expo Go to make sure foundations feel right

**End of Week 1:** Internal testing build distributed. Schema, repository, scheduler — all working with passing tests. No real UI yet.

---

## Week 2 — Core UX + Closed Testing push (Days 8–14)

Goal: usable enough to push to **Closed Testing** and start the 14-day clock by day 12.

### Day 8 — Deck list + create (3 hr)
- [ ] `/feature` planner: "deck list screen at app/(tabs)/decks.tsx + create deck flow. Use Zustand for nav state, deckRepository for data."
- [ ] Build + review + ship

### Day 9 — Note creation (Basic + Cloze) (3 hr)
- [ ] `/feature` planner: "note creation screen at app/note/new.tsx for Basic and Cloze note types. Generates Cards from NoteType templates on save."
- [ ] Build + review + ship
- [ ] (Image Occlusion deferred to post-beta — too complex for this phase)

### Day 10 — Daily review queue (3 hr)
- [ ] `/feature` planner: "review screen at app/review/[deckId].tsx: shows due cards, 4-button rating with interval preview, applies via scheduler.applyReview"
- [ ] Build + review + ship
- [ ] **First moment the app feels real. Test it on your iPhone via Expo Go.**
- [ ] **Also: start tester recruitment today.** See below.

### Day 11 — Today stats + search (3 hr)
- [ ] `/feature` planner: "today screen with review count + retention %, and full-text search across notes"
- [ ] Build + review + ship

### Day 12 — Push to Closed Testing (3 hr)
- [ ] Polish-pass: use the app for 30 min on real device, fix top 5 papercuts
- [ ] Update store listing on Play Console (description, basic screenshots)
- [ ] `eas build --platform android --profile production`
- [ ] Upload to **Closed Testing track**
- [ ] Submit for review (typically approved in hours to ~2 days)
- [ ] Set up Closed Testing tester list — add 12 emails
- [ ] Share the opt-in link with testers, walk them through opting in
- [ ] **14-day clock starts now (once approved + 12 opted in).**

### Day 13–14 — Image attachments (3 hr/day)
- [ ] `/feature` planner: "image attachment on notes per TECH_SPEC.md section 6: pick via expo-image-picker, compress via expo-image-manipulator (1280px), strip EXIF, store under documentDirectory/media/"
- [ ] Build + review + ship
- [ ] Test with real images on your iPhone via Expo Go

**End of Week 2:** Closed Testing build approved, 14-day clock ticking. App has core SRS loop, deck + note CRUD, daily review, basic stats, image attachments.

---

## Weeks 3–4 — Clock ticks, build the differentiators (Days 15–28)

Use the 14-day waiting period to ship features that make the trial convert.

### Days 15–17 — Backup (3 hr/day)
- [ ] `/feature` planner: "daily auto-backup per TECH_SPEC.md section 7. VACUUM INTO snapshot, zip with media, save to user-chosen folder via SAF (Android) / Files (iOS). Retention 7/14/30 days."
- [ ] Build + review + ship
- [ ] **This is your hero feature. Don't half-ass it.**

### Days 18–19 — Stats v2 + heatmap (3 hr/day)
- [ ] `/feature` planner: "90-day calendar heatmap of review activity + per-deck progress + 7-day workload forecast"
- [ ] Build + review + ship
- [ ] Push update to Closed Testing — gives testers something new

### Day 20 — Trial mechanism (3 hr)
- [ ] Integrate `react-native-iap` for IAP
- [ ] 14-day trial → ₱199/₱299 one-time configured in Play Console
- [ ] In-app reminder at day 12 of trial
- [ ] Real-device testing on Closed Testing tester accounts (Play Console license testing)
- [ ] This requires a development build via EAS — `react-native-iap` isn't in Expo Go

### Days 21–22 — Onboarding (3 hr/day)
- [ ] First-run experience: 3-screen explainer, sample starter deck, "create your first card" walkthrough
- [ ] **Critical for trial conversion. Don't skip.**

### Day 23 — Settings + theming (3 hr)
- [ ] Theme toggle (light/dark), daily goal config, backup config, FSRS retention slider
- [ ] About screen, privacy policy link (required by Play Store)

### Day 24 — Polish day (3 hr)
- [ ] Use the app like a serious user for 1 hour on iPhone (via dev build now). Fix top 10 papercuts.
- [ ] Update store listing with real screenshots from device
- [ ] Draft launch Reddit posts (don't post yet)

### Day 25 — Tester feedback integration (3 hr)
- [ ] Check Play Console testing feedback
- [ ] Fix critical issues testers found
- [ ] Push update

### Day 26 — Production AAB (3 hr)
- [ ] `eas build --platform android --profile production`
- [ ] Apply for Production access on Play Console (requires 12 testers + 14 days complete)
- [ ] If approved → schedule production release
- [ ] If rejected → read notes, fix, resubmit

### Days 27–28 — iOS port via EAS Build (3 hr/day)
- [ ] Sign up for Apple Developer Program ($99/yr)
- [ ] `eas build --platform ios --profile production` (builds on Expo's Macs in cloud)
- [ ] Submit to TestFlight via App Store Connect
- [ ] Test on your iPhone via TestFlight
- [ ] Most code already works on iOS; fix platform-specific bugs

**End of Week 4:** Production submission in for Android. iOS in TestFlight. Polished app with backup, stats, onboarding, billing.

---

## Tester recruitment (start on day 10)

You need **12 real testers on real Android devices** for 14 continuous days. They must opt in via the Google Play link. Inactive testers can cause rejection.

### Where to find them, ranked by reliability

1. **Personal network** (friends, family, classmates) — most reliable. 5–8 should come from here. Walk them through opting in (most people get confused).
2. **Filipino dev / studygram communities** — r/PHCorporate, r/peyups, FB groups for nursing/law/CPA students. Offer free Pro lifetime in exchange.
3. **Indie dev mutual tester exchanges** — r/AndroidDev, Indie Hackers Discord, Testers Community app. Mutual testing.
4. **Last resort: paid services** — PrimeTestLab, Testers Community ($15–25). Works but feedback is shallow.

### Engagement requirement (Google checks this now)

In 2026 Google flags "insufficient engagement" if testers install but don't actually use the app. Mitigate by:
- Sending testers a 30-second "what to do" video on day 1
- Mid-test check-in message on day 7
- Push updates as you build — gives testers reasons to reopen the app

---

## Risks & contingencies

- **Schema design takes longer than 1 day** → push everything back, don't skimp on Day 4
- **FSRS integration has issues** → ts-fsrs is the reference impl, but if you hit something, ask on the FSRS Discord or GitHub
- **EAS Build slow/fails** → fall back to local Android builds with `eas build --local` (still needs Mac for iOS though)
- **Closed Testing rejected** → Google rejects for missing privacy policy, app-bundle issues, content rating. Read rejection, fix, resubmit. Doesn't restart the 14-day clock for testers already opted in.
- **Can't find 12 testers** → start recruitment day 10, not day 12. Lock in personal network early.
- **3hr/day slips** → cut ruthlessly. Image Occlusion and stats v2 are first to drop. Core loop + backup are non-negotiable.
- **iOS-only bug surfaces** → without a Mac, debugging is harder. Borrow a Mac for an afternoon or use MacInCloud ($30). For v1, most bugs are JS-level and affect both platforms equally.

---

## Definition of done for closed beta

- [ ] App on Closed Testing track, approved by Google
- [ ] 12+ testers opted in for 14 consecutive days
- [ ] Core loop works on real Android device: create deck → create note → review with FSRS → see stats
- [ ] Daily backup works on real device (Android SAF or iOS Files)
- [ ] No crashes in 30 minutes of usage
- [ ] Lint + typecheck + tests all pass

When all checked → apply for Production access.

---

## After closed beta (Week 5+)

- Apply for Production access (typically approved within days if testing complete)
- Soft launch in PH first, regional pricing locked in
- Reddit launch posts (one per relevant sub, spaced out)
- Build-in-public posts on socials with screenshots
- iOS App Store submission via TestFlight
- Start v2 AI planning

The hardest part is week 1–2. Once the foundation + scheduler are working, the rest is UI work that Claude Code accelerates dramatically.

Ship it. 🚢
