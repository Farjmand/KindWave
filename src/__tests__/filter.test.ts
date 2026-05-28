import { isProfane, cleanText } from '@/lib/filter';

describe('isProfane', () => {
  it('returns false for clean text', () => {
    expect(isProfane('Hello world')).toBe(false);
    expect(isProfane('Have a wonderful day!')).toBe(false);
  });

  it('returns false for an empty string', () => {
    expect(isProfane('')).toBe(false);
  });

  it('returns true for text containing a profane word', () => {
    expect(isProfane('ass')).toBe(true);
  });
});

describe('cleanText', () => {
  it('returns clean text unchanged', () => {
    expect(cleanText('Hello world')).toBe('Hello world');
  });

  it('replaces profane words with asterisks', () => {
    const result = cleanText('ass');
    expect(result).not.toBe('ass');
    expect(result).toMatch(/^\*+$/);
  });

  it('handles an empty string', () => {
    expect(cleanText('')).toBe('');
  });
});
