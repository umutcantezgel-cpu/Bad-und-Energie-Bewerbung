import 'server-only';
import { z } from 'zod';

// Serverseitige Umgebungsvariablen. Jeder Zugriff liest process.env frisch
// (kein Modul-Cache), damit Vercel-Runtime-Env und Tests zuverlässig greifen.

export const DEFAULT_APP_URL = 'https://karriere.bad-energie.de';
const DEFAULT_NOTIFICATION_EMAIL = 'info@bad-energie.de';
const MIN_SECRET_LENGTH = 32;

const PLACEHOLDER_PATTERNS: readonly RegExp[] = [
  /^(?:my|your|dein|deine|example)[_-]/i,
  /^re_(?:1234|x{4,}|your|dein)/i,
  /placeholder/i,
  /^(?:changeme|change[_-]me|replace[_-]me|todo|tbd|x{3,}|\.{3}|…)$/i,
  /^<[^@<>]*>$/,
];

/** Leere Werte und offensichtliche Platzhalter aus .env.example gelten als nicht gesetzt. */
export function isPlaceholder(value: string | null | undefined): boolean {
  const trimmed = value?.trim() ?? '';
  return trimmed === '' || PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(trimmed));
}

const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess(
    (value) => (typeof value === 'string' && !isPlaceholder(value) ? value.trim() : undefined),
    schema.optional()
  );

const ADDRESS = String.raw`[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+`;
// „adresse@domain.de“ oder „Anzeigename <adresse@domain.de>“
const SENDER_PATTERN = new RegExp(`^(?:${ADDRESS}|[^<>]+<${ADDRESS}>)$`);
const secret = z.string().min(MIN_SECRET_LENGTH);

const serverEnvSchema = z.object({
  APP_URL: optional(z.url({ protocol: /^https?$/ })),
  RESEND_API_KEY: optional(z.string().regex(/^re_\S{8,}$/)),
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
});

export type ServerEnv = z.output<typeof serverEnvSchema>;
export type ServerEnvName = keyof ServerEnv;
export type SecretName = 'IP_HASH_SALT' | 'APPLICATION_TOKEN_SECRET';

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
  from?: string;
  notificationTo: string;
  /** Erzwingt Simulation (EMAIL_SIMULATION=true), nur wo emailSimulationAllowed() gilt. */
  forceSimulation: boolean;
  /** Fehlende oder ungültige Variablen, ohne die kein echter Versand möglich ist. */
  missing: Array<'RESEND_API_KEY' | 'RESEND_FROM_EMAIL'>;
}

let reportedEmailConfig = false;

/** Kein Ersatzabsender (auch nicht onboarding@resend.dev): ohne RESEND_FROM_EMAIL wird nur simuliert oder abgelehnt. */
export function getEmailConfig(): EmailConfig {
  const apiKey = readVar('RESEND_API_KEY').value;
  const from = readVar('RESEND_FROM_EMAIL').value;
  const notificationTo =
    readVar('CONTACT_NOTIFICATION_EMAIL').value ??
    readVar('RESEND_TO_EMAIL').value ??
    DEFAULT_NOTIFICATION_EMAIL;

  const missing: EmailConfig['missing'] = [];
  if (!apiKey) missing.push('RESEND_API_KEY');
  if (!from) missing.push('RESEND_FROM_EMAIL');

  if (missing.length > 0 && !emailSimulationAllowed() && !reportedEmailConfig) {
    reportedEmailConfig = true;
    console.error(`[env] E-Mail-Versand nicht konfiguriert, es fehlt: ${missing.join(', ')}`);
  }

  return {
    apiKey,
    from,
    notificationTo,
    forceSimulation: emailSimulationAllowed() && readVar('EMAIL_SIMULATION').value === 'true',
    missing,
  };
}

/**
 * HMAC-Geheimnisse (mind. 32 Zeichen). Fehlt der Wert oder ist er ungültig, gibt es den festen
 * Dev-Fallback nur, wo devSecretsAllowed() gilt; sonst (jeder Production-Build) wirft ein EnvError.
 */
export function getSecret(name: SecretName): string {
  const { value, invalid } = readVar(name);
  if (value) return value;
  if (!devSecretsAllowed()) throw new EnvError(name, invalid ? 'invalid' : 'missing');
  return `dev-only-${name.toLowerCase()}-not-for-production`;
}

/** Öffentlicher IndexNow-Schlüssel; ohne Wert ist das Einreichen deaktiviert. */
export function getIndexNowKey(): string | undefined {
  return readVar('INDEXNOW_KEY').value;
}

/** Bearer-Token für POST /api/indexnow. Ohne Wert bleibt der Endpunkt deaktiviert. */
export function getIndexNowSubmitToken(): string | undefined {
  return readVar('INDEXNOW_SUBMIT_TOKEN').value;
}

/** Variablen, ohne die diese Umgebung nicht korrekt arbeitet (abhängig von Simulation und Dev-Fallback). */
export function getRequiredServerEnv(): ServerEnvName[] {
  const required: ServerEnvName[] = [];
  if (!emailSimulationAllowed()) required.push('RESEND_API_KEY', 'RESEND_FROM_EMAIL');
  if (!devSecretsAllowed()) required.push('IP_HASH_SALT', 'APPLICATION_TOKEN_SECRET');
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

  return { ok: invalid.length === 0 && missing.length === 0, missing, invalid };
}

/**
 * Start-Check aus instrumentation.ts (ROADMAP §3.2): meldet eine unvollständige Konfiguration
 * einmal pro Serverstart und wirft bewusst nie, auch nicht auf Vercel Production. Ein fehlendes
 * Mail-Geheimnis darf nicht die ganze Karriereseite abschalten: Die Formular-APIs antworten mit
 * 503, und die UI bietet Telefon und WhatsApp an (ROADMAP §14.4).
 */
export function reportServerEnv(): { ok: boolean } {
  const { ok, missing, invalid } = checkServerEnv();
  if (ok) return { ok };

  const parts = [
    missing.length > 0 && `fehlt: ${missing.join(', ')}`,
    invalid.length > 0 && `ungültig: ${invalid.join(', ')}`,
  ].filter(Boolean);
  const scope = isVercelProduction() ? 'PRODUKTION – Bewerbungen werden abgelehnt (503)' : 'lokal';
  console.error(`[env] Server-Konfiguration unvollständig, ${scope} (${parts.join('; ')})`);
  return { ok };
}
