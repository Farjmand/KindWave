import { NextRequest, NextResponse } from 'next/server';
import { countryCodeToFlag, isSafePublicIp } from '@/lib/utils';

export async function GET(request: NextRequest) {
  // Prefer the platform-set header (Vercel: x-real-ip) over the spoofable XFF header.
  const realIp = request.headers.get('x-real-ip');
  const xff = request.headers.get('x-forwarded-for');
  const raw = realIp ?? (xff ? xff.split(',')[0].trim() : null);
  const ip = raw && isSafePublicIp(raw) ? raw : null;

  try {
    const url = ip
      ? `https://ipapi.co/${ip}/json/`
      : 'https://ipapi.co/json/';

    const res = await fetch(url, {
      headers: { 'User-Agent': 'KindWave/1.0' },
    });

    if (!res.ok) throw new Error('Geo lookup failed');

    const data = await res.json();

    if (data.error) {
      return NextResponse.json({ country: null, country_code: null, flag: '🌍' });
    }

    const country_code = data.country_code ?? null;
    const country = data.country_name ?? null;
    const flag = country_code ? countryCodeToFlag(country_code) : '🌍';

    return NextResponse.json(
      { country, country_code, flag },
      { headers: { 'Cache-Control': 'private, max-age=3600' } }
    );
  } catch {
    return NextResponse.json({ country: null, country_code: null, flag: '🌍' });
  }
}
