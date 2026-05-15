// review.jsx — Three interactive review-session prototypes for Ernie.
// V1 Index Card · V2 Scholar · V3 Thumb Deck

// ─────────────────────────────────────────────────────────────
// Shared palette + helpers
// ─────────────────────────────────────────────────────────────
const E = {
  // dark
  bg:        '#1A1410',
  bgLift:    '#221A14',    // card surface
  bgInk:     '#150F0B',    // inset / well
  hair:      'rgba(240,232,221,0.08)',
  hairStrong:'rgba(240,232,221,0.14)',
  ink:       '#F0E8DD',
  ink2:      'rgba(240,232,221,0.62)',
  ink3:      'rgba(240,232,221,0.38)',
  amber:     '#D4A574',
  amberDim:  'rgba(212,165,116,0.16)',
  // rating colors
  again:     '#B86349',   // terracotta
  againBg:   'rgba(184,99,73,0.14)',
  hard:      '#9C8E7B',   // warm gray
  hardBg:    'rgba(156,142,123,0.14)',
  good:      '#94A47A',   // sage
  goodBg:    'rgba(148,164,122,0.14)',
  easy:      '#D4A574',   // amber
  easyBg:    'rgba(212,165,116,0.16)',
};

const FONT_UI = '"Inter", -apple-system, system-ui, sans-serif';
const FONT_SERIF = '"Fraunces", "Source Serif Pro", Georgia, serif';
const FONT_MONO = '"IBM Plex Mono", "Geist Mono", ui-monospace, Menlo, monospace';

// Sample queue — realistic-feeling medical-board cards interleaved with one
// language card to show the system handles different note types.
const DECK = [
  {
    id: 1, type: 'basic', deck: 'Pharm · Cardio',
    front: 'What is the mechanism of action of β-blockers in hypertension?',
    back: 'Competitive antagonism at β₁-adrenergic receptors → ↓ cardiac output, ↓ renin release, ↓ central sympathetic outflow. Net effect: ↓ HR, ↓ contractility, ↓ TPR over time.',
    tags: ['cardiology', 'antihypertensive'],
    state: { R: 0.92, S: 4.2, D: 6.1, reps: 3, lapses: 0, lastSeen: '3d ago' },
    intervals: { again: '<1m', hard: '2d', good: '8d', easy: '21d' },
    intervalsLong: { again: '<1 min', hard: '2 days', good: '8 days', easy: '21 days' },
  },
  {
    id: 2, type: 'cloze', deck: 'Pharm · Cardio',
    front: 'The {{c1::···········}} valve prevents backflow from the left ventricle into the left atrium.',
    back:  'The {{c1::mitral}} valve prevents backflow from the left ventricle into the left atrium.',
    answer: 'mitral',
    tags: ['anatomy', 'valves'],
    state: { R: 0.87, S: 1.8, D: 7.4, reps: 2, lapses: 1, lastSeen: '1d ago' },
    intervals: { again: '<1m', hard: '1d', good: '4d', easy: '11d' },
    intervalsLong: { again: '<1 min', hard: '1 day', good: '4 days', easy: '11 days' },
  },
  {
    id: 3, type: 'basic', deck: 'Pharm · Cardio',
    front: 'First-line treatment for stable angina pectoris?',
    back: 'Sublingual nitroglycerin for acute episodes. Long-term: β-blocker (preferred) or non-DHP CCB. Add long-acting nitrate or ranolazine if symptomatic on monotherapy.',
    tags: ['cardiology'],
    state: { R: 0.78, S: 0.9, D: 8.2, reps: 1, lapses: 2, lastSeen: '14h ago' },
    intervals: { again: '<1m', hard: '10m', good: '1d', easy: '4d' },
    intervalsLong: { again: '<1 min', hard: '10 min', good: '1 day', easy: '4 days' },
  },
];

const QUEUE = { total: 47, done: 23, newC: 4, learn: 6, review: 14 };

// ─────────────────────────────────────────────────────────────
// Common: top bar, progress strip, card flip, queue chip
// ─────────────────────────────────────────────────────────────
function ChevLeft({ c = E.ink2, size = 14 }) {
  return <svg width={size} height={size * 1.4} viewBox="0 0 10 14" fill="none">
    <path d="M8 1L2 7l6 6" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>;
}
function IconDots({ c = E.ink2 }) {
  return <svg width="18" height="4" viewBox="0 0 18 4" fill={c}>
    <circle cx="2" cy="2" r="1.6"/><circle cx="9" cy="2" r="1.6"/><circle cx="16" cy="2" r="1.6"/>
  </svg>;
}
function IconFlag({ c = E.ink3 }) {
  return <svg width="13" height="14" viewBox="0 0 13 14" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 13V1.5M2 2h8l-1.5 3L10 8H2"/>
  </svg>;
}
function IconUndo({ c = E.ink3 }) {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 7a5 5 0 0 1 9-3L13 2M11 4L8 4M11 4L11 1"/>
  </svg>;
}
function IconSpeaker({ c = E.ink3 }) {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 5h2l3-2.5v9L4 9H2V5z M9 4.5c1 .8 1 3.2 0 4M11 3c1.8 1.5 1.8 5.5 0 7"/>
  </svg>;
}
function IconEdit({ c = E.ink3 }) {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12L4 11.5L11 4.5L9.5 3L2.5 10L2 12z M8.5 4L10 5.5"/>
  </svg>;
}

// Tiny FSRS-ish forgetting curve sparkline. Renders R(t) ≈ exp(-t/S) for
// the next ~3× stability days, with a tick marker at the proposed next
// interval. Pure SVG, no animation; just signals algorithmic depth.
function RetentionCurve({ stability = 4.2, mark, color = E.amber, w = 260, h = 44 }) {
  const days = Math.max(stability * 3.2, 6);
  const pts = [];
  const N = 40;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * days;
    const r = Math.exp(-t / stability);
    pts.push([(i / N) * w, h - 2 - r * (h - 6)]);
  }
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const markX = mark != null ? Math.min(w - 1, (mark / days) * w) : null;
  const markY = mark != null ? h - 2 - Math.exp(-mark / stability) * (h - 6) : null;
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <line x1="0" y1={h - 2} x2={w} y2={h - 2} stroke={E.hair} />
      <line x1="0" y1={h - 2 - 0.9 * (h - 6)} x2={w} y2={h - 2 - 0.9 * (h - 6)} stroke={E.hair} strokeDasharray="2 3" />
      <path d={d} fill="none" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
      {markX != null && (
        <>
          <line x1={markX} y1={0} x2={markX} y2={h - 2} stroke={color} strokeWidth="1" strokeDasharray="2 3" opacity="0.5" />
          <circle cx={markX} cy={markY} r="3" fill={E.bg} stroke={color} strokeWidth="1.4" />
        </>
      )}
    </svg>
  );
}

// Hook: per-frame review session state — card index, revealed flag,
// undo stack, last action toast.
function useSession() {
  const [idx, setIdx] = React.useState(0);
  const [revealed, setRevealed] = React.useState(false);
  const [last, setLast] = React.useState(null);
  const card = DECK[idx % DECK.length];
  const reveal = () => setRevealed(true);
  const rate = (key) => {
    setLast({ rating: key, interval: card.intervalsLong[key] });
    setRevealed(false);
    setIdx((i) => (i + 1) % DECK.length);
  };
  const restart = () => { setIdx(0); setRevealed(false); setLast(null); };
  return { idx, card, revealed, reveal, rate, last, restart };
}

// Render cloze content. `mask` true → show ··· in place of c1.
function ClozeText({ text, mask, accent = E.amber }) {
  // text uses {{c1::word}} markers; we tokenize on those.
  const parts = [];
  let rest = text;
  let m;
  const re = /\{\{c1::([^}]+)\}\}/;
  while ((m = re.exec(rest))) {
    if (m.index) parts.push(<span key={parts.length}>{rest.slice(0, m.index)}</span>);
    parts.push(
      mask
        ? <span key={parts.length} style={{ display: 'inline-block', borderBottom: `1.5px dashed ${accent}`, color: 'transparent', minWidth: 80, padding: '0 4px' }}>{m[1]}</span>
        : <span key={parts.length} style={{ color: accent, borderBottom: `1.5px solid ${E.amberDim}`, padding: '0 1px' }}>{m[1]}</span>
    );
    rest = rest.slice(m.index + m[0].length);
  }
  parts.push(<span key={parts.length}>{rest}</span>);
  return <>{parts}</>;
}

// ─────────────────────────────────────────────────────────────
// V1 — INDEX CARD (the calm baseline)
// ─────────────────────────────────────────────────────────────
function ReviewV1({ dark = true }) {
  const s = useSession();
  const { card, revealed } = s;
  const c = dark ? E : null; // light mode handled separately; default dark.
  return (
    <div style={{
      width: '100%', height: '100%', background: c.bg, color: c.ink,
      fontFamily: FONT_UI, display: 'flex', flexDirection: 'column',
      position: 'relative',
    }}>
      {/* status bar slot */}
      <div style={{ height: 54, flexShrink: 0 }} />

      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '8px 16px 0',
        gap: 12, flexShrink: 0,
      }}>
        <button style={iconBtn}><ChevLeft c={c.ink2} /></button>
        <div style={{ flex: 1, textAlign: 'center', lineHeight: 1.15 }}>
          <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: -0.1 }}>{card.deck}</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: c.ink3, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
            {QUEUE.done + s.idx} <span style={{ color: c.ink3 }}>/</span> {QUEUE.total}
          </div>
        </div>
        <button style={iconBtn}><IconDots c={c.ink2} /></button>
      </div>

      {/* Progress strip */}
      <div style={{ padding: '14px 20px 0', flexShrink: 0 }}>
        <div style={{ height: 2, borderRadius: 1, background: c.hair, overflow: 'hidden' }}>
          <div style={{ width: `${((QUEUE.done + s.idx) / QUEUE.total) * 100}%`, height: '100%', background: c.amber, transition: 'width .35s ease' }} />
        </div>
      </div>

      {/* Card */}
      <div style={{ flex: 1, padding: '20px 16px 12px', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div
          onClick={!revealed ? s.reveal : undefined}
          style={{
            flex: 1, background: c.bgLift, border: `1px solid ${c.hair}`,
            borderRadius: 12, padding: '28px 24px', display: 'flex',
            flexDirection: 'column', cursor: !revealed ? 'pointer' : 'default',
            position: 'relative', overflow: 'hidden',
            transition: 'background .25s',
          }}
        >
          {/* card type chip */}
          <div style={{
            fontFamily: FONT_MONO, fontSize: 10.5, letterSpacing: 1.2,
            color: c.ink3, textTransform: 'uppercase', marginBottom: 18,
          }}>
            {card.type === 'cloze' ? 'Cloze · c1' : 'Basic'}
          </div>

          {/* Front text */}
          <div style={{
            fontFamily: FONT_SERIF, fontSize: 22, lineHeight: 1.42,
            color: c.ink, fontWeight: 400, letterSpacing: -0.1,
            textWrap: 'pretty',
          }}>
            {card.type === 'cloze'
              ? <ClozeText text={card.front} mask={!revealed} accent={c.amber} />
              : card.front}
          </div>

          {revealed && (
            <>
              <div style={{ height: 1, background: c.hair, margin: '22px -4px 20px' }} />
              <div style={{
                fontFamily: card.type === 'cloze' ? FONT_SERIF : FONT_SERIF,
                fontSize: 17, lineHeight: 1.55, color: c.ink2,
                textWrap: 'pretty',
              }}>
                {card.type === 'cloze'
                  ? <span style={{ fontSize: 22, color: c.ink }}><ClozeText text={card.back} mask={false} accent={c.amber} /></span>
                  : card.back}
              </div>
            </>
          )}

          {/* Bottom-right meta inside card */}
          <div style={{ flex: 1 }} />
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginTop: 16,
            fontSize: 11, color: c.ink3, fontFamily: FONT_MONO,
            letterSpacing: 0.2,
          }}>
            <span>seen {card.state.lastSeen}</span>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button style={miniIconBtn}><IconSpeaker c={c.ink3} /></button>
              <button style={miniIconBtn}><IconFlag c={c.ink3} /></button>
              <button style={miniIconBtn}><IconEdit c={c.ink3} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Thumb zone */}
      <div style={{ padding: '4px 16px 28px', flexShrink: 0 }}>
        {!revealed ? (
          <button
            onClick={s.reveal}
            style={{
              width: '100%', height: 56, background: 'transparent',
              border: `1px solid ${c.hairStrong}`, color: c.ink,
              borderRadius: 12, fontSize: 16, fontWeight: 500, fontFamily: FONT_UI,
              letterSpacing: -0.1, cursor: 'pointer', transition: 'background .2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
          >
            Show answer
            <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: c.ink3, marginLeft: 6, letterSpacing: 0.4 }}>SPACE</span>
          </button>
        ) : (
          <V1RatingRow card={card} onRate={s.rate} c={c} />
        )}
      </div>
    </div>
  );
}

function V1RatingRow({ card, onRate, c }) {
  const buttons = [
    { k: 'again', label: 'Again', color: c.again, bg: c.againBg },
    { k: 'hard',  label: 'Hard',  color: c.hard,  bg: c.hardBg },
    { k: 'good',  label: 'Good',  color: c.good,  bg: c.goodBg },
    { k: 'easy',  label: 'Easy',  color: c.easy,  bg: c.easyBg },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
      {buttons.map((b) => (
        <button
          key={b.k}
          onClick={() => onRate(b.k)}
          style={{
            height: 68, background: b.bg, border: `1px solid ${b.color}33`,
            borderRadius: 11, color: b.color, cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 4, padding: 0,
            fontFamily: FONT_UI, transition: 'background .15s, transform .1s',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = '')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = '')}
        >
          <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: 0.1 }}>{b.label}</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 12, opacity: 0.82, fontVariantNumeric: 'tabular-nums' }}>{card.intervals[b.k]}</span>
        </button>
      ))}
    </div>
  );
}

const iconBtn = {
  width: 36, height: 36, borderRadius: 18, background: 'transparent',
  border: 'none', cursor: 'pointer', display: 'flex',
  alignItems: 'center', justifyContent: 'center', padding: 0,
  color: E.ink2,
};
const miniIconBtn = {
  width: 24, height: 24, borderRadius: 6, background: 'transparent',
  border: 'none', cursor: 'pointer', display: 'flex',
  alignItems: 'center', justifyContent: 'center', padding: 0,
};

// ─────────────────────────────────────────────────────────────
// V2 — SCHOLAR (algorithmic-forward, memory science visible)
// ─────────────────────────────────────────────────────────────
function ReviewV2() {
  const s = useSession();
  const { card, revealed } = s;
  const c = E;
  // Inline toggle. Persists for the session — when you collapse it on one
  // card you don't want it springing back on the next reveal.
  const [showCurve, setShowCurve] = React.useState(true);
  const intervalDays = revealed ? parseDays(card.intervalsLong.good) : null;
  return (
    <div style={{
      width: '100%', height: '100%', background: c.bg, color: c.ink,
      fontFamily: FONT_UI, display: 'flex', flexDirection: 'column',
      position: 'relative',
    }}>
      <div style={{ height: 54, flexShrink: 0 }} />

      {/* Top: deck + queue split (new / learn / review) */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px 0', gap: 12, flexShrink: 0 }}>
        <button style={iconBtn}><ChevLeft c={c.ink2} /></button>
        <div style={{ flex: 1, textAlign: 'center', lineHeight: 1.15 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{card.deck}</div>
          <div style={{
            fontFamily: FONT_MONO, fontSize: 10.5, color: c.ink3,
            marginTop: 3, fontVariantNumeric: 'tabular-nums',
            display: 'flex', justifyContent: 'center', gap: 9,
          }}>
            <span><span style={{ color: c.amber }}>●</span> {QUEUE.newC}</span>
            <span><span style={{ color: c.again }}>●</span> {QUEUE.learn}</span>
            <span><span style={{ color: c.good }}>●</span> {QUEUE.review}</span>
          </div>
        </div>
        <button style={iconBtn}><IconDots c={c.ink2} /></button>
      </div>

      {/* Memory state strip — the differentiator */}
      <div style={{
        margin: '14px 16px 0', padding: '10px 14px',
        background: c.bgInk, borderRadius: 9,
        display: 'flex', justifyContent: 'space-between',
        fontFamily: FONT_MONO, fontSize: 11,
        fontVariantNumeric: 'tabular-nums',
      }}>
        <MStat label="R" val={Math.round(card.state.R * 100) + '%'} hint="retention" c={c} accent={c.good} />
        <MStat label="S" val={card.state.S + 'd'} hint="stability" c={c} accent={c.amber} />
        <MStat label="D" val={card.state.D.toFixed(1)} hint="difficulty" c={c} accent={c.hard} />
        <MStat label="reps" val={card.state.reps} hint="seen" c={c} />
        <MStat label="lapses" val={card.state.lapses} hint="" c={c} accent={card.state.lapses ? c.again : null} />
      </div>

      {/* Card */}
      <div style={{ flex: 1, padding: '14px 16px 12px', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div
          onClick={!revealed ? s.reveal : undefined}
          style={{
            flex: 1, background: c.bgLift, border: `1px solid ${c.hair}`,
            borderRadius: 12, padding: '24px 22px',
            cursor: !revealed ? 'pointer' : 'default',
            display: 'flex', flexDirection: 'column',
          }}
        >
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontFamily: FONT_MONO, fontSize: 10.5, letterSpacing: 1.2,
            color: c.ink3, textTransform: 'uppercase', marginBottom: 16,
          }}>
            <span>{card.type === 'cloze' ? 'Cloze · c1' : 'Basic'}</span>
            <span>seen {card.state.lastSeen}</span>
          </div>

          <div style={{
            fontFamily: FONT_SERIF, fontSize: 21, lineHeight: 1.4,
            color: c.ink, letterSpacing: -0.1, textWrap: 'pretty',
          }}>
            {card.type === 'cloze'
              ? <ClozeText text={card.front} mask={!revealed} accent={c.amber} />
              : card.front}
          </div>

          {revealed && (
            <>
              <div style={{ height: 1, background: c.hair, margin: '20px -4px 18px' }} />
              <div style={{
                fontFamily: FONT_SERIF, fontSize: 16.5, lineHeight: 1.55,
                color: c.ink2, textWrap: 'pretty',
              }}>
                {card.type === 'cloze'
                  ? <span style={{ fontSize: 21, color: c.ink }}><ClozeText text={card.back} mask={false} accent={c.amber} /></span>
                  : card.back}
              </div>
            </>
          )}

          <div style={{ flex: 1, minHeight: 8 }} />

          {/* Forgetting curve appears on reveal — toggleable inline */}
          {revealed && (
            <div style={{ marginTop: 12 }}>
              <button
                onClick={(e) => { e.stopPropagation(); setShowCurve((v) => !v); }}
                style={{
                  width: '100%', background: 'transparent', border: 'none', padding: 0,
                  cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', fontFamily: FONT_MONO, fontSize: 9.5,
                  letterSpacing: 1.2, color: c.ink3, textTransform: 'uppercase',
                  marginBottom: showCurve ? 4 : 0,
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  retention curve
                  <svg width="8" height="6" viewBox="0 0 8 6" fill="none"
                    style={{ transform: showCurve ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform .2s' }}>
                    <path d="M1 1.5L4 4.5L7 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span>next: {card.intervalsLong.good}</span>
              </button>
              {showCurve && (
                <RetentionCurve stability={card.state.S} mark={intervalDays} color={c.amber} w={326} h={36} />
              )}
            </div>
          )}

          {/* Tag row */}
          <div style={{
            display: 'flex', gap: 6, marginTop: revealed ? 12 : 16,
            flexWrap: 'wrap',
          }}>
            {card.tags.map((t) => (
              <span key={t} style={{
                fontFamily: FONT_MONO, fontSize: 10.5, letterSpacing: 0.2,
                color: c.ink3, padding: '3px 8px',
                border: `1px solid ${c.hair}`, borderRadius: 4,
              }}>#{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Thumb zone */}
      <div style={{ padding: '4px 16px 28px', flexShrink: 0 }}>
        {!revealed ? (
          <button onClick={s.reveal} style={{
            width: '100%', height: 52, background: 'transparent',
            border: `1px solid ${c.hairStrong}`, color: c.ink,
            borderRadius: 11, fontSize: 15.5, fontWeight: 500,
            fontFamily: FONT_UI, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}>
            Reveal answer
            <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: c.ink3, letterSpacing: 0.4 }}>SPACE</span>
          </button>
        ) : (
          <V2RatingRow card={card} onRate={s.rate} c={c} />
        )}
      </div>
    </div>
  );
}

function MStat({ label, val, hint, c, accent }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, minWidth: 36 }}>
      <div style={{ fontSize: 9, color: c.ink3, letterSpacing: 0.6, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 13.5, color: accent || c.ink, fontWeight: 500 }}>{val}</div>
    </div>
  );
}

function V2RatingRow({ card, onRate, c }) {
  // Interval-forward: monospace interval is the dominant element.
  const buttons = [
    { k: 'again', label: 'Again', color: c.again, bg: c.againBg, delta: '→ relearn' },
    { k: 'hard',  label: 'Hard',  color: c.hard,  bg: c.hardBg,  delta: 'S→' + (card.state.S * 1.15).toFixed(1) + 'd' },
    { k: 'good',  label: 'Good',  color: c.good,  bg: c.goodBg,  delta: 'S→' + (card.state.S * 2.4).toFixed(1) + 'd' },
    { k: 'easy',  label: 'Easy',  color: c.easy,  bg: c.easyBg,  delta: 'S→' + (card.state.S * 4.1).toFixed(1) + 'd' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5 }}>
      {buttons.map((b) => (
        <button
          key={b.k}
          onClick={() => onRate(b.k)}
          style={{
            height: 78, background: b.bg, border: `1px solid ${b.color}33`,
            borderRadius: 11, color: b.color, cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '6px 0 7px',
            fontFamily: FONT_UI, gap: 2,
          }}
        >
          <span style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase', opacity: 0.85 }}>{b.label}</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 17, fontWeight: 500, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>{card.intervals[b.k]}</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 9.5, opacity: 0.55, letterSpacing: 0.2 }}>{b.delta}</span>
        </button>
      ))}
    </div>
  );
}

function parseDays(s) {
  if (s.indexOf('min') >= 0) return parseFloat(s) / (60 * 24);
  if (s.indexOf('hour') >= 0 || s.indexOf('h ') === 1 || s.indexOf('h ') === 2) return parseFloat(s) / 24;
  return parseFloat(s);
}

// ─────────────────────────────────────────────────────────────
// V3 — THUMB DECK (one-handed, interval-first, swipe-to-rate)
// ─────────────────────────────────────────────────────────────
function ReviewV3() {
  const s = useSession();
  const { card, revealed } = s;
  const c = E;

  // Swipe state — the card tracks the drag and biases which rating
  // gets armed. Release commits if past threshold, else snaps back.
  const [drag, setDrag] = React.useState({ x: 0, y: 0 });
  const startRef = React.useRef(null);
  const onPointerDown = (e) => {
    if (!revealed) return;
    startRef.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!startRef.current) return;
    setDrag({ x: e.clientX - startRef.current.x, y: e.clientY - startRef.current.y });
  };
  const onPointerUp = () => {
    if (!startRef.current) { setDrag({ x: 0, y: 0 }); return; }
    startRef.current = null;
    const { x, y } = drag;
    const T = 80;
    let key = null;
    if (Math.abs(x) > Math.abs(y)) {
      if (x < -T) key = 'again';
      else if (x > T) key = 'easy';
    } else {
      if (y < -T) key = 'good';
      else if (y > T) key = 'hard';
    }
    if (key) { s.rate(key); setDrag({ x: 0, y: 0 }); }
    else setDrag({ x: 0, y: 0 });
  };

  // Which rating is armed by the current drag?
  const armed = (() => {
    if (!revealed) return null;
    const { x, y } = drag;
    const T = 40;
    if (Math.abs(x) > Math.abs(y)) {
      if (x < -T) return 'again';
      if (x > T) return 'easy';
    } else {
      if (y < -T) return 'good';
      if (y > T) return 'hard';
    }
    return null;
  })();

  return (
    <div style={{
      width: '100%', height: '100%', background: c.bg, color: c.ink,
      fontFamily: FONT_UI, display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ height: 54, flexShrink: 0 }} />

      {/* Minimal top: only counter + close, big and centered for one-handed glance */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px 0', flexShrink: 0 }}>
        <button style={iconBtn}><ChevLeft c={c.ink2} /></button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{
            fontFamily: FONT_MONO, fontSize: 13, color: c.ink2,
            fontVariantNumeric: 'tabular-nums', letterSpacing: 0.4,
          }}>
            {QUEUE.done + s.idx}<span style={{ color: c.ink3 }}>/{QUEUE.total}</span>
          </div>
        </div>
        <button style={iconBtn}><IconDots c={c.ink2} /></button>
      </div>

      {/* Progress strip + queue-balance dots */}
      <div style={{ padding: '12px 24px 0', flexShrink: 0 }}>
        <div style={{ height: 2, borderRadius: 1, background: c.hair, overflow: 'hidden' }}>
          <div style={{ width: `${((QUEUE.done + s.idx) / QUEUE.total) * 100}%`, height: '100%', background: c.amber }} />
        </div>
      </div>

      {/* Card — smaller area to leave thumb-friendly bottom for ratings */}
      <div style={{
        padding: '18px 20px 8px', display: 'flex', flexDirection: 'column',
        minHeight: 0, position: 'relative', height: 350, flexShrink: 0,
      }}>
        {/* Swipe direction hints (visible when revealed) */}
        {revealed && (
          <>
            <DirHint side="left"   label="Again" color={c.again} armed={armed === 'again'} />
            <DirHint side="right"  label="Easy"  color={c.easy}  armed={armed === 'easy'} />
            <DirHint side="top"    label="Good"  color={c.good}  armed={armed === 'good'} />
            <DirHint side="bottom" label="Hard"  color={c.hard}  armed={armed === 'hard'} />
          </>
        )}

        <div
          onClick={!revealed ? s.reveal : undefined}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{
            flex: 1, background: c.bgLift,
            border: `1px solid ${armed ? (armed === 'again' ? c.again : armed === 'hard' ? c.hard : armed === 'good' ? c.good : c.easy) + '66' : c.hair}`,
            borderRadius: 14, padding: '24px 22px',
            cursor: !revealed ? 'pointer' : 'grab',
            display: 'flex', flexDirection: 'column',
            transform: revealed ? `translate(${drag.x * 0.5}px, ${drag.y * 0.5}px) rotate(${drag.x * 0.03}deg)` : 'none',
            transition: startRef.current ? 'border-color .15s' : 'transform .25s cubic-bezier(.2,.7,.3,1), border-color .15s',
            touchAction: 'none',
            userSelect: 'none',
          }}
        >
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontFamily: FONT_MONO, fontSize: 10.5, letterSpacing: 1.2,
            color: c.ink3, textTransform: 'uppercase', marginBottom: 14,
          }}>
            <span>{card.type === 'cloze' ? 'Cloze' : 'Basic'}</span>
            <span>{card.deck}</span>
          </div>

          <div style={{
            fontFamily: FONT_SERIF, fontSize: 23, lineHeight: 1.38,
            color: c.ink, letterSpacing: -0.2, fontWeight: 400,
            textWrap: 'pretty',
          }}>
            {card.type === 'cloze'
              ? <ClozeText text={card.front} mask={!revealed} accent={c.amber} />
              : card.front}
          </div>

          {revealed && (
            <>
              <div style={{ height: 1, background: c.hair, margin: '18px -4px 16px' }} />
              <div style={{
                fontFamily: FONT_SERIF, fontSize: 16, lineHeight: 1.5,
                color: c.ink2, textWrap: 'pretty',
              }}>
                {card.type === 'cloze'
                  ? <span style={{ fontSize: 22, color: c.ink }}><ClozeText text={card.back} mask={false} accent={c.amber} /></span>
                  : card.back}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Thumb zone — interval-FIRST rating grid */}
      <div style={{ flex: 1, padding: '8px 16px 28px', flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        {!revealed ? (
          <button onClick={s.reveal} style={{
            width: '100%', height: 64, background: 'transparent',
            border: `1px solid ${c.hairStrong}`, color: c.ink,
            borderRadius: 14, fontSize: 17, fontWeight: 500,
            fontFamily: FONT_UI, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
          }}>
            Tap to reveal
          </button>
        ) : (
          <>
            <div style={{
              textAlign: 'center', fontFamily: FONT_MONO, fontSize: 10,
              letterSpacing: 1.4, color: c.ink3, marginBottom: 10,
              textTransform: 'uppercase',
            }}>swipe or tap</div>
            <V3RatingGrid card={card} onRate={s.rate} armed={armed} c={c} />
          </>
        )}
      </div>
    </div>
  );
}

function DirHint({ side, label, color, armed }) {
  const pos = {
    left:   { left: -2, top: '50%', transform: 'translateY(-50%)', writingMode: 'vertical-rl', transform2: 'rotate(180deg)' },
    right:  { right: -2, top: '50%', transform: 'translateY(-50%)', writingMode: 'vertical-rl' },
    top:    { top: -2, left: '50%', transform: 'translateX(-50%)' },
    bottom: { bottom: -2, left: '50%', transform: 'translateX(-50%)' },
  }[side];
  return (
    <div style={{
      position: 'absolute', ...pos, zIndex: 1,
      fontFamily: FONT_MONO, fontSize: 10, letterSpacing: 1.4,
      textTransform: 'uppercase',
      color: armed ? color : E.ink3, opacity: armed ? 1 : 0.6,
      padding: side === 'left' || side === 'right' ? '6px 2px' : '2px 6px',
      transition: 'color .12s, opacity .12s',
      writingMode: pos.writingMode, textOrientation: 'mixed',
      transform: pos.transform + (pos.transform2 ? ' ' + pos.transform2 : ''),
    }}>{label}</div>
  );
}

function V3RatingGrid({ card, onRate, armed, c }) {
  const buttons = [
    { k: 'again', label: 'Again', color: c.again, bg: c.againBg, hint: '←' },
    { k: 'hard',  label: 'Hard',  color: c.hard,  bg: c.hardBg,  hint: '↓' },
    { k: 'good',  label: 'Good',  color: c.good,  bg: c.goodBg,  hint: '↑' },
    { k: 'easy',  label: 'Easy',  color: c.easy,  bg: c.easyBg,  hint: '→' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {buttons.map((b) => {
        const isArmed = armed === b.k;
        return (
          <button
            key={b.k}
            onClick={() => onRate(b.k)}
            style={{
              height: 70,
              background: isArmed ? b.color + '24' : b.bg,
              border: `1px solid ${isArmed ? b.color : b.color + '33'}`,
              borderRadius: 12, color: b.color, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 18px',
              fontFamily: FONT_UI, transition: 'background .12s, border-color .12s',
            }}
          >
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: 0.2, textTransform: 'uppercase', opacity: 0.85 }}>{b.label}</div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 10, opacity: 0.55, letterSpacing: 1, marginTop: 1 }}>{b.hint} swipe</div>
            </div>
            <div style={{
              fontFamily: FONT_MONO, fontSize: 22, fontWeight: 500,
              fontVariantNumeric: 'tabular-nums', letterSpacing: -0.5,
            }}>{card.intervals[b.k]}</div>
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Session complete state (used as a 4th artboard)
// ─────────────────────────────────────────────────────────────
function ReviewDone() {
  const c = E;
  return (
    <div style={{
      width: '100%', height: '100%', background: c.bg, color: c.ink,
      fontFamily: FONT_UI, display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ height: 54, flexShrink: 0 }} />
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px 0', flexShrink: 0 }}>
        <button style={iconBtn}><ChevLeft c={c.ink2} /></button>
        <div style={{ flex: 1 }} />
      </div>

      <div style={{ flex: 1, padding: '32px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{
          fontFamily: FONT_MONO, fontSize: 10.5, letterSpacing: 1.4,
          color: c.ink3, textTransform: 'uppercase', marginBottom: 14,
        }}>session complete · Pharm · Cardio</div>

        <div style={{
          fontFamily: FONT_SERIF, fontSize: 32, lineHeight: 1.2,
          color: c.ink, letterSpacing: -0.6, marginBottom: 8,
          fontWeight: 400,
        }}>Done for today.</div>
        <div style={{ fontSize: 15, color: c.ink2, lineHeight: 1.5, marginBottom: 32 }}>
          47 cards reviewed in 28 minutes. Next batch unlocks in 5h 12m.
        </div>

        {/* Stats grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1,
          background: c.hair, borderRadius: 11, overflow: 'hidden',
          border: `1px solid ${c.hair}`, marginBottom: 24,
        }}>
          <StatCell label="Again" val="3" color={c.again} c={c} />
          <StatCell label="Hard" val="8" color={c.hard} c={c} />
          <StatCell label="Good" val="29" color={c.good} c={c} />
          <StatCell label="Easy" val="7" color={c.easy} c={c} />
        </div>

        {/* Retention forecast */}
        <div style={{
          padding: '14px 16px', background: c.bgLift,
          border: `1px solid ${c.hair}`, borderRadius: 11,
          marginBottom: 16,
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontFamily: FONT_MONO, fontSize: 10.5, letterSpacing: 1.2,
            color: c.ink3, textTransform: 'uppercase', marginBottom: 6,
          }}>
            <span>retention · 30 days</span>
            <span style={{ color: c.amber }}>92%</span>
          </div>
          <RetentionCurve stability={8} mark={null} color={c.amber} w={306} h={42} />
        </div>

        <div style={{ fontSize: 13, color: c.ink3, textAlign: 'center', fontFamily: FONT_MONO, letterSpacing: 0.3 }}>
          streak · 47 days
        </div>
      </div>

      <div style={{ padding: '4px 16px 28px', flexShrink: 0 }}>
        <button style={{
          width: '100%', height: 52, background: c.amber, color: c.bg,
          border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 600,
          fontFamily: FONT_UI, cursor: 'pointer', letterSpacing: -0.1,
        }}>Back to Today</button>
      </div>
    </div>
  );
}

function StatCell({ label, val, color, c }) {
  return (
    <div style={{
      background: c.bg, padding: '16px 18px',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <div style={{
        fontSize: 11, color: c.ink3, letterSpacing: 0.8,
        textTransform: 'uppercase', fontWeight: 500,
      }}>{label}</div>
      <div style={{
        fontFamily: FONT_MONO, fontSize: 24, color: color,
        fontVariantNumeric: 'tabular-nums', fontWeight: 500, letterSpacing: -1,
      }}>{val}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// V1 Light mode variant
// ─────────────────────────────────────────────────────────────
function ReviewV1Light() {
  const s = useSession();
  const { card, revealed } = s;
  const c = {
    bg: '#F5EFE6', bgLift: '#FBF6EC', bgInk: '#EDE6D9',
    hair: 'rgba(60,40,20,0.10)', hairStrong: 'rgba(60,40,20,0.18)',
    ink: '#2A2218', ink2: 'rgba(42,34,24,0.65)', ink3: 'rgba(42,34,24,0.42)',
    amber: '#A87A3D', amberDim: 'rgba(168,122,61,0.16)',
    again: '#A85A42', againBg: 'rgba(168,90,66,0.10)',
    hard:  '#7B6F5E', hardBg:  'rgba(123,111,94,0.10)',
    good:  '#6F8556', goodBg:  'rgba(111,133,86,0.12)',
    easy:  '#A87A3D', easyBg:  'rgba(168,122,61,0.13)',
  };
  return (
    <div style={{
      width: '100%', height: '100%', background: c.bg, color: c.ink,
      fontFamily: FONT_UI, display: 'flex', flexDirection: 'column',
      position: 'relative',
      // subtle paper grain
      backgroundImage: `radial-gradient(circle at 30% 20%, rgba(168,122,61,0.025), transparent 60%),
        url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.4 0 0 0 0 0.3 0 0 0 0 0.15 0 0 0 0.02 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
    }}>
      <div style={{ height: 54, flexShrink: 0 }} />
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px 0', gap: 12, flexShrink: 0 }}>
        <button style={{ ...iconBtn, color: c.ink2 }}><ChevLeft c={c.ink2} /></button>
        <div style={{ flex: 1, textAlign: 'center', lineHeight: 1.15 }}>
          <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: -0.1, color: c.ink }}>{card.deck}</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: c.ink3, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
            {QUEUE.done + s.idx} / {QUEUE.total}
          </div>
        </div>
        <button style={{ ...iconBtn, color: c.ink2 }}><IconDots c={c.ink2} /></button>
      </div>

      <div style={{ padding: '14px 20px 0', flexShrink: 0 }}>
        <div style={{ height: 2, borderRadius: 1, background: c.hair, overflow: 'hidden' }}>
          <div style={{ width: `${((QUEUE.done + s.idx) / QUEUE.total) * 100}%`, height: '100%', background: c.amber }} />
        </div>
      </div>

      <div style={{ flex: 1, padding: '20px 16px 12px', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div
          onClick={!revealed ? s.reveal : undefined}
          style={{
            flex: 1, background: c.bgLift, border: `1px solid ${c.hair}`,
            borderRadius: 12, padding: '28px 24px', display: 'flex',
            flexDirection: 'column', cursor: !revealed ? 'pointer' : 'default',
          }}
        >
          <div style={{
            fontFamily: FONT_MONO, fontSize: 10.5, letterSpacing: 1.2,
            color: c.ink3, textTransform: 'uppercase', marginBottom: 18,
          }}>{card.type === 'cloze' ? 'Cloze · c1' : 'Basic'}</div>

          <div style={{
            fontFamily: FONT_SERIF, fontSize: 22, lineHeight: 1.42,
            color: c.ink, fontWeight: 400, letterSpacing: -0.1, textWrap: 'pretty',
          }}>
            {card.type === 'cloze'
              ? <ClozeText text={card.front} mask={!revealed} accent={c.amber} />
              : card.front}
          </div>

          {revealed && (
            <>
              <div style={{ height: 1, background: c.hair, margin: '22px -4px 20px' }} />
              <div style={{ fontFamily: FONT_SERIF, fontSize: 17, lineHeight: 1.55, color: c.ink2, textWrap: 'pretty' }}>
                {card.type === 'cloze'
                  ? <span style={{ fontSize: 22, color: c.ink }}><ClozeText text={card.back} mask={false} accent={c.amber} /></span>
                  : card.back}
              </div>
            </>
          )}

          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, fontSize: 11, color: c.ink3, fontFamily: FONT_MONO }}>
            <span>seen {card.state.lastSeen}</span>
            <div style={{ display: 'flex', gap: 12 }}>
              <button style={miniIconBtn}><IconSpeaker c={c.ink3} /></button>
              <button style={miniIconBtn}><IconFlag c={c.ink3} /></button>
              <button style={miniIconBtn}><IconEdit c={c.ink3} /></button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '4px 16px 28px', flexShrink: 0 }}>
        {!revealed ? (
          <button onClick={s.reveal} style={{
            width: '100%', height: 56, background: 'transparent',
            border: `1px solid ${c.hairStrong}`, color: c.ink,
            borderRadius: 12, fontSize: 16, fontWeight: 500, fontFamily: FONT_UI,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}>
            Show answer
            <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: c.ink3, letterSpacing: 0.4 }}>SPACE</span>
          </button>
        ) : (
          <V1RatingRow card={card} onRate={s.rate} c={c} />
        )}
      </div>
    </div>
  );
}

Object.assign(window, { ReviewV1, ReviewV1Light, ReviewV2, ReviewV3, ReviewDone, DECK, QUEUE, E });
