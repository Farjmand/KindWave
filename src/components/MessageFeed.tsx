'use client';

import { useEffect, useRef, useState } from 'react';
import { Message } from '@/lib/supabase';
import { useRealtime } from './RealtimeProvider';
import MessageCard from './MessageCard';

type Props = { readonly initialMessages: Message[] };

export default function MessageFeed({ initialMessages }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newToast, setNewToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const { latestMessage } = useRealtime();

  useEffect(() => {
    if (!latestMessage) return;
    setMessages((prev) => [latestMessage, ...prev.slice(0, 49)]);
    setNewToast(`New message from ${latestMessage.country ?? 'the world'} ✨`);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setNewToast(null), 3000);
  }, [latestMessage]);

  return (
    <section className="feed-section">
      {newToast && (
        <output className="new-toast">
          {newToast}
        </output>
      )}
      <div className="feed-grid">
        {messages.map((msg, i) => (
          <MessageCard key={msg.id} message={msg} index={i} />
        ))}
        {messages.length === 0 && (
          <p className="feed-empty">Be the first to share a kind message 🌱</p>
        )}
      </div>
    </section>
  );
}
