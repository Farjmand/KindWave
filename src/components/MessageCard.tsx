'use client';

import { Message } from '@/lib/supabase';
import { useState } from 'react';
import { countryCodeToFlag, formatTimeAgo } from '@/lib/utils';

const MOOD_EMOJI: Record<string, string> = {
  Hopeful: '🌱',
  Grateful: '🙏',
  Joyful: '😄',
  Loving: '❤️',
  Brave: '💪',
};

type Props = {
  readonly message: Message;
  readonly index?: number;
};

export default function MessageCard({ message, index = 0 }: Props) {
  const [sparks, setSparks] = useState(message.sparks);
  const [sparked, setSparked] = useState(false);

  const moodEmoji = message.mood ? MOOD_EMOJI[message.mood] : null;

  const delay = Math.min(index * 0.05, 0.4);

  async function handleSpark() {
    if (sparked) return;
    setSparked(true);
    setSparks((s) => s + 1);
    try {
      const res = await fetch(`/api/messages/${message.id}/spark`, { method: 'POST' });
      if (!res.ok) throw new Error('spark failed');
    } catch {
      // Roll back optimistic update on failure.
      setSparked(false);
      setSparks((s) => s - 1);
    }
  }

  const timeAgo = formatTimeAgo(message.created_at);

  return (
    <article
      className="message-card"
      data-mood={message.mood ?? undefined}
      style={{ '--card-delay': `${delay}s` } as React.CSSProperties}
    >
      <div className="card-header">
        <div className="card-origin">
          {message.country_code && (
            <span className="flag">{countryCodeToFlag(message.country_code)}</span>
          )}
          <span className="country">{message.country ?? 'Somewhere on Earth'}</span>
        </div>
        <span className="card-time">{timeAgo}</span>
      </div>

      <p className="card-text">{message.text}</p>

      <div className="card-footer">
        {message.mood && (
          <span className="mood-badge">
            {moodEmoji} {message.mood}
          </span>
        )}
        <button
          type="button"
          className={`spark-btn ${sparked ? 'sparked' : ''}`}
          onClick={handleSpark}
          aria-label="Spark this message"
        >
          ✨ {sparks > 0 ? sparks : ''}
        </button>
      </div>
    </article>
  );
}
