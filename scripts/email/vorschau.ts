#!/usr/bin/env bun
/**
 * Vorschau der Bewerbungs-Mails für Vorher-nachher-Bilder und den Blick in echte Mailprogramme: schreibt je Variante aus
 * lib/email/__tests__/fixtures.ts (MAIL_VARIANTEN) die HTML-Fassung, die Textfassung und eine .eml-Datei. Die .eml
 * öffnet Outlook (klassisch und neu), Apple Mail und Thunderbird per Doppelklick wie eine empfangene Mail und zeigt sie
 * mit der eigenen Darstellung des Programms (Word-Engine in Outlook). Fantasiedaten, nichts wird versendet.
 *
 *   bun run mail:vorschau                                   # nach _werkstatt/mails/vorschau/aktuell
 *   bun run mail:vorschau --aus _werkstatt/mails/vorschau/vorher
 *
 * Gibt je Variante die Größe von HTML und Text aus; über 90 000 Byte HTML warnt es (Gmail kürzt ab etwa 102 KB).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ABSENDER, MAIL_VARIANTEN, type MailVariante } from '../../lib/email/__tests__/fixtures';
import type { RenderedEmail } from '../../lib/email/templates';

const WURZEL = fileURLToPath(new URL('../../', import.meta.url));
const GRENZE_HTML = 90_000;
const CRLF = '\r\n';

function ziel(): string {
  const index = process.argv.indexOf('--aus');
  const wert = index >= 0 ? process.argv[index + 1] : undefined;
  return path.resolve(WURZEL, wert ?? '_werkstatt/mails/vorschau/aktuell');
}

/** Kopfzeile nach RFC 2047 (B-Kodierung): Stücke zu höchstens 39 Byte, damit jede Zeile unter 76 Zeichen bleibt. */
function kopf(text: string): string {
  if (/^[\x20-\x7e]*$/.test(text)) return text;
  const stuecke: string[] = [];
  let stueck = '';
  for (const zeichen of text) {
    if (Buffer.byteLength(stueck + zeichen, 'utf8') > 39) {
      stuecke.push(stueck);
      stueck = '';
    }
    stueck += zeichen;
  }
  if (stueck) stuecke.push(stueck);
  return stuecke.map((teil) => `=?UTF-8?B?${Buffer.from(teil, 'utf8').toString('base64')}?=`).join(`${CRLF} `);
}

/** Inhalt mit CRLF-Zeilenenden (RFC 2045 6.8) als base64 in Zeilen zu 76 Zeichen. */
function base64(text: string): string {
  const crlf = text.replace(/\r?\n/g, CRLF);
  return (Buffer.from(crlf, 'utf8').toString('base64').match(/.{1,76}/g) ?? []).join(CRLF);
}

/** multipart/alternative mit Text- und HTML-Teil; feste Kopfdaten, damit die Dateien reproduzierbar sind. */
function eml(variante: MailVariante, mail: RenderedEmail): string {
  const grenze = `=_vorschau_${variante.name}`;
  return [
    `From: ${ABSENDER}`,
    `To: ${variante.to}`,
    ...(variante.replyTo ? [`Reply-To: ${variante.replyTo}`] : []),
    `Subject: ${kopf(mail.subject)}`,
    'Date: Thu, 08 Oct 2026 14:05:00 +0200',
    `Message-ID: <vorschau.${variante.name}@karriere.bad-energie.de>`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${grenze}"`,
    '',
    `--${grenze}`,
    'Content-Type: text/plain; charset=utf-8',
    'Content-Transfer-Encoding: base64',
    '',
    base64(mail.text),
    `--${grenze}`,
    'Content-Type: text/html; charset=utf-8',
    'Content-Transfer-Encoding: base64',
    '',
    base64(mail.html),
    `--${grenze}--`,
    '',
  ].join(CRLF);
}

const ordner = ziel();
mkdirSync(ordner, { recursive: true });

let zuGross = 0;
for (const variante of MAIL_VARIANTEN) {
  const mail = variante.render();
  writeFileSync(path.join(ordner, `${variante.name}.html`), mail.html);
  writeFileSync(path.join(ordner, `${variante.name}.txt`), mail.text);
  writeFileSync(path.join(ordner, `${variante.name}.eml`), eml(variante, mail));
  const html = Buffer.byteLength(mail.html, 'utf8');
  const text = Buffer.byteLength(mail.text, 'utf8');
  const warnung = html > GRENZE_HTML ? '  WARNUNG: über 90 000 Byte (Gmail kürzt ab etwa 102 KB)' : '';
  if (warnung) zuGross += 1;
  console.log(`${variante.name.padEnd(18)} HTML ${String(html).padStart(6)} B   Text ${String(text).padStart(6)} B${warnung}`);
}
console.log(`\n${MAIL_VARIANTEN.length} Varianten in ${path.relative(WURZEL, ordner)}`);
if (zuGross > 0) process.exitCode = 1;
