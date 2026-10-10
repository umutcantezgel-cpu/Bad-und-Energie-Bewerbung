import 'server-only';
import { createHmac } from 'node:crypto';
import { z } from 'zod';

// Serverseitige Umgebungsvariablen. Jeder Zugriff liest process.env frisch
// (kein Modul-Cache), damit Vercel-Runtime-Env und Tests zuverlässig greifen.

export const DEFAULT_APP_URL = 'https://karriere.bad-energie.de';
const DEFAULT_NOTIFICATION_EMAIL = 'info@bad-energie.de';
/**
 * Absender, wenn RESEND_FROM_EMAIL fehlt. karriere.bad-energie.de ist die einzige Domain mit
 * Resend-Einträgen im DNS (resend._domainkey und send.karriere.bad-energie.de, Region eu-west-1;
 * geprüft am 2026-10-10). Kein Ersatz auf fremden Domains wie onboarding@resend.dev.
 */
export const DEFAULT_FROM_EMAIL = 'Bad und Energie Karriere <bewerbung@karriere.bad-energie.de>';
const MIN_SECRET_LENGTH = 32;

const PLACEHOLDER_PATTERNS: readonly RegExp[] = [
  /^(?:my|your|dein|deine|example)[_-]/i,
  /^re_(?:1234|x{4,}|your|dein)/i,
  /placeholder/i,
  /^(?:changeme|change[_-]me|replace[_-]me|todo|tbd|x{3,}|\.{3}|…)$/i,
  /^<[^@<>]*>$/,
  // Muster-URL aus der Supabase-Doku bzw. alten .env.example
  /^https?:\/\/your-project\.supabase\.co\/?$/i,
];

/** Leere Werte und offensichtliche Platzhalter aus .env.example gelten als nicht gesetzt. */
export function isPlaceholder(value: string | null | undefined): boolean {
  const trimmed = value?.trim() ?? '';
  return trimmed === '' || PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(trimmed));
}

/**
 * Leerraum und ein umschließendes Paar Anführungszeichen entfernen: Im Vercel-Dashboard wird der
 * Wert oft wie in einer .env-Datei mit "…" eingetragen, die Anführungszeichen gehören dann zum Wert.
 */
export function cleanEnvValue(value: string): string {
  return value.trim().replace(/^(["'])([\s\S]*)\1$/, '$2').trim();
}

const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => {
    if (typeof value !== 'string') return undefined;
    const cleaned = cleanEnvValue(value);
    return isPlaceholder(cleaned) ? undefined : cleaned;
  }, schema.optional());

const ADDRESS = String.raw`[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+`;
// „adresse@domain.de“ oder „Anzeigename <adresse@domain.de>“
const SENDER_PATTERN = new RegExp(`^(?:${ADDRESS}|[^<>]+<${ADDRESS}>)$`);
const secret = z.string().min(MIN_SECRET_LENGTH);
const httpUrl = z.url({ protocol: /^https?$/ });
// Server-Schlüssel von Supabase: neuer Secret Key (sb_secret_…) oder alter service_role-JWT.
const SUPABASE_SERVER_KEY = /^(?:sb_secret_[\x21-\x7E]{16,}|eyJ[\w-]+\.[\w-]+\.[\w-]+)$/;

const serverEnvSchema = z.object({
  APP_URL: optional(httpUrl),
  // Nur druckbares ASCII: ein unsichtbares Zeichen (z. B. aus einer Kopie) ließe `new Resend()` werfen.
  RESEND_API_KEY: optional(z.string().regex(/^re_[\x21-\x7E]{8,}$/)),
  RESEND_FROM_EMAIL: optional(z.string().regex(SENDER_PATTERN)),
  CONTACT_NOTIFICATION_EMAIL: optional(z.email()),
  // Alter Name von CONTACT_NOTIFICATION_EMAIL, wird nur noch als Fallback gelesen.
  RESEND_TO_EMAIL: optional(z.email()),
  // Öffentlicher IndexNow-Prüfschlüssel (Protokoll: 8–128 Zeichen a–z, A–Z, 0–9, „-“).
  INDEXNOW_KEY: optional(z.string().regex(/^[A-Za-z0-9-]{8,128}$/)),
  INDEXNOW_SUBMIT_TOKEN: optional(secret),
  IP_HASH_SALT: optional(secret),
  APPLICATION_TOKEN_SECRET: optional(secret),
  EMAIL_SIMULATION: optional(z.enum(['true', 'false'])),
  ALLOW_DEV_SECRETS: optional(z.enum(['true', 'false'])),
  // Supabase (Phase 2b, nur serverseitig). Die Namen der Vercel-Integration werden mitgelesen.
  SUPABASE_URL: optional(httpUrl),
  NEXT_PUBLIC_SUPABASE_URL: optional(httpUrl),
  SUPABASE_SECRET_KEY: optional(z.string().regex(SUPABASE_SERVER_KEY)),
  SUPABASE_SERVICE_ROLE_KEY: optional(z.string().regex(SUPABASE_SERVER_KEY)),
  APPLICATION_SINK: optional(z.enum(['auto', 'email', 'supabase'])),
});

export type ServerEnv = z.output<typeof serverEnvSchema>;
export type ServerEnvName = keyof ServerEnv;
export type SecretName = 'IP_HASH_SALT' | 'APPLICATION_TOKEN_SECRET';
const SECRET_NAMES: readonly SecretName[] = ['IP_HASH_SALT', 'APPLICATION_TOKEN_SECRET'];

export class EnvError extends Error {
  readonly variable: ServerEnvName;
  readonly reason: 'missing' | 'invalid';

  constructor(variable: ServerEnvName, reason: 'missing' | 'invalid') {
    super(`Umgebungsvariable ${variable} ist ${reason === 'missing' ? 'nicht gesetzt' : 'ungültig'}.`);
    this.name = 'EnvError';
    this.variable = variable;
    this.reason = reason;
  }
}

/** Liest eine Variable; ungültige Werte gelten als nicht gesetzt (`invalid: true`). */
function readVar<K extends ServerEnvName>(name: K): { value?: ServerEnv[K]; invalid: boolean } {
  const result = serverEnvSchema.shape[name].safeParse(process.env[name]);
  return result.success
    ? { value: result.data as ServerEnv[K], invalid: false }
    : { value: undefined, invalid: true };
}

export function isVercelProduction(): boolean {
  return process.env.VERCEL_ENV === 'production';
}

/** Simulierter Mailversand: nie auf Vercel Production, sonst lokal oder mit EMAIL_SIMULATION=true. */
export function emailSimulationAllowed(): boolean {
  if (isVercelProduction()) return false;
  return process.env.NODE_ENV !== 'production' || readVar('EMAIL_SIMULATION').value === 'true';
}

/**
 * Fester Dev-Fallback für HMAC-Geheimnisse: nur ohne NODE_ENV=production (`next dev`, Tests) oder
 * per ALLOW_DEV_SECRETS=true (lokale E2E-Läufe mit `next start`), nie auf Vercel Production.
 */
export function devSecretsAllowed(): boolean {
  if (isVercelProduction()) return false;
  return process.env.NODE_ENV !== 'production' || readVar('ALLOW_DEV_SECRETS').value === 'true';
}

export function getAppUrl(): string {
  return (readVar('APP_URL').value ?? DEFAULT_APP_URL).replace(/\/+$/, '');
}

export interface EmailConfig {
  apiKey?: string;
  from: string;
  /** `default`: RESEND_FROM_EMAIL fehlt oder ist ungültig, es gilt DEFAULT_FROM_EMAIL. */
  fromSource: 'env' | 'default';
  notificationTo: string;
  /** Erzwingt Simulation (EMAIL_SIMULATION=true), nur wo emailSimulationAllowed() gilt. */
  forceSimulation: boolean;
  /** Fehlende oder ungültige Variablen, ohne die kein echter Versand möglich ist. */
  missing: Array<'RESEND_API_KEY'>;
}

let reportedEmailConfig = false;

/** Ohne RESEND_FROM_EMAIL gilt DEFAULT_FROM_EMAIL; ohne RESEND_API_KEY wird nur simuliert oder abgelehnt. */
export function getEmailConfig(): EmailConfig {
  const apiKey = readVar('RESEND_API_KEY').value;
  const configuredFrom = readVar('RESEND_FROM_EMAIL').value;
  const notificationTo =
    readVar('CONTACT_NOTIFICATION_EMAIL').value ??
    readVar('RESEND_TO_EMAIL').value ??
    DEFAULT_NOTIFICATION_EMAIL;

  const missing: EmailConfig['missing'] = [];
  if (!apiKey) missing.push('RESEND_API_KEY');

  if (missing.length > 0 && !emailSimulationAllowed() && !reportedEmailConfig) {
    reportedEmailConfig = true;
    console.error(`[env] E-Mail-Versand nicht konfiguriert, es fehlt: ${missing.join(', ')}`);
  }

  return {
    apiKey,
    from: configuredFrom ?? DEFAULT_FROM_EMAIL,
    fromSource: configuredFrom ? 'env' : 'default',
    notificationTo,
    forceSimulation: emailSimulationAllowed() && readVar('EMAIL_SIMULATION').value === 'true',
    missing,
  };
}

// ---------------------------------------------------------------------------
// HMAC-Geheimnisse
// ---------------------------------------------------------------------------

export type SecretSource = 'env' | 'derived' | 'dev' | 'missing';

/** JWT-Rolle ohne Signaturprüfung, nur um anon- von service_role-Schlüsseln zu unterscheiden. */
function jwtRole(token: string): unknown {
  try {
    return JSON.parse(Buffer.from(token.split('.')[1] ?? '', 'base64url').toString('utf8'))?.role;
  } catch {
    return undefined;
  }
}

/** Nur Schlüssel mit Serverrechten: sb_secret_… oder ein JWT mit role=service_role (nie anon). */
function serverKey(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return value.startsWith('sb_secret_') || jwtRole(value) === 'service_role' ? value : undefined;
}

type SupabaseKeyName = 'SUPABASE_SECRET_KEY' | 'SUPABASE_SERVICE_ROLE_KEY';

/** Server-Key von Supabase samt der Variable, aus der er kommt (für Logs). */
function supabaseServerKeyEntry(): { name: SupabaseKeyName; value: string } | undefined {
  for (const name of ['SUPABASE_SECRET_KEY', 'SUPABASE_SERVICE_ROLE_KEY'] as const) {
    const value = serverKey(readVar(name).value);
    if (value) return { name, value };
  }
  return undefined;
}

function supabaseServerKey(): string | undefined {
  return supabaseServerKeyEntry()?.value;
}

/**
 * Hauptschlüssel für abgeleitete Geheimnisse: der Resend-Key (ohne ihn gibt es in Production
 * ohnehin keinen Versand), sonst der Supabase-Server-Key. Beide sind lange Zufallswerte und
 * liegen nur auf dem Server.
 */
function derivationMaster(): { name: 'RESEND_API_KEY' | SupabaseKeyName; value: string } | undefined {
  const resend = readVar('RESEND_API_KEY').value;
  if (resend) return { name: 'RESEND_API_KEY', value: resend };
  return supabaseServerKeyEntry();
}

function resolveSecret(name: SecretName): { value?: string; source: SecretSource; invalid: boolean; from?: string } {
  const { value, invalid } = readVar(name);
  if (value) return { value, source: 'env', invalid: false };

  // Fehlt der eigene Wert, wird er per HMAC aus einem vorhandenen Server-Schlüssel abgeleitet
  // (je Verwendungszweck ein eigener Wert, nicht umkehrbar). Wechselt der Hauptschlüssel, wechseln
  // auch die abgeleiteten Werte: offene Ergänzungs-Links werden dann ungültig.
  const master = derivationMaster();
  if (master) {
    const derived = createHmac('sha256', master.value).update(`karriere.bad-energie.de:${name}:v1`).digest('hex');
    return { value: derived, source: 'derived', invalid, from: master.name };
  }

  if (devSecretsAllowed()) return { value: `dev-only-${name.toLowerCase()}-not-for-production`, source: 'dev', invalid };
  return { source: 'missing', invalid };
}

/**
 * HMAC-Geheimnisse (mind. 32 Zeichen). Reihenfolge: eigener Wert aus der Umgebung, sonst aus
 * RESEND_API_KEY bzw. dem Supabase-Server-Key abgeleitet, sonst der feste Dev-Fallback (nur wo
 * devSecretsAllowed() gilt). Gibt es nichts davon, wirft ein EnvError (die Formular-APIs → 503).
 */
export function getSecret(name: SecretName): string {
  const resolved = resolveSecret(name);
  if (resolved.value) return resolved.value;
  throw new EnvError(name, resolved.invalid ? 'invalid' : 'missing');
}

/** Herkunft eines Geheimnisses für Start-Log und /api/status, nie der Wert. */
export function getSecretSource(name: SecretName): SecretSource {
  return resolveSecret(name).source;
}

/** Öffentlicher IndexNow-Schlüssel; ohne Wert ist das Einreichen deaktiviert. */
export function getIndexNowKey(): string | undefined {
  return readVar('INDEXNOW_KEY').value;
}

/** Bearer-Token für POST /api/indexnow. Ohne Wert bleibt der Endpunkt deaktiviert. */
export function getIndexNowSubmitToken(): string | undefined {
  return readVar('INDEXNOW_SUBMIT_TOKEN').value;
}

// ---------------------------------------------------------------------------
// Supabase (Phase 2b): Ziel der Bewerbungen
// ---------------------------------------------------------------------------

export interface SupabaseServiceConfig {
  url: string;
  secretKey: string;
  keyKind: 'secret' | 'service_role_jwt';
  /** Projekt-Ref aus der URL (für Logs), falls es eine *.supabase.co-Adresse ist. */
  projectRef?: string;
}

/** URL (SUPABASE_URL, sonst NEXT_PUBLIC_SUPABASE_URL) und Server-Key; null, wenn etwas fehlt. */
export function getSupabaseServiceConfig(): SupabaseServiceConfig | null {
  const url = (readVar('SUPABASE_URL').value ?? readVar('NEXT_PUBLIC_SUPABASE_URL').value)?.replace(/\/+$/, '');
  const secretKey = supabaseServerKey();
  if (!url || !secretKey) return null;
  if (isVercelProduction() && !url.startsWith('https://')) return null;
  return {
    url,
    secretKey,
    keyKind: secretKey.startsWith('sb_secret_') ? 'secret' : 'service_role_jwt',
    projectRef: /^https:\/\/([a-z0-9]{20})\.supabase\.co$/.exec(url)?.[1],
  };
}

export type ApplicationSinkMode = 'auto' | 'email' | 'supabase';

export function getApplicationSinkMode(): ApplicationSinkMode {
  return readVar('APPLICATION_SINK').value ?? 'auto';
}

export type IntakeTarget =
  | { kind: 'email'; reason: 'mode_email' | 'not_configured' | 'not_production' }
  | { kind: 'supabase'; config: SupabaseServiceConfig };

/**
 * Wohin Bewerbungen gehen. `auto` (Standard): in die Datenbank nur auf Vercel Production, weil es
 * genau ein Supabase-Projekt gibt; Preview, `next start` und Tests schreiben so nie Testdaten
 * hinein. `supabase` erzwingt die Datenbank (wenn konfiguriert), `email` schaltet sie ab.
 */
export function resolveIntakeTarget(): IntakeTarget {
  const mode = getApplicationSinkMode();
  if (mode === 'email') return { kind: 'email', reason: 'mode_email' };
  const config = getSupabaseServiceConfig();
  if (!config) return { kind: 'email', reason: 'not_configured' };
  if (mode === 'auto' && !isVercelProduction()) return { kind: 'email', reason: 'not_production' };
  return { kind: 'supabase', config };
}

// ---------------------------------------------------------------------------
// Start-Check
// ---------------------------------------------------------------------------

/** Variablen, ohne die diese Umgebung nicht korrekt arbeitet (abhängig von Simulation und Fallbacks). */
export function getRequiredServerEnv(): ServerEnvName[] {
  const required: ServerEnvName[] = [];
  if (!emailSimulationAllowed()) required.push('RESEND_API_KEY');
  for (const name of SECRET_NAMES) if (resolveSecret(name).source === 'missing') required.push(name);
  return required;
}

/** Übersicht für den Start-Check; nennt nur Variablennamen, nie Werte. */
export function checkServerEnv(): { ok: boolean; missing: ServerEnvName[]; invalid: ServerEnvName[] } {
  const required = getRequiredServerEnv();
  const missing: ServerEnvName[] = [];
  const invalid: ServerEnvName[] = [];

  for (const name of Object.keys(serverEnvSchema.shape) as ServerEnvName[]) {
    const { value, invalid: isInvalid } = readVar(name);
    if (isInvalid) invalid.push(name);
    else if (value === undefined && required.includes(name)) missing.push(name);
  }

  // Ein Server-Key, der kein Server-Key ist (z. B. der anon- oder publishable Key), ist ungültig.
  for (const name of ['SUPABASE_SECRET_KEY', 'SUPABASE_SERVICE_ROLE_KEY'] as const) {
    const { value } = readVar(name);
    if (value && !serverKey(value) && !invalid.includes(name)) invalid.push(name);
  }

  // APPLICATION_SINK=supabase ohne vollständige Konfiguration: fehlende Teile benennen.
  if (getApplicationSinkMode() === 'supabase' && !getSupabaseServiceConfig()) {
    if (!readVar('SUPABASE_URL').value && !readVar('NEXT_PUBLIC_SUPABASE_URL').value) missing.push('SUPABASE_URL');
    if (!supabaseServerKey()) missing.push('SUPABASE_SECRET_KEY');
  }

  return { ok: invalid.length === 0 && missing.length === 0, missing, invalid };
}

function describeIntakeTarget(target: IntakeTarget): string {
  if (target.kind === 'supabase') {
    const project = target.config.projectRef ?? new URL(target.config.url).host;
    return `Supabase (${project}, ${target.config.keyKind === 'secret' ? 'Secret Key' : 'service_role-JWT'}) und E-Mail`;
  }
  const reasons = { mode_email: 'APPLICATION_SINK=email', not_configured: 'Supabase nicht konfiguriert', not_production: 'nicht Vercel Production' };
  return `nur E-Mail (${reasons[target.reason]})`;
}

/**
 * Start-Check aus instrumentation.ts (ROADMAP §3.2): meldet eine unvollständige Konfiguration
 * einmal pro Serverstart und wirft bewusst nie, auch nicht auf Vercel Production. Ein fehlendes
 * Mail-Geheimnis darf nicht die ganze Karriereseite abschalten: Die Formular-APIs antworten mit
 * 503, und die UI bietet Telefon und WhatsApp an (ROADMAP §14.4). Zusätzlich eine Infozeile, wohin
 * Bewerbungen gehen und welche Ersatzwerte gelten (nur Namen, nie Werte).
 */
export function reportServerEnv(): { ok: boolean } {
  const { ok, missing, invalid } = checkServerEnv();

  const notes = [
    `Bewerbungen: ${describeIntakeTarget(resolveIntakeTarget())}`,
    ...SECRET_NAMES.flatMap((name) => {
      const resolved = resolveSecret(name);
      return resolved.source === 'derived' ? [`${name} abgeleitet aus ${resolved.from}`] : [];
    }),
    ...(readVar('RESEND_API_KEY').value && !readVar('RESEND_FROM_EMAIL').value ? ['Absender: Standard (karriere.bad-energie.de)'] : []),
  ];
  console.info(`[env] ${notes.join('; ')}`);

  if (ok) return { ok };

  const parts = [
    missing.length > 0 && `fehlt: ${missing.join(', ')}`,
    invalid.length > 0 && `ungültig: ${invalid.join(', ')}`,
  ].filter(Boolean);
  // 503 nur, wenn Bewerbungen wirklich scheitern: kein Resend-Key (fehlt oder ungültig, es gibt
  // keinen Ersatz) oder ein Geheimnis ohne eigenen Wert und ohne Hauptschlüssel. Alles andere
  // (ungültige optionale Werte, unvollständiges Supabase) hat einen Ersatz.
  const blocking =
    (!emailSimulationAllowed() && !readVar('RESEND_API_KEY').value) ||
    SECRET_NAMES.some((name) => resolveSecret(name).source === 'missing');
  const supabaseIncomplete = missing.includes('SUPABASE_URL') || missing.includes('SUPABASE_SECRET_KEY');
  const scope = isVercelProduction()
    ? blocking
      ? 'PRODUKTION – Bewerbungen werden abgelehnt (503)'
      : supabaseIncomplete
        ? 'PRODUKTION – Supabase unvollständig, Bewerbungen nur per E-Mail'
        : 'PRODUKTION – Ersatzwerte aktiv'
    : 'lokal';
  console.error(`[env] Server-Konfiguration unvollständig, ${scope} (${parts.join('; ')})`);
  return { ok };
}
