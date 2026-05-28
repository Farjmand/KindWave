import { isSafePublicIp } from '@/lib/utils';

describe('isSafePublicIp', () => {
  it('accepts a valid public IPv4 address', () => {
    expect(isSafePublicIp('8.8.8.8')).toBe(true);
    expect(isSafePublicIp('203.0.113.1')).toBe(true);
  });

  it('rejects loopback', () => {
    expect(isSafePublicIp('127.0.0.1')).toBe(false);
  });

  it('rejects RFC-1918 private ranges', () => {
    expect(isSafePublicIp('10.0.0.1')).toBe(false);
    expect(isSafePublicIp('172.16.0.1')).toBe(false);
    expect(isSafePublicIp('172.31.255.255')).toBe(false);
    expect(isSafePublicIp('192.168.1.1')).toBe(false);
  });

  it('rejects link-local (cloud metadata range)', () => {
    expect(isSafePublicIp('169.254.169.254')).toBe(false);
  });

  it('rejects CGNAT range (100.64.0.0/10)', () => {
    expect(isSafePublicIp('100.64.0.1')).toBe(false);
    expect(isSafePublicIp('100.127.255.255')).toBe(false);
    // Just outside the range — should be accepted
    expect(isSafePublicIp('100.63.255.255')).toBe(true);
    expect(isSafePublicIp('100.128.0.0')).toBe(true);
  });

  it('rejects multicast range (224.0.0.0/4)', () => {
    expect(isSafePublicIp('224.0.0.1')).toBe(false);
    expect(isSafePublicIp('239.255.255.255')).toBe(false);
  });

  it('rejects broadcast and reserved high range', () => {
    expect(isSafePublicIp('255.255.255.255')).toBe(false);
    expect(isSafePublicIp('240.0.0.1')).toBe(false);
  });

  it('rejects 0.0.0.0', () => {
    expect(isSafePublicIp('0.0.0.0')).toBe(false);
  });

  it('rejects octets greater than 255', () => {
    expect(isSafePublicIp('999.0.0.1')).toBe(false);
    expect(isSafePublicIp('8.8.8.256')).toBe(false);
  });

  it('rejects IPv6 addresses', () => {
    expect(isSafePublicIp('::1')).toBe(false);
    expect(isSafePublicIp('2001:db8::1')).toBe(false);
  });

  it('rejects hostnames and path traversal attempts', () => {
    expect(isSafePublicIp('evil.com')).toBe(false);
    expect(isSafePublicIp('1.2.3.4/../../../../etc')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isSafePublicIp('')).toBe(false);
  });
});
