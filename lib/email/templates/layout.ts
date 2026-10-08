import { COMPANY } from '@/lib/content/company';
import { escapeHTML } from '@/lib/utils/sanitize';

/**
 * E-Mail-Layout im ruhigen Stil der Website (ROADMAP §4): helle Fläche, Ink-Schrift, eine
 * Primäraktion in Crimson, keine Bilder, kein Versal-Text. E-Mail-Clients kennen kein Tailwind,
 * deshalb stehen die Farben hier als Inline-Hex (Werte aus app/styles/theme.css, Light Mode).
 *
 * Vorlagen beschreiben ihren Inhalt als Blöcke (renderEmail); daraus entstehen HTML und die
 * Textfassung. Alle Texte werden hier escaped, Vorlagen geben nur Rohtext hinein.
 */

export const EMAIL_COLORS = Object.freeze({
  page: '#F5F6F8',
  card: '#FFFFFF',
  subtle: '#F5F6F8',
  ink: '#0A1E3A',
  muted: '#5F6878',
  line: '#E3E6EB',
  accent: '#C51E1E',
  onAccent: '#FFFFFF',
  success: '#047857',
  successSubtle: '#E8F5EF',
  danger: '#B42318',
  dangerSubtle: '#FDECEA',
});

const C = EMAIL_COLORS;
const FONT = "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export interface EmailLink {
  href: string;
  label: string;
}

export interface EmailRow {
  label: string;
  /** Leere Werte (undefined, null, '') lassen die Zeile weg. */
  value?: string | null;
  href?: string;
  /** Zusätzliche Links hinter dem Wert, z. B. „WhatsApp“ neben der Telefonnummer. */
  links?: EmailLink[];
  /** Zeilenumbrüche im Wert beibehalten. */
  multiline?: boolean;
}

export interface EmailStep {
  title: string;
  text?: string;
  done?: boolean;
}

export type EmailBlock =
  | { type: 'title'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string; muted?: boolean }
  | { type: 'rows'; rows: EmailRow[] }
  | { type: 'list'; items: string[] }
  | { type: 'steps'; steps: EmailStep[] }
  | { type: 'button'; href: string; label: string }
  | { type: 'note'; text: string; tone?: 'danger' | 'neutral' }
  | { type: 'quote'; text: string }
  | { type: 'divider' };

export type EmailBlockInput = EmailBlock | false | null | undefined;

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export interface RenderEmailOptions {
  subject: string;
  preheader: string;
  /** Kleine Zeile über dem Inhalt, z. B. „Team-Benachrichtigung“. */
  eyebrow?: string;
  blocks: EmailBlockInput[];
  /** Schlusszeile unter dem Impressum, z. B. warum jemand die Mail bekommt. */
  footerNote?: string;
}

// ---------------------------------------------------------------------------
// Hilfen
// ---------------------------------------------------------------------------

export const esc = escapeHTML;

/** Escaped und Zeilenumbrüche als <br>. */
export function escMultiline(value: string): string {
  return esc(value.replace(/\r\n?/g, '\n')).replace(/\n/g, '<br>');
}

/** Betreff: einzeilig, ohne Steuerzeichen (verhindert Header-Injection), höchstens 200 Zeichen. */
export function cleanSubject(value: string): string {
  return value.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200);
}

/** Nur http(s), mailto und tel; alles andere wird nicht verlinkt. */
export function safeHref(href: string | undefined | null): string | null {
  if (!href) return null;
  const value = href.trim();
  return /^(?:https?:\/\/|mailto:|tel:)/i.test(value) ? value : null;
}

function present(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

const BERLIN_DATE_TIME = new Intl.DateTimeFormat('de-DE', {
  timeZone: 'Europe/Berlin',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

/** „08.10.2026, 14:05 Uhr“ (Europe/Berlin). */
export function formatBerlinDateTime(date: Date): string {
  return `${BERLIN_DATE_TIME.format(date)} Uhr`;
}

// ---------------------------------------------------------------------------
// HTML
// ---------------------------------------------------------------------------

const P = `margin: 0 0 16px 0; font-size: 16px; line-height: 1.55; color: ${C.ink};`;
const LINK = `color: ${C.ink}; text-decoration: underline;`;

function linkHtml(href: string | undefined | null, label: string): string {
  const safe = safeHref(href);
  return safe ? `<a href="${esc(safe)}" style="${LINK}">${esc(label)}</a>` : esc(label);
}

function rowsHtml(rows: EmailRow[]): string {
  const visible = rows.filter((row) => present(row.value));
  if (visible.length === 0) return '';
  const cells = visible
    .map((row, index) => {
      const value = row.value as string;
      const main = safeHref(row.href)
        ? linkHtml(row.href, value)
        : row.multiline
          ? escMultiline(value)
          : esc(value);
      const extra = (row.links ?? [])
        .filter((link) => safeHref(link.href))
        .map((link) => linkHtml(link.href, link.label))
        .join(' · ');
      const border = index === visible.length - 1 ? '' : `border-bottom: 1px solid ${C.line};`;
      return `<tr>
        <td valign="top" style="padding: 10px 16px 10px 0; width: 38%; font-size: 14px; line-height: 1.45; color: ${C.muted}; ${border}">${esc(row.label)}</td>
        <td valign="top" style="padding: 10px 0; font-size: 15px; line-height: 1.45; color: ${C.ink}; font-variant-numeric: tabular-nums; ${border}">${main}${extra ? `<br><span style="font-size: 14px;">${extra}</span>` : ''}</td>
      </tr>`;
    })
    .join('');
  return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 20px 0; border-collapse: collapse;">${cells}</table>`;
}

function blockHtml(block: EmailBlock): string {
  switch (block.type) {
    case 'title':
      return `<h1 style="margin: 0 0 12px 0; font-size: 24px; line-height: 1.25; font-weight: 600; letter-spacing: -0.01em; color: ${C.ink};">${esc(block.text)}</h1>`;
    case 'heading':
      return `<h2 style="margin: 28px 0 8px 0; font-size: 17px; line-height: 1.3; font-weight: 600; color: ${C.ink};">${esc(block.text)}</h2>`;
    case 'paragraph':
      return `<p style="${P}${block.muted ? ` color: ${C.muted}; font-size: 15px;` : ''}">${escMultiline(block.text)}</p>`;
    case 'rows':
      return rowsHtml(block.rows);
    case 'list': {
      const items = block.items.filter(present);
      if (items.length === 0) return '';
      return `<ul style="margin: 0 0 20px 0; padding: 0 0 0 20px; color: ${C.ink};">${items
        .map((item) => `<li style="margin: 0 0 8px 0; font-size: 15px; line-height: 1.5;">${escMultiline(item)}</li>`)
        .join('')}</ul>`;
    }
    case 'steps': {
      const rows = block.steps
        .map((step, index) => {
          const marker = step.done
            ? `<span style="display: inline-block; width: 28px; height: 28px; line-height: 28px; border-radius: 14px; background-color: ${C.successSubtle}; color: ${C.success}; font-size: 15px; font-weight: 600; text-align: center;">&#10003;</span>`
            : `<span style="display: inline-block; width: 28px; height: 28px; line-height: 28px; border-radius: 14px; background-color: ${C.subtle}; color: ${C.ink}; font-size: 14px; font-weight: 600; text-align: center;">${index + 1}</span>`;
          const status = step.done ? ` <span style="color: ${C.success}; font-weight: 500;">· Erledigt</span>` : '';
          return `<tr>
            <td valign="top" style="padding: 0 14px 16px 0; width: 28px;">${marker}</td>
            <td valign="top" style="padding: 2px 0 16px 0;">
              <div style="font-size: 16px; line-height: 1.4; font-weight: 600; color: ${C.ink};">${esc(step.title)}${status}</div>
              ${present(step.text) ? `<div style="margin-top: 4px; font-size: 15px; line-height: 1.5; color: ${C.muted};">${esc(step.text)}</div>` : ''}
            </td>
          </tr>`;
        })
        .join('');
      return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 8px 0;">${rows}</table>`;
    }
    case 'button': {
      const href = safeHref(block.href);
      if (!href) return '';
      return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 4px 0 24px 0;"><tr>
        <td style="border-radius: 10px; background-color: ${C.accent};">
          <a href="${esc(href)}" style="display: inline-block; padding: 14px 24px; font-size: 16px; line-height: 1.2; font-weight: 600; color: ${C.onAccent}; text-decoration: none; border-radius: 10px;">${esc(block.label)}</a>
        </td>
      </tr></table>`;
    }
    case 'note': {
      const danger = block.tone === 'danger';
      return `<div style="margin: 0 0 20px 0; padding: 14px 16px; border-radius: 10px; background-color: ${danger ? C.dangerSubtle : C.subtle}; color: ${danger ? C.danger : C.ink}; font-size: 15px; line-height: 1.5;">${escMultiline(block.text)}</div>`;
    }
    case 'quote':
      return `<div style="margin: 0 0 20px 0; padding: 16px; border-radius: 10px; background-color: ${C.subtle}; color: ${C.ink}; font-size: 15px; line-height: 1.6;">${escMultiline(block.text)}</div>`;
    case 'divider':
      return `<div style="margin: 24px 0; border-top: 1px solid ${C.line}; line-height: 0; font-size: 0;">&nbsp;</div>`;
  }
}

// ---------------------------------------------------------------------------
// Text
// ---------------------------------------------------------------------------

function rowText(row: EmailRow): string | null {
  if (!present(row.value)) return null;
  const href = safeHref(row.href);
  const value = row.value.replace(/\r\n?/g, '\n');
  const showHref = href && !href.startsWith('tel:') && !href.startsWith('mailto:') && href !== value;
  const head = row.multiline && value.includes('\n') ? `${row.label}:\n${value}` : `${row.label}: ${value}`;
  const links = (row.links ?? [])
    .filter((link) => safeHref(link.href))
    .map((link) => `  ${link.label}: ${link.href}`);
  return [showHref ? `${head} (${href})` : head, ...links].join('\n');
}

function blockText(block: EmailBlock): string {
  switch (block.type) {
    case 'title':
      return block.text;
    case 'heading':
      return `${block.text}\n${'-'.repeat(Math.min(block.text.length, 40))}`;
    case 'paragraph':
    case 'note':
    case 'quote':
      return block.text.replace(/\r\n?/g, '\n');
    case 'rows':
      return block.rows.map(rowText).filter((line): line is string => line !== null).join('\n');
    case 'list':
      return block.items
        .filter(present)
        .map((item) => `- ${item.replace(/\r\n?/g, '\n').replace(/\n/g, '\n  ')}`)
        .join('\n');
    case 'steps':
      return block.steps
        .map((step, index) => `${index + 1}. ${step.title}${step.done ? ' (erledigt)' : ''}${present(step.text) ? `\n   ${step.text}` : ''}`)
        .join('\n');
    case 'button':
      return safeHref(block.href) ? `${block.label}: ${block.href}` : '';
    case 'divider':
      return '---';
  }
}

// ---------------------------------------------------------------------------
// Rahmen
// ---------------------------------------------------------------------------

function footerLines(): string[] {
  const { address } = COMPANY;
  return [
    COMPANY.legalName,
    `${address.street} · ${address.postalCode} ${address.city}`,
    `Telefon ${COMPANY.phone.display} · ${COMPANY.email}`,
    `${COMPANY.register.full} · ${COMPANY.innung}`,
  ];
}

export interface EmailLayoutOptions {
  /** Bereits HTML-sicher (escaped). */
  title: string;
  /** Bereits HTML-sicher (escaped). */
  preheader: string;
  /** Kleine Zeile über dem Inhalt (Rohtext, wird escaped). */
  eyebrow?: string;
  /** Alter Name von `eyebrow` (Kontaktvorlagen). */
  badge?: string;
  /** Fertiges, sicheres HTML. */
  contentHtml: string;
  /** Rohtext, wird escaped. */
  footerNote?: string;
}

/** Rahmen aus Kopfzeile, Karte und Impressum. Tabellenbasiert für Outlook und Gmail. */
export function emailLayout({ title, preheader, eyebrow, badge, contentHtml, footerNote }: EmailLayoutOptions): string {
  const kicker = eyebrow ?? badge;
  const footer = footerLines()
    .map((line, index) => `<p style="margin: 0 0 4px 0;${index === 0 ? ` color: ${C.ink}; font-weight: 600;` : ''}">${esc(line)}</p>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: ${C.page}; -webkit-text-size-adjust: 100%; }
    table, td { border-collapse: collapse; }
    a { color: ${C.ink}; }
    @media only screen and (max-width: 600px) {
      .card { padding: 24px 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${C.page}; font-family: ${FONT}; color: ${C.ink};">
  <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; font-size: 1px; line-height: 1px; color: ${C.page};">${preheader}</div>
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${C.page};">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
          <tr>
            <td style="padding: 0 4px 16px 4px; font-family: ${FONT}; font-size: 17px; font-weight: 600; letter-spacing: -0.01em; color: ${C.ink};">
              ${esc(COMPANY.shortName)} <span style="font-weight: 400; color: ${C.muted};">· Karriere</span>
            </td>
          </tr>
          <tr>
            <td class="card" style="padding: 36px; background-color: ${C.card}; border: 1px solid ${C.line}; border-radius: 20px; font-family: ${FONT};">
              ${kicker ? `<p style="margin: 0 0 8px 0; font-size: 13px; line-height: 1.4; color: ${C.muted};">${esc(kicker)}</p>` : ''}
              ${contentHtml}
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 4px 0 4px; font-family: ${FONT}; font-size: 13px; line-height: 1.5; color: ${C.muted};">
              ${footer}
              ${footerNote ? `<p style="margin: 12px 0 0 0;">${esc(footerNote)}</p>` : ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function isBlock(block: EmailBlockInput): block is EmailBlock {
  return Boolean(block);
}

/** Baut Betreff, HTML und Textfassung aus denselben Blöcken. */
export function renderEmail({ subject, preheader, eyebrow, blocks, footerNote }: RenderEmailOptions): RenderedEmail {
  const visible = blocks.filter(isBlock);
  const cleanTitle = cleanSubject(subject);
  const contentHtml = visible.map(blockHtml).filter(Boolean).join('\n');
  const html = emailLayout({ title: esc(cleanTitle), preheader: esc(preheader), eyebrow, contentHtml, footerNote });

  const textParts = [
    eyebrow,
    ...visible.map(blockText),
    `--\n${footerLines().join('\n')}`,
    footerNote,
  ].filter((part): part is string => present(part));
  const text = `${textParts.join('\n\n').replace(/\n{3,}/g, '\n\n').trim()}\n`;

  return { subject: cleanTitle, html, text };
}
