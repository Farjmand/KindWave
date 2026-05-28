import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { isProfane } from '@/lib/filter';

const VALID_MOODS = new Set(['Hopeful', 'Grateful', 'Joyful', 'Loving', 'Brave']);

const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimit.get(ip);
  if (!record || now > record.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (record.count >= RATE_LIMIT_MAX) return false;
  record.count++;
  return true;
}

export async function GET(request: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(request.url);
  const raw = Number.parseInt(searchParams.get('page') ?? '0', 10);
  const page = Number.isFinite(raw) && raw >= 0 ? Math.min(raw, 500) : 0;
  const limit = 20;
  const offset = page * limit;

  const { data, error, count } = await supabase
    .from('messages')
    .select('*', { count: 'estimated' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('[messages GET]', error);
    return NextResponse.json({ error: 'Failed to load messages' }, { status: 500 });
  }

  return NextResponse.json({ messages: data, total: count });
}

export async function POST(request: NextRequest) {
  const supabase = createServerClient();
  // Prefer the platform-set x-real-ip (Vercel) over the spoofable XFF header.
  const realIp = request.headers.get('x-real-ip');
  const xff = request.headers.get('x-forwarded-for');
  const ip = realIp ?? (xff ? xff.split(',')[0].trim() : 'unknown');

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please wait before posting again.' }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  const { text, mood, country, country_code } = body;

  const trimmed = typeof text === 'string' ? text.trim() : '';

  if (!trimmed) {
    return NextResponse.json({ error: 'Message text is required' }, { status: 400 });
  }

  if (trimmed.length > 280) {
    return NextResponse.json({ error: 'Message too long (max 280 characters)' }, { status: 400 });
  }

  if (isProfane(trimmed)) {
    return NextResponse.json({ error: 'Message contains inappropriate content' }, { status: 400 });
  }

  if (mood != null && !(typeof mood === 'string' && VALID_MOODS.has(mood))) {
    return NextResponse.json({ error: 'Invalid mood' }, { status: 400 });
  }

  const safeCountryCode =
    typeof country_code === 'string' && /^[A-Za-z]{2}$/.test(country_code)
      ? country_code.toUpperCase()
      : null;

  const safeCountry =
    typeof country === 'string' && country.trim().length > 0 && country.trim().length <= 100
      ? country.trim()
      : null;

  const { data, error } = await supabase
    .from('messages')
    .insert({
      text: trimmed,
      mood: (typeof mood === 'string' && mood.length > 0) ? mood : null,
      country: safeCountry,
      country_code: safeCountryCode,
    })
    .select()
    .single();

  if (error) {
    console.error('[messages POST]', error);
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
  }

  return NextResponse.json({ message: data }, { status: 201 });
}
