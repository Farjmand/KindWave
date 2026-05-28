'use client';

import { useState, useRef } from 'react';
import confetti from 'canvas-confetti';

const MOODS = [
  { label: 'Hopeful', emoji: '🌱' },
  { label: 'Grateful', emoji: '🙏' },
  { label: 'Joyful', emoji: '😄' },
  { label: 'Loving', emoji: '❤️' },
  { label: 'Brave', emoji: '💪' },
];

const MAX_CHARS = 280;

export default function SubmitForm() {
  const [text, setText] = useState('');
  const [mood, setMood] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const remaining = MAX_CHARS - text.length;
  const progress = text.length / MAX_CHARS;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || status === 'loading') return;

    setStatus('loading');
    setError(null);

    try {
      let geo: { country: string | null; country_code: string | null } = { country: null, country_code: null };
      try {
        const geoRes = await fetch('/api/geo');
        if (geoRes.ok) geo = await geoRes.json();
      } catch {
        // geo is optional — proceed without it
      }

      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          mood,
          country: geo.country,
          country_code: geo.country_code,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        setStatus('error');
        return;
      }

      setStatus('success');
      setText('');
      setMood(null);

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f5c842', '#3de8c8', '#f472b6', '#60a5fa', '#4ade80'],
      });

      setTimeout(() => setStatus('idle'), 3000);
    } catch {
      setError('Network error. Please try again.');
      setStatus('error');
    }
  }

  return (
    <form className="submit-form" onSubmit={handleSubmit}>
      <h2 className="form-title">Share your light 💫</h2>

      <div className="textarea-wrapper">
        <textarea
          ref={textareaRef}
          className="message-textarea"
          placeholder="Write something kind for a stranger..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={MAX_CHARS}
          rows={4}
          disabled={status === 'loading'}
        />
        <div className="char-ring-wrapper">
          <svg className="char-ring" viewBox="0 0 36 36" width="36" height="36">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="15.9"
              fill="none"
              stroke={remaining < 20 ? '#f472b6' : '#3de8c8'}
              strokeWidth="3"
              strokeDasharray={`${progress * 100} 100`}
              strokeLinecap="round"
              transform="rotate(-90 18 18)"
              style={{ transition: 'stroke-dasharray 0.1s ease' }}
            />
          </svg>
          <span className={`char-count ${remaining < 20 ? 'warn' : ''}`}>{remaining}</span>
        </div>
      </div>

      <div className="mood-picker">
        <span className="mood-label">How are you feeling?</span>
        <div className="mood-pills">
          {MOODS.map(({ label, emoji }) => (
            <button
              key={label}
              type="button"
              className={`mood-pill ${mood === label ? 'active' : ''}`}
              data-mood={label.toLowerCase()}
              onClick={() => setMood(mood === label ? null : label)}
              disabled={status === 'loading'}
            >
              {emoji} {label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}

      {status === 'success' && (
        <p className="form-success">Your message is now in the world 🌍</p>
      )}

      <button
        type="submit"
        className="submit-btn"
        disabled={!text.trim() || status === 'loading'}
      >
        {status === 'loading' ? (
          <span className="btn-loading">Sending<span className="dots" /></span>
        ) : status === 'success' ? (
          '✓ Sent!'
        ) : (
          'Send into the World →'
        )}
      </button>
    </form>
  );
}
