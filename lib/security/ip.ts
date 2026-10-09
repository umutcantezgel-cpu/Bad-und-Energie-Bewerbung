import 'server-only';
import { createHmac } from 'node:crypto';
import { isIPv4, isIPv6 } from 'node:net';
import { getSecret } from '@/lib/env';

const IP_PATTERN = /^[0-9a-f:.]{2,45}$/i;

function normalizeIp(value: string | null | undefined): string | null {
  const ip = value?.trim();
  return ip && IP_PATTERN.test(ip) ? ip.toLowerCase() : null;
}

/**
 * Client-IP aus `x-real-ip`, sonst dem ersten Eintrag von `x-forwarded-for`, sonst 'unknown'.
 * Auf Vercel setzt die Plattform beide Header; selbst gehostet nur hinter einem Proxy vertrauenswürdig.
 */
export function getClientIp(request: Request): string {
  const { headers } = request;
  return (
    normalizeIp(headers.get('x-real-ip')) ??
    normalizeIp(headers.get('x-forwarded-for')?.split(',')[0]) ??
    'unknown'
  );
}

/**
 * IP_HASH_SALT über lib/env.ts (mind. 32 Zeichen, Platzhalter zählen nicht). Fehlt er, wirft jeder
 * Production-Build einen EnvError; den Dev-Fallback gibt es nur lokal (siehe devSecretsAllowed).
 */
export function getIpHashSalt(): string {
  return getSecret('IP_HASH_SALT');
}

/** Die acht 16-Bit-Gruppen einer IPv6-Adresse (eingebettetes IPv4 wird umgerechnet). */
function ipv6Groups(ip: string): number[] {
  let address = ip;
  const v4 = address.match(/(\d+\.\d+\.\d+\.\d+)$/);
  if (v4) {
    const [a, b, c, d] = v4[1].split('.').map(Number);
    address = `${address.slice(0, -v4[1].length)}${((a << 8) | b).toString(16)}:${((c << 8) | d).toString(16)}`;
  }
  const [head, tail] = address.split('::');
  const parse = (part?: string) => (part ? part.split(':').map((group) => parseInt(group, 16)) : []);
  const left = parse(head);
  const right = parse(tail);
  return tail === undefined ? left : [...left, ...Array(8 - left.length - right.length).fill(0), ...right];
}

/**
 * Netz, das eine Person typischerweise kontrolliert: IPv4 als Adresse, IPv6 als /64-Präfix
 * (Privacy Extensions wechseln die Adresse innerhalb davon). IPv4-mapped (::ffff:a.b.c.d) gilt als IPv4.
 */
export function ipNetworkKey(ip: string): string {
  if (isIPv4(ip)) return ip;
  if (!isIPv6(ip)) return ip;

  const groups = ipv6Groups(ip.toLowerCase());
  const isMappedV4 = groups.slice(0, 5).every((group) => group === 0) && groups[5] === 0xffff;
  if (isMappedV4) return [groups[6] >> 8, groups[6] & 0xff, groups[7] >> 8, groups[7] & 0xff].join('.');

  return `${groups.slice(0, 4).map((group) => group.toString(16)).join(':')}::/64`;
}

/** YYYY-MM-DD in UTC; Grundlage der täglichen Rotation. */
export function utcDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * HMAC-SHA256 des Netzes der IP (siehe ipNetworkKey; hex, 32 Zeichen). Der Schlüssel aus Salt und
 * UTC-Datum rotiert täglich, dadurch lassen sich Hashes verschiedener Tage nicht verknüpfen.
 */
export function hashIp(ip: string, { salt, date }: { salt?: string; date?: Date } = {}): string {
  const key = `${salt ?? getIpHashSalt()}:${utcDay(date ?? new Date())}`;
  return createHmac('sha256', key).update(ipNetworkKey(ip)).digest('hex').slice(0, 32);
}
