'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import type { Message } from '@/lib/supabase';
import { useRealtime } from './RealtimeProvider';

// ─── Types ────────────────────────────────────────────────────────────────────

type NoteData = { m: string; loc: string };
type Dir = 'ascend' | 'approach' | 'drift';
type NoteConfig = NoteData & { _i: number; [key: string]: string | number };

// ─── Fallback messages (design-crafted for ambient field) ────────────────────

const FALLBACK: NoteData[] = [
  { m: "You're doing better than you think.", loc: 'Lisbon' },
  { m: 'Rest is not a reward. You can stop now.', loc: 'Lagos' },
  { m: 'The world is softer with you in it.', loc: 'Leeds' },
  { m: "It's okay to begin again, slowly.", loc: 'Busan' },
  { m: "You don't have to carry it all at once.", loc: 'Lima' },
  { m: 'Take the deep breath. This one, right now.', loc: 'Amman' },
  { m: 'You are allowed to take up space.', loc: 'Perth' },
  { m: "Tomorrow doesn't need solving tonight.", loc: 'Riga' },
  { m: "Be gentle — you're doing something hard.", loc: 'Pune' },
  { m: 'Your quiet kindness is noticed.', loc: 'Kyoto' },
  { m: 'There is time. There is room. There is you.', loc: 'Ghent' },
  { m: 'Somewhere, someone is grateful for you.', loc: 'Hanoi' },
  { m: 'Let today be a little easier.', loc: 'Utrecht' },
  { m: 'You made it through every hard day so far.', loc: 'Oslo' },
];

// ─── Seeded RNG ───────────────────────────────────────────────────────────────

function lRng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

// ─── Build ambient note configs ───────────────────────────────────────────────

function buildNotes(dir: Dir, density: number, seed: number, pool: NoteData[]): NoteConfig[] {
  const rand = lRng(seed);
  const n = Math.max(5, Math.min(14, density));
  const out: NoteConfig[] = [];

  for (let i = 0; i < n; i++) {
    const d = pool[(i + 2) % pool.length];
    const side = i % 2 === 0 ? -1 : 1;
    const laneA = side * (23 + rand() * 23);
    const sway = rand() * 14 - 7;
    const fs = 21 + Math.round(rand() * 9);
    const w = 190 + Math.round(rand() * 90);
    const dur = (15 + rand() * 13).toFixed(1);
    const maxop = (0.5 + rand() * 0.28).toFixed(2);

    const cfg: NoteConfig = {
      ...d,
      _i: i,
      '--w': `${w}px`,
      '--fs': `${fs}px`,
      '--dur': `${dur}s`,
      '--maxop': maxop,
    };

    if (dir === 'ascend') {
      cfg['--xa'] = `${laneA.toFixed(1)}vw`;
      cfg['--xb'] = `${(laneA + sway).toFixed(1)}vw`;
      cfg['--za'] = `${(120 + rand() * 170).toFixed(0)}px`;
      cfg['--zb'] = `${(-(420 + rand() * 420)).toFixed(0)}px`;
      cfg['--delay'] = `${(-rand() * parseFloat(dur)).toFixed(2)}s`;
    } else if (dir === 'approach') {
      const ya = rand() * 30 - 15;
      cfg['--xa'] = `${(laneA * 0.4).toFixed(1)}vw`;
      cfg['--xb'] = `${(laneA * 1.5).toFixed(1)}vw`;
      cfg['--ya'] = `${ya.toFixed(1)}vh`;
      cfg['--yb'] = `${(ya * 1.7 - 4).toFixed(1)}vh`;
      cfg['--delay'] = `${(-rand() * parseFloat(dur)).toFixed(2)}s`;
    } else {
      cfg['--xa'] = `${laneA.toFixed(1)}vw`;
      cfg['--xb'] = `${(laneA + sway * 0.5).toFixed(1)}vw`;
      cfg['--ya'] = `${(rand() * 64 - 32).toFixed(1)}vh`;
      cfg['--za'] = `${(-(rand() * 520) + 120).toFixed(0)}px`;
      cfg['--dur'] = `${(5 + rand() * 5).toFixed(1)}s`;
      cfg['--delay'] = `${(-rand() * 6).toFixed(2)}s`;
    }

    out.push(cfg);
  }
  return out;
}

// ─── AmbientNote ──────────────────────────────────────────────────────────────

function AmbientNote({ cfg }: { cfg: NoteConfig }) {
  const { m, loc, _i, ...vars } = cfg;
  void _i;
  return (
    <div className="kw-anote" style={vars as React.CSSProperties}>
      <div className="kw-ah">{m}</div>
      <div className="kw-am">{loc}</div>
    </div>
  );
}

// ─── Featured center message ──────────────────────────────────────────────────

function Featured({ messages, speed }: { messages: NoteData[]; speed: number }) {
  const [idx, setIdx] = useState(0);
  const [prev, setPrev] = useState(-1);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || messages.length === 0) return;
    const ms = 6200 / Math.max(0.4, speed);
    const t = setTimeout(() => {
      setPrev(idx);
      setIdx((i) => (i + 1) % messages.length);
    }, ms);
    return () => clearTimeout(t);
  }, [idx, paused, speed, messages.length]);

  if (messages.length === 0) return null;

  return (
    <div className="kw-featured">
      <div className="kw-feat-eyebrow">a kind word from someone, somewhere</div>
      <div
        className="kw-feat-stack"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {messages.map((d, i) => {
          let cls = 'kw-feat-card ';
          if (i === idx) cls += 'is-active';
          else if (i === prev) cls += 'is-out';
          else cls += 'is-in';
          return (
            <div key={i} className={cls}>
              <div className="kw-feat-msg">{d.m}</div>
              <div className="kw-feat-meta">
                <span className="kw-line" />
                {d.loc}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Compose overlay ──────────────────────────────────────────────────────────

function KWCompose({ onClose }: { onClose: () => void }) {
  const [text, setText] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent'>('idle');
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    taRef.current?.focus();
  }, []);

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || status !== 'idle') return;
    setStatus('loading');
    try {
      let geo: { country?: string; country_code?: string } = {};
      try {
        const r = await fetch('/api/geo');
        if (r.ok) geo = await r.json();
      } catch {
        // geo is optional
      }
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed, ...geo }),
      });
      if (res.ok) {
        setStatus('sent');
        setTimeout(() => onClose(), 2000);
      } else {
        setStatus('idle');
      }
    } catch {
      setStatus('idle');
    }
  }

  return (
    <div className="kw-scrim" onClick={onClose}>
      <div className="kw-compose" onClick={(e) => e.stopPropagation()}>
        <div className="kw-compose-head-row">
          <h3>Send a kind word into the wave</h3>
          <button className="kw-compose-x" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <p className="kw-compose-sub">No account. No name needed. Just kindness.</p>
        {status === 'sent' ? (
          <p className="kw-compose-success">Your message is floating out there ✦</p>
        ) : (
          <>
            <textarea
              ref={taRef}
              className="kw-compose-ta"
              placeholder="Type something gentle…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={280}
            />
            <div className="kw-compose-row">
              <button
                className="kw-compose-send"
                onClick={handleSend}
                disabled={!text.trim() || status === 'loading'}
              >
                {status === 'loading' ? 'Sending…' : 'Release it →'}
              </button>
            </div>
          </>
        )}
        <div className="kw-compose-foot">🔓 no login required · floats up for everyone, instantly</div>
      </div>
    </div>
  );
}

// ─── Direction options ────────────────────────────────────────────────────────

const DIRS: { key: Dir; label: string }[] = [
  { key: 'ascend', label: 'Ascend' },
  { key: 'approach', label: 'Approach' },
  { key: 'drift', label: 'Drift' },
];

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  initialMessages: Message[];
  initialCount: number;
}

export default function KindWaveLanding({ initialMessages, initialCount }: Props) {
  const { totalCount } = useRealtime();
  const count = totalCount > 0 ? totalCount : initialCount;

  const [dir, setDir] = useState<Dir>('ascend');
  const [composing, setComposing] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);

  // Real messages for featured center, fallback to design messages
  const featuredMessages = useMemo((): NoteData[] => {
    if (initialMessages.length > 0) {
      return initialMessages.slice(0, 14).map((msg) => ({
        m: msg.text,
        loc: msg.country ?? 'somewhere in the world',
      }));
    }
    return FALLBACK;
  }, [initialMessages]);

  // Ambient notes use design fallbacks for consistent quality
  const notes = useMemo(() => buildNotes(dir, 8, 41, FALLBACK), [dir]);

  // Mouse parallax
  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--px', `${(nx * 7).toFixed(2)}deg`);
        el.style.setProperty('--py', `${(-ny * 5).toFixed(2)}deg`);
      });
    };
    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="kw" data-palette="coast" style={{ '--speed': '1' } as React.CSSProperties}>
      <header className="kw-top">
        <div className="kw-wordmark">
          <span className="kw-mark" />
          KindWave
        </div>
        <div className="kw-top-right">
          <span className="kw-reading">
            <span className="kw-dot" />
            {count.toLocaleString()} {count === 1 ? 'message' : 'messages'} shared
          </span>
        </div>
      </header>

      <div className="kw-scene" ref={sceneRef}>
        <div className={`kw-field kw-dir-${dir}`} key={`${dir}-8`}>
          {notes.map((cfg, i) => (
            <AmbientNote key={i} cfg={cfg} />
          ))}
        </div>
      </div>

      <Featured messages={featuredMessages} speed={1} />

      <div className="kw-bottom">
        <div className="kw-dirswitch">
          {DIRS.map((x) => (
            <button
              key={x.key}
              className={x.key === dir ? 'on' : ''}
              onClick={() => setDir(x.key)}
            >
              {x.label}
            </button>
          ))}
        </div>
        <div className="kw-share-row">
          <button className="kw-share-btn" onClick={() => setComposing(true)}>
            ✎ Share a kind word
          </button>
          <span className="kw-nologin">No sign-up — your words appear for everyone, instantly.</span>
        </div>
      </div>

      {composing && <KWCompose onClose={() => setComposing(false)} />}
    </div>
  );
}
