const IPV4_RE = /^(\d{1,3}\.){3}\d{1,3}$/;

export function isSafePublicIp(ip: string): boolean {
  if (!IPV4_RE.test(ip)) return false;
  const parts = ip.split('.').map(Number);
  if (parts.some((o) => o > 255)) return false;
  const [a, b] = parts;
  return !(
    a === 0 ||                           // 0.0.0.0/8 unspecified
    a === 10 ||                          // 10.0.0.0/8 RFC-1918
    a === 127 ||                         // loopback
    (a === 100 && b >= 64 && b <= 127) || // 100.64.0.0/10 CGNAT
    (a === 172 && b >= 16 && b <= 31) || // 172.16.0.0/12 RFC-1918
    (a === 169 && b === 254) ||          // 169.254.0.0/16 link-local
    (a === 192 && b === 168) ||          // 192.168.0.0/16 RFC-1918
    a >= 224                             // multicast (224-239) + reserved (240-255)
  );
}

const FLAG_OFFSET = 0x1f1e6 - 65; // 'A'.codePointAt(0) === 65

export function countryCodeToFlag(code: string): string {
  if (!/^[A-Za-z]{2}$/.test(code)) return '🌍';
  const upper = code.toUpperCase();
  return String.fromCodePoint(
    (upper.codePointAt(0) ?? 65) + FLAG_OFFSET,
    (upper.codePointAt(1) ?? 65) + FLAG_OFFSET
  );
}

export function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
