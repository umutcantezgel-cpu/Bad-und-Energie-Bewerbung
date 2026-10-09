import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getClientIp, getIpHashSalt, hashIp, ipNetworkKey } from '@/lib/security/ip';

const SALT = 's'.repeat(40);

function requestWith(headers: Record<string, string>): Request {
  return new Request('https://karriere.bad-energie.de/api/bewerbung', { headers });
}

beforeEach(() => {
  vi.stubEnv('VERCEL_ENV', '');
  vi.stubEnv('IP_HASH_SALT', '');
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('getClientIp', () => {
  it('bevorzugt x-real-ip', () => {
    expect(getClientIp(requestWith({ 'x-real-ip': '203.0.113.7', 'x-forwarded-for': '198.51.100.1' }))).toBe(
      '203.0.113.7'
    );
  });

  it('nimmt sonst den ersten Eintrag von x-forwarded-for', () => {
    expect(getClientIp(requestWith({ 'x-forwarded-for': ' 198.51.100.1 , 10.0.0.1' }))).toBe('198.51.100.1');
    expect(getClientIp(requestWith({ 'x-forwarded-for': '2001:DB8::1' }))).toBe('2001:db8::1');
  });

  it("liefert 'unknown' ohne oder bei unbrauchbaren Headern", () => {
    expect(getClientIp(requestWith({}))).toBe('unknown');
    expect(getClientIp(requestWith({ 'x-real-ip': '<script>' }))).toBe('unknown');
  });
});

describe('ipNetworkKey', () => {
  it('lässt IPv4 unverändert', () => {
    expect(ipNetworkKey('203.0.113.7')).toBe('203.0.113.7');
  });

  it('kürzt IPv6 auf das /64-Präfix', () => {
    expect(ipNetworkKey('2001:db8:1:2:a:b:c:d')).toBe('2001:db8:1:2::/64');
    expect(ipNetworkKey('2001:db8:1:2::1')).toBe('2001:db8:1:2::/64');
    expect(ipNetworkKey('2001:db8::1')).toBe('2001:db8:0:0::/64');
    expect(ipNetworkKey('::1')).toBe('0:0:0:0::/64');
  });

  it('behandelt IPv4-mapped-Adressen als IPv4', () => {
    expect(ipNetworkKey('::ffff:203.0.113.7')).toBe('203.0.113.7');
    expect(ipNetworkKey('::ffff:cb00:7107')).toBe('203.0.113.7');
  });

  it('lässt Unbekanntes unverändert', () => {
    expect(ipNetworkKey('unknown')).toBe('unknown');
  });
});

describe('hashIp', () => {
  const day = new Date('2026-10-08T09:00:00Z');

  it('ist deterministisch und 32 Hex-Zeichen lang', () => {
    const a = hashIp('203.0.113.7', { salt: SALT, date: day });
    expect(a).toMatch(/^[0-9a-f]{32}$/);
    expect(hashIp('203.0.113.7', { salt: SALT, date: new Date('2026-10-08T23:59:59Z') })).toBe(a);
    expect(hashIp('203.0.113.8', { salt: SALT, date: day })).not.toBe(a);
    expect(hashIp('203.0.113.7', { salt: 't'.repeat(40), date: day })).not.toBe(a);
  });

  it('fasst Adressen aus demselben IPv6-/64 zusammen', () => {
    const a = hashIp('2001:db8:1:2:aaaa:bbbb:cccc:dddd', { salt: SALT, date: day });
    expect(hashIp('2001:db8:1:2::1', { salt: SALT, date: day })).toBe(a);
    expect(hashIp('2001:db8:1:3::1', { salt: SALT, date: day })).not.toBe(a);
    expect(hashIp('::ffff:203.0.113.7', { salt: SALT, date: day })).toBe(hashIp('203.0.113.7', { salt: SALT, date: day }));
  });

  it('rotiert täglich (UTC)', () => {
    const today = hashIp('203.0.113.7', { salt: SALT, date: day });
    const tomorrow = hashIp('203.0.113.7', { salt: SALT, date: new Date('2026-10-09T00:00:00Z') });
    expect(tomorrow).not.toBe(today);
  });

  it('liest IP_HASH_SALT aus der Umgebung', () => {
    vi.stubEnv('IP_HASH_SALT', SALT);
    expect(hashIp('203.0.113.7', { date: day })).toBe(hashIp('203.0.113.7', { salt: SALT, date: day }));
  });
});

describe('getIpHashSalt', () => {
  it('nutzt lokal (ohne NODE_ENV=production) einen Dev-Fallback', () => {
    expect(getIpHashSalt()).toMatch(/^dev-only-/);
    vi.stubEnv('IP_HASH_SALT', 'your_random_secret_min_32_chars');
    expect(getIpHashSalt()).toMatch(/^dev-only-/);
  });

  it('wirft in jedem Production-Build ohne Salt, auch außerhalb von Vercel', () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(() => getIpHashSalt()).toThrow(/IP_HASH_SALT/);
  });

  it('wirft in Vercel Production ohne gültigen Salt', () => {
    vi.stubEnv('VERCEL_ENV', 'production');
    expect(() => getIpHashSalt()).toThrow(/IP_HASH_SALT/);
    vi.stubEnv('IP_HASH_SALT', 'zu-kurz');
    expect(() => getIpHashSalt()).toThrow(/IP_HASH_SALT/);
    vi.stubEnv('IP_HASH_SALT', SALT);
    expect(getIpHashSalt()).toBe(SALT);
  });
});
