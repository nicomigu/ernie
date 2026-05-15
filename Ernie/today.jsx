// today.jsx — Ernie · Today screen
// Three variations: V1 One Thing · V2 Daybook · V3 Forecast.
// Shares the dark warm palette (see E in review.jsx) and the FONT_* constants.

// Today reuses E + FONT_* globals from review.jsx (loaded first by the host).
// If review.jsx isn't loaded, we declare local fallbacks so this file is
// independently runnable.
const TE = (typeof E !== 'undefined') ? E : {
  bg: '#1A1410', bgLift: '#221A14', bgInk: '#150F0B',
  hair: 'rgba(240,232,221,0.08)', hairStrong: 'rgba(240,232,221,0.14)',
  ink: '#F0E8DD', ink2: 'rgba(240,232,221,0.62)', ink3: 'rgba(240,232,221,0.38)',
  amber: '#D4A574', amberDim: 'rgba(212,165,116,0.16)',
  again: '#B86349', hard: '#9C8E7B', good: '#94A47A', easy: '#D4A574',
  againBg: 'rgba(184,99,73,0.14)',
  hardBg:  'rgba(156,142,123,0.14)',
  goodBg:  'rgba(148,164,122,0.14)',
  easyBg:  'rgba(212,165,116,0.16)',
};
const T_UI = (typeof FONT_UI !== 'undefined') ? FONT_UI : '"Inter", -apple-system, sans-serif';
const T_SERIF = (typeof FONT_SERIF !== 'undefined') ? FONT_SERIF : '"Fraunces", Georgia, serif';
const T_MONO = (typeof FONT_MONO !== 'undefined') ? FONT_MONO : '"IBM Plex Mono", ui-monospace, Menlo, monospace';

// ─────────────────────────────────────────────────────────────
// Sample data — Tuesday evening, mid-week reviewing rhythm
// ─────────────────────────────────────────────────────────────
const TODAY = {
  weekday: 'Tuesday', date: 'May 12',
  greeting: 'Good evening',
  totalDue: 47, newC: 4, learn: 6, review: 37,
  estimatedMin: 28,
  streak: 47,
  goal: { done: 12, target: 50 },
  retention: 0.92,
  decks: [
    { id: 'pharm-cardio', name: 'Pharm · Cardio', tag: 'NMAT',
      due: 23, newC: 2, learn: 3, review: 18, lastSeen: '6h ago', priority: 'high' },
    { id: 'pharm-renal', name: 'Pharm · Renal', tag: 'NMAT',
      due: 12, newC: 1, learn: 2, review: 9, lastSeen: '1d ago' },
    { id: 'spanish-a2', name: 'Spanish · A2', tag: 'Vocab',
      due: 8, newC: 1, learn: 1, review: 6, lastSeen: '2d ago' },
    { id: 'anatomy', name: 'Anatomy · Thorax', tag: 'NMAT',
      due: 4, newC: 0, learn: 0, review: 4, lastSeen: 'never', isNew: true },
  ],
  forecast: [
    { day: 'Mon', date: 11, count: 38, isPast: true, done: 38 },
    { day: 'Tue', date: 12, count: 47, isToday: true, done: 12 },
    { day: 'Wed', date: 13, count: 52 },
    { day: 'Thu', date: 14, count: 41 },
    { day: 'Fri', date: 15, count: 31 },
    { day: 'Sat', date: 16, count: 28 },
    { day: 'Sun', date: 17, count: 35 },
  ],
  continueSession: { deck: 'Pharm · Cardio', remaining: 11, started: '24m ago' },
};

// ─────────────────────────────────────────────────────────────
// Tab bar — shared across all variants
// ─────────────────────────────────────────────────────────────
function TabIcon({ kind, active, c }) {
  const stroke = active ? c.amber : c.ink3;
  const sw = 1.5;
  switch (kind) {
    case 'today':
      return <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 3v3M3 11h3M19 11h-3M11 19v-3" stroke={stroke} strokeWidth={sw} strokeLinecap="round"/>
        <circle cx="11" cy="11" r="4" stroke={stroke} strokeWidth={sw} fill={active ? c.amberDim : 'none'}/>
      </svg>;
    case 'decks':
      return <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="5" y="3" width="12" height="14" rx="1.5" stroke={stroke} strokeWidth={sw}/>
        <path d="M8 6V14M12 6V14M15.5 7v6" stroke={stroke} strokeWidth={sw} strokeLinecap="round" opacity={active ? 1 : 0.5}/>
      </svg>;
    case 'browse':
      return <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="10" cy="10" r="6" stroke={stroke} strokeWidth={sw}/>
        <path d="M15 15l4 4" stroke={stroke} strokeWidth={sw} strokeLinecap="round"/>
      </svg>;
    case 'stats':
      return <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M3 18V13M8 18V8M13 18V11M18 18V5" stroke={stroke} strokeWidth={sw} strokeLinecap="round"/>
      </svg>;
    case 'settings':
      return <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="2.5" stroke={stroke} strokeWidth={sw}/>
        <path d="M11 2v2M11 18v2M2 11h2M18 11h2M4.6 4.6l1.4 1.4M16 16l1.4 1.4M4.6 17.4L6 16M16 6l1.4-1.4" stroke={stroke} strokeWidth={sw} strokeLinecap="round"/>
      </svg>;
  }
}

function TabBar({ active = 'today', c = TE }) {
  const tabs = [
    { k: 'today', label: 'Today' },
    { k: 'decks', label: 'Decks' },
    { k: 'browse', label: 'Browse' },
    { k: 'stats', label: 'Stats' },
    { k: 'settings', label: 'Settings' },
  ];
  return (
    <div style={{
      borderTop: `1px solid ${c.hair}`,
      background: c.bg,
      paddingBottom: 8, paddingTop: 8,
      display: 'flex', flexShrink: 0,
    }}>
      {tabs.map((t) => {
        const isActive = t.k === active;
        return (
          <button key={t.k} style={{
            flex: 1, background: 'transparent', border: 'none', padding: '4px 0',
            cursor: 'pointer', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 3, color: isActive ? c.amber : c.ink3,
            fontFamily: T_UI,
          }}>
            <TabIcon kind={t.k} active={isActive} c={c} />
            <span style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: 0.1 }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// Small daily-goal ring — used in V1 and V2
function GoalRing({ done, target, c = TE, size = 48, sw = 4 }) {
  const r = (size - sw) / 2;
  const C = 2 * Math.PI * r;
  const pct = Math.min(1, done / target);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c.hair} strokeWidth={sw}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c.amber} strokeWidth={sw}
          strokeDasharray={C} strokeDashoffset={C * (1 - pct)} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset .4s ease' }}/>
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: T_MONO, fontSize: 10.5, fontWeight: 500, color: c.ink2,
        fontVariantNumeric: 'tabular-nums', letterSpacing: -0.2,
      }}>{done}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// V1 · ONE THING — single hero CTA, big number, calm
// ─────────────────────────────────────────────────────────────
function TodayV1({ light = false }) {
  const c = light ? makeLight() : TE;
  return (
    <div style={containerStyle(c, light)}>
      <div style={{ height: 54, flexShrink: 0 }} />

      {/* Top bar — date + streak chip */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px 0', flexShrink: 0,
      }}>
        <div style={{ lineHeight: 1.15 }}>
          <div style={{ fontSize: 13, color: c.ink3, fontFamily: T_UI, fontWeight: 500, letterSpacing: -0.1 }}>{TODAY.greeting}</div>
          <div style={{ fontSize: 13, color: c.ink2, fontFamily: T_UI, marginTop: 2 }}>{TODAY.weekday}, {TODAY.date}</div>
        </div>
        <StreakChip days={TODAY.streak} c={c} />
      </div>

      {/* Hero queue */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '0 24px',
      }}>
        <div style={{
          fontFamily: T_MONO, fontSize: 10.5, letterSpacing: 1.4,
          color: c.ink3, textTransform: 'uppercase', marginBottom: 10,
        }}>cards due today</div>
        <div style={{
          fontFamily: T_SERIF, fontSize: 120, lineHeight: 0.92,
          fontWeight: 400, letterSpacing: -5, color: c.ink,
          fontVariantNumeric: 'tabular-nums', marginBottom: 16,
        }}>{TODAY.totalDue}</div>
        <div style={{
          display: 'flex', gap: 18, fontFamily: T_MONO, fontSize: 12,
          color: c.ink2, fontVariantNumeric: 'tabular-nums', marginBottom: 28,
        }}>
          <span><span style={{ color: c.amber }}>●</span> {TODAY.newC} new</span>
          <span><span style={{ color: c.again }}>●</span> {TODAY.learn} learn</span>
          <span><span style={{ color: c.good }}>●</span> {TODAY.review} review</span>
        </div>

        {/* Daily goal */}
        <div style={{ marginBottom: 8 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontFamily: T_MONO, fontSize: 10.5, letterSpacing: 1.2,
            color: c.ink3, textTransform: 'uppercase', marginBottom: 8,
          }}>
            <span>daily goal</span>
            <span><span style={{ color: c.ink }}>{TODAY.goal.done}</span> / {TODAY.goal.target}</span>
          </div>
          <div style={{ height: 3, borderRadius: 2, background: c.hair, overflow: 'hidden' }}>
            <div style={{
              width: `${(TODAY.goal.done / TODAY.goal.target) * 100}%`,
              height: '100%', background: c.amber,
              transition: 'width .4s ease',
            }} />
          </div>
          <div style={{ fontSize: 11.5, color: c.ink3, fontFamily: T_UI, marginTop: 8, lineHeight: 1.4 }}>
            About {TODAY.estimatedMin} minutes at your usual pace.
          </div>
        </div>
      </div>

      {/* Continue (small) + Hero CTA */}
      <div style={{ padding: '12px 16px 18px', flexShrink: 0 }}>
        <button style={{
          width: '100%', background: 'transparent', border: 'none',
          padding: '8px 4px 14px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontFamily: T_UI, color: c.ink3, fontSize: 12.5,
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="5" stroke={c.ink3} strokeWidth="1.2"/>
              <path d="M5 4l3 2-3 2V4z" fill={c.ink3}/>
            </svg>
            continue · Pharm · Cardio · 11 left
          </span>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M3 1.5L6.5 5L3 8.5" stroke={c.ink3} strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </button>
        <button style={primaryCTA(c)}>
          <span>Start review</span>
          <span style={{ fontFamily: T_MONO, fontSize: 11, opacity: 0.7, letterSpacing: 0.4 }}>47</span>
        </button>
      </div>

      <TabBar active="today" c={c} />
    </div>
  );
}

function StreakChip({ days, c }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 999,
      border: `1px solid ${c.hair}`,
      fontFamily: T_MONO, fontSize: 11.5, color: c.ink2,
      fontVariantNumeric: 'tabular-nums', letterSpacing: 0.2,
    }}>
      <svg width="11" height="13" viewBox="0 0 11 13" fill={c.amber}>
        <path d="M5.5 0C6 2 8 3 8 5.5C8 6.5 7.5 7 7 7C7 6 6 5 5.5 4.5C5 6 3 7 3 9C3 10.5 4 12 5.5 12C7 12 9 10.5 9 8.5C9 5 7 3 5.5 0Z"/>
      </svg>
      {days} days
    </div>
  );
}

function primaryCTA(c) {
  return {
    width: '100%', height: 56, background: c.amber, color: c.bgInk || '#150F0B',
    border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 600,
    fontFamily: T_UI, cursor: 'pointer', letterSpacing: -0.1,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
    transition: 'background .15s, transform .1s',
  };
}

function containerStyle(c, light) {
  const grain = light
    ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.4 0 0 0 0 0.3 0 0 0 0 0.15 0 0 0 0.02 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
    : 'none';
  return {
    width: '100%', height: '100%', background: c.bg, color: c.ink,
    fontFamily: T_UI, display: 'flex', flexDirection: 'column',
    position: 'relative', backgroundImage: grain,
  };
}

function makeLight() {
  return {
    bg: '#F5EFE6', bgLift: '#FBF6EC', bgInk: '#EDE6D9',
    hair: 'rgba(60,40,20,0.10)', hairStrong: 'rgba(60,40,20,0.18)',
    ink: '#2A2218', ink2: 'rgba(42,34,24,0.65)', ink3: 'rgba(42,34,24,0.42)',
    amber: '#A87A3D', amberDim: 'rgba(168,122,61,0.14)',
    again: '#A85A42', hard: '#7B6F5E', good: '#6F8556', easy: '#A87A3D',
    againBg: 'rgba(168,90,66,0.10)',
    hardBg: 'rgba(123,111,94,0.10)',
    goodBg: 'rgba(111,133,86,0.12)',
    easyBg: 'rgba(168,122,61,0.13)',
  };
}

// ─────────────────────────────────────────────────────────────
// V2 · DAYBOOK — date-led, per-deck list, journal feel
// ─────────────────────────────────────────────────────────────
function TodayV2() {
  const c = TE;
  return (
    <div style={containerStyle(c, false)}>
      <div style={{ height: 54, flexShrink: 0 }} />

      {/* Date header */}
      <div style={{ padding: '20px 24px 0', flexShrink: 0 }}>
        <div style={{
          fontFamily: T_MONO, fontSize: 10.5, letterSpacing: 1.4,
          color: c.ink3, textTransform: 'uppercase', marginBottom: 8,
        }}>{TODAY.greeting.toLowerCase()}</div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        }}>
          <div>
            <div style={{
              fontFamily: T_SERIF, fontSize: 30, lineHeight: 1.05,
              fontWeight: 400, letterSpacing: -0.6, color: c.ink,
            }}>{TODAY.weekday},</div>
            <div style={{
              fontFamily: T_SERIF, fontSize: 30, lineHeight: 1.05,
              fontWeight: 400, letterSpacing: -0.6, color: c.ink2,
            }}>{TODAY.date}</div>
          </div>
          <GoalRing done={TODAY.goal.done} target={TODAY.goal.target} c={c} size={56} sw={4} />
        </div>

        <div style={{
          fontFamily: T_UI, fontSize: 14, color: c.ink2,
          lineHeight: 1.5, marginTop: 18, textWrap: 'pretty',
        }}>
          <span style={{ color: c.ink }}>{TODAY.totalDue} cards</span> across {TODAY.decks.length} decks · about {TODAY.estimatedMin} minutes
        </div>
      </div>

      {/* Deck list */}
      <div style={{ flex: 1, padding: '20px 16px 8px', overflow: 'auto', minHeight: 0 }}>
        <div style={{
          fontFamily: T_MONO, fontSize: 10, letterSpacing: 1.4,
          color: c.ink3, textTransform: 'uppercase',
          padding: '0 8px 8px',
        }}>queue</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {TODAY.decks.map((d) => <DeckRow key={d.id} deck={d} c={c} />)}
        </div>
      </div>

      {/* Continue strip + tab bar */}
      <div style={{
        padding: '8px 16px 12px', flexShrink: 0,
        borderTop: `1px solid ${c.hair}`,
      }}>
        <ContinueStrip c={c} />
      </div>
      <TabBar active="today" c={c} />
    </div>
  );
}

function DeckRow({ deck, c }) {
  const dueAccent = deck.due === 0 ? c.ink3 : (deck.priority === 'high' ? c.amber : c.ink);
  return (
    <button style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 12px', background: 'transparent', border: 'none',
      borderRadius: 10, cursor: 'pointer', textAlign: 'left',
      fontFamily: T_UI, color: c.ink, width: '100%',
      transition: 'background .15s',
    }}
      onMouseEnter={(e) => (e.currentTarget.style.background = c.hair)}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      {/* small queue marker — 3 stacked bars showing new/learn/review proportion */}
      <div style={{ width: 4, height: 36, borderRadius: 2, background: c.hair, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column-reverse',
        }}>
          {[
            { c: c.good, v: deck.review },
            { c: c.again, v: deck.learn },
            { c: c.amber, v: deck.newC },
          ].map((s, i) => {
            const total = Math.max(1, deck.newC + deck.learn + deck.review);
            return <div key={i} style={{ height: `${(s.v / total) * 100}%`, background: s.c }} />;
          })}
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 15.5, fontWeight: 500, color: c.ink, lineHeight: 1.2,
          letterSpacing: -0.1, marginBottom: 3,
        }}>{deck.name}</div>
        <div style={{
          fontFamily: T_MONO, fontSize: 11, color: c.ink3,
          fontVariantNumeric: 'tabular-nums', letterSpacing: 0.2,
        }}>
          {deck.isNew
            ? <span>new deck · {deck.due} cards</span>
            : <>
                {deck.newC > 0 && <><span style={{ color: c.amber }}>{deck.newC}n</span> · </>}
                {deck.learn > 0 && <><span style={{ color: c.again }}>{deck.learn}l</span> · </>}
                <span style={{ color: c.good }}>{deck.review}r</span>
                <span style={{ color: c.ink3 }}> · last {deck.lastSeen}</span>
              </>}
        </div>
      </div>

      <div style={{
        fontFamily: T_MONO, fontSize: 22, fontWeight: 500,
        color: dueAccent, fontVariantNumeric: 'tabular-nums',
        letterSpacing: -0.8,
      }}>{deck.due}</div>

      <svg width="10" height="14" viewBox="0 0 10 14" fill="none" style={{ flexShrink: 0 }}>
        <path d="M2 1l6 6-6 6" stroke={c.ink3} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}

function ContinueStrip({ c }) {
  return (
    <button style={{
      width: '100%', height: 56, background: c.amber, color: c.bgInk || '#150F0B',
      border: 'none', borderRadius: 12, padding: '0 16px',
      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      fontFamily: T_UI,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M5.5 4.5l4 2.5-4 2.5V4.5z" fill="currentColor"/>
        </svg>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.1, lineHeight: 1.15 }}>Continue review</div>
          <div style={{ fontFamily: T_MONO, fontSize: 10.5, opacity: 0.7, marginTop: 1, letterSpacing: 0.3 }}>{TODAY.continueSession.deck} · {TODAY.continueSession.remaining} left</div>
        </div>
      </div>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M4 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// V3 · FORECAST — 7-day workload strip + detail
// ─────────────────────────────────────────────────────────────
function TodayV3() {
  const c = TE;
  const maxCount = Math.max(...TODAY.forecast.map((d) => d.count));

  return (
    <div style={containerStyle(c, false)}>
      <div style={{ height: 54, flexShrink: 0 }} />

      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px 4px', flexShrink: 0,
      }}>
        <div style={{ lineHeight: 1.15 }}>
          <div style={{ fontSize: 13, color: c.ink2, fontFamily: T_UI, fontWeight: 500 }}>{TODAY.weekday}, {TODAY.date}</div>
          <div style={{ fontFamily: T_MONO, fontSize: 10.5, color: c.ink3, letterSpacing: 0.8, marginTop: 3, textTransform: 'uppercase' }}>workload · 7 days</div>
        </div>
        <StreakChip days={TODAY.streak} c={c} />
      </div>

      {/* 7-day workload strip */}
      <div style={{ padding: '20px 16px 12px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 110 }}>
          {TODAY.forecast.map((d) => {
            const h = (d.count / maxCount) * 88;
            const done = d.done != null ? (d.done / d.count) * h : 0;
            return (
              <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%' }}>
                <div style={{
                  flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end',
                  borderRadius: 4, overflow: 'hidden', position: 'relative',
                }}>
                  <div style={{
                    width: '100%', height: h,
                    background: d.isToday ? c.amber : d.isPast ? c.hair : c.bgLift,
                    border: d.isToday ? 'none' : `1px solid ${c.hair}`,
                    borderRadius: 4, position: 'relative', overflow: 'hidden',
                  }}>
                    {d.isPast && done > 0 && (
                      <div style={{
                        position: 'absolute', left: 0, right: 0, bottom: 0,
                        height: done, background: c.good,
                      }} />
                    )}
                    {d.isToday && done > 0 && (
                      <div style={{
                        position: 'absolute', left: 0, right: 0, bottom: 0,
                        height: done, background: c.bgInk, opacity: 0.5,
                      }} />
                    )}
                  </div>
                </div>
                <div style={{
                  fontFamily: T_MONO, fontSize: 10, color: d.isToday ? c.amber : c.ink3,
                  letterSpacing: 0.4, fontVariantNumeric: 'tabular-nums', textTransform: 'uppercase',
                  fontWeight: d.isToday ? 600 : 400,
                }}>{d.day}</div>
                <div style={{
                  fontFamily: T_MONO, fontSize: 11, color: d.isToday ? c.ink : c.ink2,
                  fontVariantNumeric: 'tabular-nums',
                  fontWeight: d.isToday ? 600 : 400,
                  marginTop: -2,
                }}>{d.count}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Today detail */}
      <div style={{ flex: 1, padding: '12px 20px 12px', minHeight: 0, overflow: 'auto' }}>
        <div style={{
          padding: '18px 20px', borderRadius: 12,
          background: c.bgLift, border: `1px solid ${c.hair}`,
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontFamily: T_MONO, fontSize: 10.5, letterSpacing: 1.2,
            color: c.ink3, textTransform: 'uppercase', marginBottom: 12,
          }}>
            <span>today</span>
            <span><span style={{ color: c.amber }}>{TODAY.goal.done}</span> / {TODAY.totalDue}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 14 }}>
            <div style={{
              fontFamily: T_SERIF, fontSize: 56, lineHeight: 0.95,
              fontWeight: 400, letterSpacing: -2, color: c.ink,
              fontVariantNumeric: 'tabular-nums',
            }}>{TODAY.totalDue - TODAY.goal.done}</div>
            <div style={{ fontSize: 13, color: c.ink2 }}>cards left · ~{TODAY.estimatedMin - 6}m</div>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1,
            background: c.hair, borderRadius: 8, overflow: 'hidden',
            border: `1px solid ${c.hair}`, marginBottom: 14,
          }}>
            <QSeg label="new" val={TODAY.newC} color={c.amber} c={c} />
            <QSeg label="learn" val={TODAY.learn} color={c.again} c={c} />
            <QSeg label="review" val={TODAY.review} color={c.good} c={c} />
          </div>

          <div style={{
            padding: '12px 14px', background: c.bgInk,
            borderRadius: 8, fontSize: 12, color: c.ink2, lineHeight: 1.5,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontFamily: T_MONO, fontSize: 10, letterSpacing: 1, color: c.ink3, textTransform: 'uppercase' }}>retention if finished</span>
              <span style={{ fontFamily: T_MONO, fontSize: 11, color: c.amber, fontVariantNumeric: 'tabular-nums' }}>{Math.round(TODAY.retention * 100)}%</span>
            </div>
            <div style={{ fontFamily: T_UI, fontSize: 12.5, color: c.ink2, textWrap: 'pretty' }}>
              Skip today and retention drops to <span style={{ color: c.again, fontFamily: T_MONO }}>78%</span> across the active set. Wed's load grows to <span style={{ color: c.ink, fontFamily: T_MONO }}>99</span>.
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '4px 16px 12px', flexShrink: 0 }}>
        <button style={primaryCTA(c)}>
          <span>Start review</span>
          <span style={{ fontFamily: T_MONO, fontSize: 11, opacity: 0.7, letterSpacing: 0.4 }}>{TODAY.totalDue - TODAY.goal.done}</span>
        </button>
      </div>
      <TabBar active="today" c={c} />
    </div>
  );
}

function QSeg({ label, val, color, c }) {
  return (
    <div style={{ background: c.bgLift, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div style={{ fontFamily: T_MONO, fontSize: 9.5, letterSpacing: 1, color: c.ink3, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontFamily: T_MONO, fontSize: 18, color, fontVariantNumeric: 'tabular-nums', fontWeight: 500, letterSpacing: -0.5 }}>{val}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// EMPTY · STREAK-DANGER · FIRST-RUN states
// ─────────────────────────────────────────────────────────────
function TodayCaughtUp() {
  const c = TE;
  return (
    <div style={containerStyle(c, false)}>
      <div style={{ height: 54, flexShrink: 0 }} />
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px 0', flexShrink: 0,
      }}>
        <div style={{ lineHeight: 1.15 }}>
          <div style={{ fontSize: 13, color: c.ink3, fontFamily: T_UI, fontWeight: 500 }}>Good evening</div>
          <div style={{ fontSize: 13, color: c.ink2, fontFamily: T_UI, marginTop: 2 }}>{TODAY.weekday}, {TODAY.date}</div>
        </div>
        <StreakChip days={TODAY.streak} c={c} />
      </div>

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '0 36px',
        textAlign: 'center',
      }}>
        {/* simple amber line illustration: lamp glow */}
        <div style={{
          width: 84, height: 84, marginBottom: 28, position: 'relative',
        }}>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 42,
            background: `radial-gradient(circle, ${c.amberDim} 0%, transparent 70%)`,
          }} />
          <div style={{
            position: 'absolute', left: '50%', top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 6, height: 6, borderRadius: 3, background: c.amber,
            boxShadow: `0 0 12px ${c.amber}`,
          }} />
        </div>
        <div style={{
          fontFamily: T_SERIF, fontSize: 28, lineHeight: 1.2,
          fontWeight: 400, letterSpacing: -0.6, color: c.ink, marginBottom: 12,
          textWrap: 'pretty',
        }}>Nothing due. See you tomorrow.</div>
        <div style={{ fontSize: 14, color: c.ink2, lineHeight: 1.55, maxWidth: 280, textWrap: 'pretty' }}>
          Next reviews unlock in <span style={{ fontFamily: T_MONO, color: c.ink }}>5h 12m</span>. You could browse decks or add new cards.
        </div>
      </div>

      <div style={{ padding: '4px 16px 18px', flexShrink: 0, display: 'flex', gap: 8 }}>
        <button style={{
          flex: 1, height: 52, background: 'transparent', color: c.ink,
          border: `1px solid ${c.hairStrong}`, borderRadius: 12,
          fontSize: 14.5, fontWeight: 500, fontFamily: T_UI, cursor: 'pointer',
        }}>Browse decks</button>
        <button style={{
          flex: 1, height: 52, background: 'transparent', color: c.ink,
          border: `1px solid ${c.hairStrong}`, borderRadius: 12,
          fontSize: 14.5, fontWeight: 500, fontFamily: T_UI, cursor: 'pointer',
        }}>Add cards</button>
      </div>
      <TabBar active="today" c={c} />
    </div>
  );
}

function TodayStreakDanger() {
  const c = TE;
  return (
    <div style={containerStyle(c, false)}>
      <div style={{ height: 54, flexShrink: 0 }} />

      {/* Top bar with streak-at-risk treatment */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px 0', flexShrink: 0,
      }}>
        <div style={{ lineHeight: 1.15 }}>
          <div style={{ fontSize: 13, color: c.ink3, fontFamily: T_UI, fontWeight: 500 }}>Late evening</div>
          <div style={{ fontSize: 13, color: c.ink2, fontFamily: T_UI, marginTop: 2 }}>{TODAY.weekday}, {TODAY.date}</div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 999,
          border: `1px solid ${c.again}55`,
          background: c.againBg,
          fontFamily: T_MONO, fontSize: 11.5, color: c.again,
          fontVariantNumeric: 'tabular-nums', letterSpacing: 0.2,
        }}>
          <svg width="11" height="13" viewBox="0 0 11 13" fill={c.again}>
            <path d="M5.5 0C6 2 8 3 8 5.5C8 6.5 7.5 7 7 7C7 6 6 5 5.5 4.5C5 6 3 7 3 9C3 10.5 4 12 5.5 12C7 12 9 10.5 9 8.5C9 5 7 3 5.5 0Z"/>
          </svg>
          {TODAY.streak} days · 2h left
        </div>
      </div>

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '0 24px',
      }}>
        <div style={{
          fontFamily: T_MONO, fontSize: 10.5, letterSpacing: 1.4,
          color: c.again, textTransform: 'uppercase', marginBottom: 10,
        }}>still due tonight</div>
        <div style={{
          fontFamily: T_SERIF, fontSize: 120, lineHeight: 0.92,
          fontWeight: 400, letterSpacing: -5, color: c.ink,
          fontVariantNumeric: 'tabular-nums', marginBottom: 16,
        }}>{TODAY.totalDue - TODAY.goal.done}</div>
        <div style={{
          fontSize: 14.5, color: c.ink2, lineHeight: 1.55, marginBottom: 14, textWrap: 'pretty',
          maxWidth: 320,
        }}>
          About <span style={{ color: c.ink, fontFamily: T_MONO }}>{TODAY.estimatedMin - 6}m</span>. You can study just <span style={{ color: c.ink, fontFamily: T_MONO }}>5 cards</span> to keep your streak.
        </div>
      </div>

      <div style={{ padding: '4px 16px 12px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button style={primaryCTA(c)}>
          <span>Start review</span>
          <span style={{ fontFamily: T_MONO, fontSize: 11, opacity: 0.7, letterSpacing: 0.4 }}>35</span>
        </button>
        <button style={{
          width: '100%', height: 44, background: 'transparent', color: c.ink2,
          border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 500,
          fontFamily: T_UI, cursor: 'pointer', letterSpacing: -0.1,
        }}>Just 5 to save the streak</button>
      </div>
      <TabBar active="today" c={c} />
    </div>
  );
}

function TodayFirstRun() {
  const c = TE;
  return (
    <div style={containerStyle(c, false)}>
      <div style={{ height: 54, flexShrink: 0 }} />
      <div style={{
        padding: '20px 24px 0', flexShrink: 0,
      }}>
        <div style={{ fontSize: 13, color: c.ink3, fontFamily: T_UI, fontWeight: 500 }}>Welcome to Ernie</div>
      </div>

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '0 28px',
      }}>
        <div style={{
          fontFamily: T_SERIF, fontSize: 34, lineHeight: 1.15,
          fontWeight: 400, letterSpacing: -0.8, color: c.ink, marginBottom: 12,
          textWrap: 'pretty',
        }}>Start where it matters.</div>
        <div style={{ fontSize: 14.5, color: c.ink2, lineHeight: 1.55, marginBottom: 28, textWrap: 'pretty', maxWidth: 320 }}>
          Ernie remembers what you've reviewed and schedules the next visit. Start with a deck — yours or a starter.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <FirstRunCard
            c={c}
            title="Create a deck"
            sub="Build your own cards from scratch"
            icon={(stroke) => <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect x="4" y="4" width="14" height="14" rx="2" stroke={stroke} strokeWidth="1.5"/>
              <path d="M11 8v6M8 11h6" stroke={stroke} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>}
          />
          <FirstRunCard
            c={c}
            title="Import from Anki"
            sub="Drag a .apkg file or pick from Files"
            icon={(stroke) => <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M11 4v9M7 9l4 4 4-4M4 17h14" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>}
          />
          <FirstRunCard
            c={c}
            title="Browse starter decks"
            sub="NMAT · NLE · Bar · Spanish A1–C1 · Kanji"
            icon={(stroke) => <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M4 5C4 4 5 3 6 3h10c1 0 2 1 2 2v12c0 1-1 2-2 2H6c-1 0-2-1-2-2V5z" stroke={stroke} strokeWidth="1.5"/>
              <path d="M7 7h8M7 11h8M7 15h5" stroke={stroke} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>}
          />
        </div>
      </div>

      <div style={{ padding: '16px 24px 24px', flexShrink: 0, textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: c.ink3, fontFamily: T_UI, lineHeight: 1.5 }}>
          14-day trial · No account, no subscription
        </div>
      </div>
      <TabBar active="today" c={c} />
    </div>
  );
}

function FirstRunCard({ title, sub, icon, c }) {
  return (
    <button style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '16px 16px', background: c.bgLift,
      border: `1px solid ${c.hair}`, borderRadius: 12,
      cursor: 'pointer', textAlign: 'left', fontFamily: T_UI,
      transition: 'border-color .15s, background .15s',
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 9,
        background: c.amberDim, color: c.amber,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>{icon(c.amber)}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: c.ink, letterSpacing: -0.1, marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 12.5, color: c.ink2, lineHeight: 1.4 }}>{sub}</div>
      </div>
      <svg width="10" height="14" viewBox="0 0 10 14" fill="none" style={{ flexShrink: 0 }}>
        <path d="M2 1l6 6-6 6" stroke={c.ink3} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}

Object.assign(window, {
  TodayV1, TodayV2, TodayV3,
  TodayCaughtUp, TodayStreakDanger, TodayFirstRun,
  TabBar, GoalRing,
  TODAY, TE, T_UI, T_SERIF, T_MONO,
});
