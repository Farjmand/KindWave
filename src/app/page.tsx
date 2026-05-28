import { Suspense } from 'react';
import { createServerClient } from '@/lib/supabase-server';
import { Message } from '@/lib/supabase';
import MessageFeed from '@/components/MessageFeed';
import LiveCounter from '@/components/LiveCounter';
import SubmitForm from '@/components/SubmitForm';
import CatchButton from '@/components/CatchButton';
import RealtimeProvider from '@/components/RealtimeProvider';
import CurrentYear from '@/components/CurrentYear';
import { cacheLife } from 'next/cache';

async function getInitialData(): Promise<{ messages: Message[]; count: number; year: number }> {
  'use cache';
  cacheLife('minutes');

  const supabase = createServerClient();
  const [feedRes, countRes] = await Promise.all([
    supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('messages')
      .select('*', { count: 'estimated', head: true }),
  ]);

  return {
    messages: (feedRes.data ?? []) as Message[],
    count: countRes.count ?? 0,
    year: new Date().getFullYear(),
  };
}

export default async function Home() {
  const { messages, count, year } = await getInitialData();

  return (
    <RealtimeProvider initialCount={count}>
      <div className="page-wrapper">
        <main>
          <section className="hero">
            <h1 className="hero-wordmark">KindWave 🌊</h1>
            <p className="hero-tagline">
              Real messages of kindness from real people, all around the world.
              No login. No judgment. Just warmth.
            </p>
            <LiveCounter initialCount={count} />
            <CatchButton messages={messages} />
          </section>

          <div className="container">
            <div className="submit-section">
              <SubmitForm />
            </div>

            <h2 className="section-heading">Live from the world 🌍</h2>
            <Suspense>
              <MessageFeed initialMessages={messages} />
            </Suspense>
          </div>
        </main>

        <footer>
          Made with kindness · KindWave <CurrentYear year={year} />
        </footer>
      </div>
    </RealtimeProvider>
  );
}
