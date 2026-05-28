import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { isSafePublicIp } from '@/lib/utils';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Per-IP, per-message idempotency: track which (ip, messageId) pairs have already sparked.
// Module-level — same serverless limitations as the message rate limiter. Acceptable for
// this low-stakes counter; replace with Redis for production scale.
const sparked = new Set<string>();
const SPARK_TTL_MS = 24 * 60 * 60 * 1000;
const sparkExpiry = new Map<string, number>();

function canSpark(ip: string, messageId: string): boolean {
  const key = `${ip}:${messageId}`;
  const expiresAt = sparkExpiry.get(key);
  if (expiresAt !== undefined) {
    if (Date.now() < expiresAt) return false;
    // TTL expired — allow again and clean up.
    sparked.delete(key);
    sparkExpiry.delete(key);
  }
  sparked.add(key);
  sparkExpiry.set(key, Date.now() + SPARK_TTL_MS);
  return true;
}

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: 'Invalid message id' }, { status: 400 });
  }

  const realIp = request.headers.get('x-real-ip');
  const xff = request.headers.get('x-forwarded-for');
  const raw = realIp ?? (xff ? xff.split(',')[0].trim() : null);
  const ip = raw && isSafePublicIp(raw) ? raw : 'anonymous';

  if (!canSpark(ip, id)) {
    return NextResponse.json({ error: 'Already sparked' }, { status: 409 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase.rpc('increment_sparks', { message_id: id });

  if (error) {
    console.error('[spark POST]', error);
    return NextResponse.json({ error: 'Failed to record spark' }, { status: 500 });
  }

  return NextResponse.json({ sparks: data }, { status: 200 });
}
