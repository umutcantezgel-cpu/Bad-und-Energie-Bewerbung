import { COMPANY } from '@/lib/content/company';
import { escapeHTML } from '@/lib/utils/sanitize';

/**
 * E-Mail-Layout im Design der Website (Einstieg der Startseite, KERN K-006): Wand als Grund, ein
 * Navy-Kopf mit Wortmarke, darunter die rote Vorlauf-Linie, die Karte auf Papier und am Ende der
 * blaue Rücklauf. Rot steht nur als Linie (Vorlauf, auch als Zuleitung in den Knopf), der Knopf
 * selbst ist Navy. Überschriften Navy, Text Tinte. Systemschriften (keine Webfonts in Mails),
 * keine Bilder, kein Versal-Text. E-Mail-Clients kennen kein Tailwind und keine CSS-Variablen,
 * deshalb stehen die Farben hier als Inline-Hex (Primitiven aus app/styles/theme.css, hell; Mails
 * erklären sich nur hell).
 *
 * Vorlagen beschreiben ihren Inhalt als Blöcke (renderEmail); daraus entstehen HTML und die
 * Textfassung. Alle Texte werden hier escaped, Vorlagen geben nur Rohtext hinein.
 */

export const EMAIL_COLORS = Object.freeze({
  /** Wand: Grund um die Karte. */
  page: '#F1E9DB',
  /** Papier: die Karte. */
  card: '#FBF7F0',
  /** Wand: Notizen, Zitate, Felder. */
  subtle: '#F1E9DB',
  ink: '#111A3B',
  muted: '#454C78',
  line: '#DDD3C2',
  /** Navy: Kopf, Überschriften, Knopf. */
  brand: '#111D6D',
  onBrand: '#FFFFFF',
  onBrandMuted: '#B9C0E8',
  /** Rot: nur Vorlauf-Linie. */
  accent: '#D60000',
  /** Blau: Rücklauf-Linie. */
  ruecklauf: '#1F57C4',
  onAccent: '#FFFFFF',
  success: '#05664A',
  successSubtle: '#E3F0E6',
  danger: '#B42318',
  dangerSubtle: '#FBE6E1',
});

const C = EMAIL_COLORS;
/**
 * Segoe UI zuerst: Outlook für Windows nimmt nur die erste Familie und fiele bei unbekanntem `-apple-system` auf Times
 * New Roman zurück. Apple und Android haben kein Segoe UI und landen bei ihrer Systemschrift.
 */
const FONT = "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif";
/** Reserve nur für Outlook (Word-Engine), im bedingten Kommentar im Kopf. */
const FONT_MSO = "'Segoe UI', Arial, sans-serif";
/** Strichstärke der Leitungen wie auf der Website (--m-strich). */
const STRICH = 3;
/** Breite der Karte; Outlook bekommt sie als fester Rahmen, alle anderen als max-width. */
const BREITE = 600;
/** Füllzeichen hinter dem Vorschautext, damit die Postfachliste nicht den Anfang der Mail anhängt. */
const VORSCHAU_FUELLER = '&zwnj;&nbsp;'.repeat(90);

/**
 * Zeilenhöhe in px; `exactly` hält Outlook bei genau diesem Wert. Nie an `<a>`-Knöpfen oder an Zellen, die einen Knopf
 * enthalten (dort verschiebt `exactly` die Höhe).
 */
function lh(px: number): string {
  return `line-height: ${px}px; mso-line-height-rule: exactly;`;
}

/** Lange Wörter ohne Bruchstelle (Adressen, Links, Kennungen) umbrechen statt die Mail zu verbreitern. */
const UMBRUCH = 'word-break: break-word; overflow-wrap: break-word;';

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
  /** Gerahmter Block mit Titel, z. B. „Ergänzung“ in der Team-Mail (E-BEW-015). */
  | { type: 'panel'; title: string; blocks: EmailBlockInput[] }
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

const P = `margin: 0 0 16px 0; font-size: 16px; ${lh(24)} color: ${C.ink};`;
const P_LEISE = `margin: 0 0 16px 0; font-size: 15px; ${lh(22)} color: ${C.muted};`;
const LINK = `color: ${C.brand}; text-decoration: underline;`;
/** Etikett: kleine, gesperrte Zeile in Navy (wie text-etikett, ohne Versalien). */
const ETIKETT = `font-size: 13px; ${lh(18)} font-weight: 700; letter-spacing: 0.06em; color: ${C.brand};`;

function linkHtml(href: string | undefined | null, label: string): string {
  const safe = safeHref(href);
  return safe ? `<a href="${esc(safe)}" style="${LINK}">${esc(label)}</a>` : esc(label);
}

/** Eine Leitung als Tabellenzeile (Outlook-fest): Höhe = Strich, Farbe als Fläche, auch als Attribut. */
function lineRow(color: string): string {
  return `<tr><td height="${STRICH}" bgcolor="${color}" style="height: ${STRICH}px; font-size: ${STRICH}px; ${lh(STRICH)} background-color: ${color};">&nbsp;</td></tr>`;
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
        <td valign="top" style="padding: 10px 16px 10px 0; width: 38%; font-size: 14px; ${lh(20)} color: ${C.muted}; word-break: normal; hyphens: auto; -webkit-hyphens: auto; ${border}">${esc(row.label)}</td>
        <td valign="top" style="padding: 10px 0; font-size: 15px; ${lh(22)} color: ${C.ink}; font-variant-numeric: tabular-nums; ${UMBRUCH} ${border}">${main}${extra ? `<br><span style="font-size: 14px;">${extra}</span>` : ''}</td>
      </tr>`;
    })
    .join('');
  return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 20px 0; border-collapse: collapse;">${cells}</table>`;
}

function blockHtml(block: EmailBlock): string {
  switch (block.type) {
    case 'title':
      return `<h1 style="margin: 0 0 12px 0; font-size: 26px; ${lh(32)} font-weight: 800; letter-spacing: -0.01em; color: ${C.brand};">${esc(block.text)}</h1>`;
    case 'heading':
      return `<h2 style="margin: 28px 0 8px 0; font-size: 17px; ${lh(22)} font-weight: 700; color: ${C.brand};">${esc(block.text)}</h2>`;
    case 'paragraph':
      return `<p style="${block.muted ? P_LEISE : P}">${escMultiline(block.text)}</p>`;
    case 'rows':
      return rowsHtml(block.rows);
    case 'list': {
      const items = block.items.filter(present);
      if (items.length === 0) return '';
      return `<ul style="margin: 0 0 20px 0; padding: 0 0 0 20px; color: ${C.ink};">${items
        .map((item) => `<li style="margin: 0 0 8px 0; font-size: 15px; ${lh(22)}">${escMultiline(item)}</li>`)
        .join('')}</ul>`;
    }
    case 'steps': {
      const rows = block.steps
        .map((step, index) => {
          const marker = step.done
            ? `<span style="display: inline-block; width: 28px; height: 28px; ${lh(28)} border-radius: 14px; background-color: ${C.successSubtle}; color: ${C.success}; font-size: 15px; font-weight: 700; text-align: center;">&#10003;</span>`
            : `<span style="display: inline-block; width: 24px; height: 24px; ${lh(24)} border: 2px solid ${C.brand}; border-radius: 14px; background-color: ${C.card}; color: ${C.brand}; font-size: 14px; font-weight: 700; text-align: center;">${index + 1}</span>`;
          const status = step.done ? ` <span style="color: ${C.success}; font-weight: 700;">· Erledigt</span>` : '';
          return `<tr>
            <td valign="top" style="padding: 0 14px 16px 0; width: 28px;">${marker}</td>
            <td valign="top" style="padding: 2px 0 16px 0;">
              <div style="font-size: 16px; ${lh(22)} font-weight: 700; color: ${C.brand};">${esc(step.title)}${status}</div>
              ${present(step.text) ? `<div style="margin-top: 4px; font-size: 15px; ${lh(22)} color: ${C.muted};">${esc(step.text)}</div>` : ''}
            </td>
          </tr>`;
        })
        .join('');
      return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 8px 0;">${rows}</table>`;
    }
    case 'button': {
      const href = safeHref(block.href);
      if (!href) return '';
      // Wie im Einstieg: Die rote Vorlauf-Linie läuft in den Knopf; der Knopf selbst ist Navy.
      return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 4px 0 24px 0;"><tr>
        <td valign="middle" style="width: 28px; padding: 0;"><div style="height: ${STRICH}px; ${lh(STRICH)} font-size: 0; background-color: ${C.accent};">&nbsp;</div></td>
        <td style="border-radius: 4px; background-color: ${C.brand}; color: ${C.onBrand};">
          <a href="${esc(href)}" style="display: inline-block; padding: 14px 24px; font-size: 16px; line-height: 1.2; font-weight: 700; color: ${C.onBrand}; text-decoration: none; border-radius: 4px;">${esc(block.label)}</a>
        </td>
      </tr></table>`;
    }
    case 'note': {
      const danger = block.tone === 'danger';
      return `<div style="margin: 0 0 20px 0; padding: 14px 16px; border-radius: 4px; border-left: ${STRICH}px solid ${danger ? C.danger : C.brand}; background-color: ${danger ? C.dangerSubtle : C.subtle}; color: ${danger ? C.danger : C.ink}; font-size: 15px; ${lh(22)}">${escMultiline(block.text)}</div>`;
    }
    case 'quote':
      return `<div style="margin: 0 0 20px 0; padding: 14px 16px; border-radius: 4px; border-left: ${STRICH}px solid ${C.brand}; background-color: ${C.subtle}; color: ${C.ink}; font-size: 15px; ${lh(24)}">${escMultiline(block.text)}</div>`;
    case 'panel': {
      const inner = block.blocks.filter(isBlock).map(blockHtml).filter(Boolean).join('\n');
      if (!inner) return '';
      return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 8px 0 24px 0; border-collapse: separate; border: 1px solid ${C.line}; border-radius: 4px;">
        ${lineRow(C.ruecklauf)}
        <tr><td style="padding: 16px 18px 0 18px; ${ETIKETT}">${esc(block.title)}</td></tr>
        <tr><td style="padding: 8px 18px 0 18px;">${inner}</td></tr>
      </table>`;
    }
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
    case 'panel': {
      const inner = block.blocks.filter(isBlock).map(blockText).filter(present).join('\n\n');
      return inner ? `${block.title}\n${'='.repeat(Math.min(block.title.length, 40))}\n${inner}` : '';
    }
    case 'divider':
      return '---';
  }
}

// ---------------------------------------------------------------------------
// Rahmen
// ---------------------------------------------------------------------------

/**
 * Pflichtangaben im Fuß jeder Mail (E-BEW-025, Vermutung § 35a GmbHG): Firma, Anschrift,
 * Geschäftsführer und Register, aus denselben Stammdaten wie das Impressum (LEGAL_ENTITY in
 * components/legal/legal-data.ts liest COMPANY), dort „Geschäftsführung“, „Registergericht“ und
 * „Registernummer“.
 */
export function footerLines(): string[] {
  const { address } = COMPANY;
  return [
    COMPANY.legalName,
    `${address.street} · ${address.postalCode} ${address.city}`,
    `Telefon ${COMPANY.phone.display} · ${COMPANY.email}`,
    `Geschäftsführer: ${COMPANY.managingDirector.fullName}`,
    `Registergericht: ${COMPANY.register.court} · Registernummer: ${COMPANY.register.number}`,
    COMPANY.innung,
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

/**
 * Rahmen: Navy-Kopf mit Wortmarke und Ortsmarke, rote Vorlauf-Linie, Karte auf Papier, blaue
 * Rücklauf-Linie, darunter die Pflichtangaben auf der Wand. Tabellenbasiert für Outlook und Gmail.
 *
 * Alles Wichtige steht inline, weil GMX, WEB.DE und die Gmail-App mit fremden Konten den `<style>`-Block entfernen;
 * der Kopf-Style bringt nur das breitere Polster am Desktop. Outlook für Windows bekommt einen festen 600-px-Rahmen
 * (ignoriert max-width), 96 dpi (sonst wächst die Karte bei 125/150 % Skalierung) und keine „erweiterte Typografie“
 * (Blocksatz mit Silbentrennung im Lesebereich). Mails bleiben hell („light only“, Gmail-Apps und Apple Mail).
 * Der Reset für die Datenerkennung von Apple steht in einem eigenen `<style>`: Gmail verwirft einen Block mit
 * Attributselektor ganz und nähme sonst das Desktop-Polster mit.
 */
export function emailLayout({ title, preheader, eyebrow, badge, contentHtml, footerNote }: EmailLayoutOptions): string {
  const kicker = eyebrow ?? badge;
  const footer = footerLines()
    .map(
      (line, index) =>
        `<p style="margin: 0 0 4px 0; font-size: 13px; ${lh(20)} color: ${index === 0 ? C.brand : C.muted};${index === 0 ? ' font-weight: 700;' : ''}">${esc(line)}</p>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="de" dir="ltr" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting" content="true">
  <meta name="format-detection" content="date=no, address=no">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light only">
  <title>${title}</title>
  <!--[if mso]>
  <noscript><xml>
    <o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings>
    <w:WordDocument><w:DontUseAdvancedTypographyReadingMail/></w:WordDocument>
  </xml></noscript>
  <style>table, td, div, p, a, span, h1, h2, li { font-family: ${FONT_MSO} !important; }</style>
  <![endif]-->
  <style>
    body { margin: 0; padding: 0; width: 100%; background-color: ${C.page}; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    a { color: ${C.brand}; }
    @media only screen and (min-width: 640px) {
      .kopf { padding: 20px 36px !important; }
      .karte { padding: 32px 36px 36px 36px !important; }
    }
  </style>
  <style>
    :root { color-scheme: light only; supported-color-schemes: light only; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
  </style>
</head>
<body style="margin: 0; padding: 0; width: 100%; background-color: ${C.page};">
<div role="article" aria-roledescription="E-Mail" aria-label="${title}" lang="de" dir="ltr" style="font-family: ${FONT}; color: ${C.ink}; background-color: ${C.page};">
  <div style="display: none; max-height: 0; max-width: 0; overflow: hidden; opacity: 0; font-size: 1px; ${lh(1)} color: ${C.page}; mso-hide: all;">${preheader}${VORSCHAU_FUELLER}</div>
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="${C.page}" style="background-color: ${C.page};">
    <tr>
      <td align="center" style="padding: 24px 8px 32px 8px;">
        <!--[if mso]><table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="${BREITE}" style="width: ${BREITE}px;"><tr><td><![endif]-->
        <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: ${BREITE}px; border-collapse: separate; font-family: ${FONT};">
          <tr>
            <td class="kopf" bgcolor="${C.brand}" style="padding: 18px 24px; background-color: ${C.brand}; border-radius: 4px 4px 0 0;">
              <p style="margin: 0; font-size: 19px; ${lh(24)} font-weight: 800; letter-spacing: -0.01em; color: ${C.onBrand};">${esc(COMPANY.shortName)} <span style="font-weight: 400; color: ${C.onBrandMuted};">· Karriere</span></p>
              <p style="margin: 4px 0 0 0; font-size: 12px; ${lh(16)} font-weight: 700; letter-spacing: 0.06em; color: ${C.onBrandMuted};">Seit ${COMPANY.foundingYear} · ${esc(COMPANY.address.city)}</p>
            </td>
          </tr>
          ${lineRow(C.accent)}
          <tr>
            <td class="karte" bgcolor="${C.card}" style="padding: 28px 24px 32px 24px; background-color: ${C.card}; border-left: 1px solid ${C.line}; border-right: 1px solid ${C.line}; ${UMBRUCH}">
              ${kicker ? `<p style="margin: 0 0 10px 0; ${ETIKETT}">${esc(kicker)}</p>` : ''}
              ${contentHtml}
            </td>
          </tr>
          ${lineRow(C.ruecklauf)}
          <tr>
            <td style="padding: 24px 4px 0 4px;">
              ${footer}
              ${footerNote ? `<p style="margin: 12px 0 0 0; font-size: 13px; ${lh(20)} color: ${C.muted};">${esc(footerNote)}</p>` : ''}
            </td>
          </tr>
        </table>
        <!--[if mso]></td></tr></table><![endif]-->
      </td>
    </tr>
  </table>
</div>
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

  // Der Vorschautext steht auch vorn in der Textfassung: Die Android-Apps von GMX, WEB.DE, mail.com und 1&1 zeigen die
  // Vorschau aus dem Text-Teil.
  const textParts = [
    preheader,
    eyebrow,
    ...visible.map(blockText),
    `--\n${footerLines().join('\n')}`,
    footerNote,
  ].filter((part): part is string => present(part));
  const text = `${textParts.join('\n\n').replace(/\n{3,}/g, '\n\n').trim()}\n`;

  return { subject: cleanTitle, html, text };
}
