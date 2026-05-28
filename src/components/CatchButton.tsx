'use client';

import { useEffect, useRef, useState } from 'react';
import { Message } from '@/lib/supabase';
import { countryCodeToFlag } from '@/lib/utils';

type Props = { readonly messages: Message[] };

export default function CatchButton({ messages }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [caught, setCaught] = useState<Message | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [fetchedMessages, setFetchedMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (caught) {
      dialogRef.current?.showModal();
    }
  }, [caught]);

  async function handleCatch() {
    const pool = messages.length > 0 ? messages : fetchedMessages;

    if (pool.length === 0) {
      try {
        const res = await fetch('/api/messages');
        if (!res.ok) return;
        const data = await res.json();
        const fetched: Message[] = data.messages ?? [];
        setFetchedMessages(fetched);
        if (fetched.length === 0) return;
        pick(fetched);
      } catch {
        // Network failure — silently skip, button remains interactive for retry.
      }
      return;
    }

    pick(pool);
  }

  function pick(pool: Message[]) {
    const random = pool[Math.floor(Math.random() * pool.length)];
    setCaught(random);
    setFlipped(false);
    setTimeout(() => setFlipped(true), 100);
  }

  function handleClose() {
    dialogRef.current?.close();
    setCaught(null);
    setFlipped(false);
  }

  return (
    <>
      <button type="button" className="catch-btn" onClick={handleCatch}>
        🎲 Catch a Random Message
      </button>

      <dialog ref={dialogRef} className="flip-dialog" onClose={handleClose}>
        {caught && (
          <div className="flip-card" data-mood={caught.mood ?? undefined}>
            <button type="button" className="flip-close" onClick={handleClose} aria-label="Close">✕</button>
            <div className={`flip-card-inner ${flipped ? 'flipped' : ''}`}>
              <div className="flip-face flip-face-front">
                <span>✨</span>
              </div>
              <div className="flip-face flip-face-back">
                <p className="flip-card-text">{caught.text}</p>
                <div className="flip-card-origin">
                  {caught.country_code && (
                    <span className="flip-card-country">
                      {countryCodeToFlag(caught.country_code)} {caught.country}
                    </span>
                  )}
                  {caught.mood && (
                    <span className="mood-badge">{caught.mood}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
