import { countryCodeToFlag, formatTimeAgo } from '@/lib/utils';

describe('countryCodeToFlag', () => {
  it('converts a valid 2-letter code to a flag emoji', () => {
    expect(countryCodeToFlag('US')).toBe('🇺🇸');
  });

  it('is case-insensitive', () => {
    expect(countryCodeToFlag('gb')).toBe('🇬🇧');
    expect(countryCodeToFlag('Gb')).toBe('🇬🇧');
  });

  it('returns 🌍 for an empty string', () => {
    expect(countryCodeToFlag('')).toBe('🌍');
  });

  it('returns 🌍 for a single character', () => {
    expect(countryCodeToFlag('A')).toBe('🌍');
  });

  it('returns 🌍 for a 3-letter code', () => {
    expect(countryCodeToFlag('USA')).toBe('🌍');
  });

  it('returns 🌍 for numeric input', () => {
    expect(countryCodeToFlag('12')).toBe('🌍');
  });
});

describe('formatTimeAgo', () => {
  function msAgo(ms: number): string {
    return new Date(Date.now() - ms).toISOString();
  }

  it('returns "just now" for timestamps under 1 minute ago', () => {
    expect(formatTimeAgo(msAgo(0))).toBe('just now');
    expect(formatTimeAgo(msAgo(59_999))).toBe('just now');
  });

  it('returns minutes for timestamps 1–59 minutes ago', () => {
    expect(formatTimeAgo(msAgo(60_000))).toBe('1m ago');
    expect(formatTimeAgo(msAgo(59 * 60_000))).toBe('59m ago');
  });

  it('returns hours for timestamps 1–23 hours ago', () => {
    expect(formatTimeAgo(msAgo(60 * 60_000))).toBe('1h ago');
    expect(formatTimeAgo(msAgo(23 * 60 * 60_000))).toBe('23h ago');
  });

  it('returns days for timestamps 24+ hours ago', () => {
    expect(formatTimeAgo(msAgo(24 * 60 * 60_000))).toBe('1d ago');
    expect(formatTimeAgo(msAgo(7 * 24 * 60 * 60_000))).toBe('7d ago');
  });
});
