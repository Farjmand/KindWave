'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, Message } from '@/lib/supabase';

type RealtimeContextValue = {
  readonly latestMessage: Message | null;
  readonly totalCount: number;
};

const RealtimeContext = createContext<RealtimeContextValue>({
  latestMessage: null,
  totalCount: 0,
});

export function useRealtime() {
  return useContext(RealtimeContext);
}

type Props = {
  readonly initialCount: number;
  readonly children: React.ReactNode;
};

export default function RealtimeProvider({ initialCount, children }: Props) {
  const [latestMessage, setLatestMessage] = useState<Message | null>(null);
  const [totalCount, setTotalCount] = useState(initialCount);

  useEffect(() => {
    const channel = supabase
      .channel('messages-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const msg = payload.new as Message;
          setLatestMessage(msg);
          setTotalCount((c) => c + 1);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const value = useMemo(() => ({ latestMessage, totalCount }), [latestMessage, totalCount]);

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}
