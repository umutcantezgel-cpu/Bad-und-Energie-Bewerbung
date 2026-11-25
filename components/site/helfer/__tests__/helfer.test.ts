import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { HELFER_BILDER, OHNE_HELFER, helferSichtbar } from '../seiten';
import { DATEN } from '../spiel/daten';
import { TEXTE } from '../spiel/spiel';
import { LICHT_STIL, SCHATTEN_STIL } from '../spiel/stil';

const WURZEL = process.cwd();
const ORDNER = path.join(WURZEL, 'components/site/helfer');
const lies = (datei: string) => readFileSync(path.join(WURZEL, datei), 'utf8');
/** Alle Quelldateien des Bausteins, die im Browser landen. */
const BROWSER_DATEIEN = ['HelferInsel.tsx', 'seiten.ts', ...readdirSync(path.join(ORDNER, 'spiel')).map((d) => `spiel/${d}`)];

describe('Helfer: wo er auftritt', () => {
  it('steht auf Erzähl- und Listenseiten', () => {
    for (const pfad of ['/', '/index', '/jobs', '/jobs/anlagenmechaniker-shk-wetzlar', '/arbeiten-bei-uns', '/einsatzgebiet/herborn', null, undefined]) {
      expect(helferSichtbar(pfad), String(pfad)).toBe(true);
    }
  });

  it('fehlt im Bewerbungsweg und auf den Rechtsseiten', () => {
    for (const pfad of ['/bewerbung', '/bewerbung/', '/bewerbung/danke', '/bewerbung/mappe', '/bewerbung/variante/x/y', '/impressum', '/datenschutz', '/datenschutz?x=1']) {
      expect(helferSichtbar(pfad), pfad).toBe(false);
    }
    expect(OHNE_HELFER).toEqual(['/impressum', '/datenschutz']);
  });
});

describe('Helfer: Einbau in den Rahmen', () => {
  const layout = lies('app/layout.tsx');

  it('hängt genau einmal im Wurzel-Layout, nach der Wärmefront und außerhalb von main', () => {
    expect(layout.match(/<Helfer \/>/g)).toHaveLength(1);
    expect(layout.indexOf('<Helfer />')).toBeGreaterThan(layout.indexOf('<Waermefront />'));
    expect(layout.indexOf('<Helfer />')).toBeGreaterThan(layout.indexOf('</main>'));
    expect(layout.indexOf('<Helfer />')).toBeGreaterThan(layout.indexOf('</ToastProvider>'));
  });

  it('die Insel beginnt mit use client und lädt das Spiel erst nach', () => {
    const insel = lies('components/site/helfer/HelferInsel.tsx');
    expect(insel.startsWith("'use client';")).toBe(true);
    expect(insel).toContain("import('./spiel/start')");
    expect(insel).not.toMatch(/from '\.\/spiel\//);
    expect(insel).toContain('OHNE_UEBERLAGERUNG');
  });

  it('kein Browser-Teil zieht cn(), zod, SITE_CONFIG oder Kontaktdaten ins Bündel', () => {
    for (const datei of BROWSER_DATEIEN) {
      const quelle = lies(`components/site/helfer/${datei}`);
      expect(quelle, datei).not.toMatch(/tailwind-merge|utils\/cn|from 'zod'|seo\/site-config|lib\/content\/company|lib\/data\/contact/);
      expect(quelle, datei).not.toMatch(/wa\.me|api\.whatsapp\.com/);
    }
  });

  it('der WhatsApp-Link kommt fertig vom Server, mit dem allgemeinen Text', () => {
    const huelle = lies('components/site/helfer/Helfer.tsx');
    expect(huelle).not.toContain("'use client'");
    expect(huelle).toContain("buildWhatsAppUrl(whatsAppMessageFor('/'))");
  });
});

describe('Helfer: Bilder', () => {
  const ordner = path.join(WURZEL, 'public', HELFER_BILDER);

  it('jede Ebene aus den Daten liegt als WebP im versionierten Ordner', () => {
    expect(HELFER_BILDER).toMatch(/^\/helfer\/v\d+\/$/);
    for (const name of [...Object.keys(DATEN.ebenen), 'mini']) expect(existsSync(path.join(ordner, `${name}.webp`)), name).toBe(true);
  });

  it('im Ordner liegt nichts Überzähliges', () => {
    const erwartet = [...Object.keys(DATEN.ebenen), 'mini'].map((n) => `${n}.webp`).sort();
    expect(readdirSync(ordner).sort()).toEqual(erwartet);
  });

  it('jede Ebene liegt im Kasten', () => {
    const [breit, hoch] = DATEN.kasten;
    for (const [name, e] of Object.entries(DATEN.ebenen)) {
      expect(e.x, name).toBeGreaterThanOrEqual(0);
      expect(e.y, name).toBeGreaterThanOrEqual(0);
      expect(e.x + e.w, name).toBeLessThanOrEqual(breit);
      expect(e.y + e.h, name).toBeLessThanOrEqual(hoch);
    }
  });
});

describe('Helfer: Texte und Stil', () => {
  it('der Ball trägt einen eigenen Linknamen mit Hinweis auf den neuen Tab', () => {
    // e2e/seo.spec.ts: ein Ankertext, ein Ziel je Seite. Der Name darf keinem vorhandenen WhatsApp-Link gleichen.
    expect(TEXTE.ball).toMatch(/\(öffnet in neuem Tab\)$/);
    for (const vergeben of ['WhatsApp (öffnet in neuem Tab)', 'Per WhatsApp schreiben (öffnet in neuem Tab)', 'WhatsApp Direktkontakt (öffnet in neuem Tab)']) {
      expect(TEXTE.ball).not.toBe(vergeben);
    }
  });

  it('kein Knopf heißt Menü, der Kopf sucht diesen Namen eindeutig (e2e/navigation.spec.ts)', () => {
    for (const text of Object.values(TEXTE)) expect(text).not.toMatch(/Menü/);
  });

  it('was sich ziehen lässt, steht auch als Knopf in der Auswahl (WCAG 2.5.7)', () => {
    expect(TEXTE.hoch).toBe('Hochwerfen');
    expect(TEXTE.bewerfen).toBe('Mit dem Ball bewerfen');
    const spiel = lies('components/site/helfer/spiel/spiel.ts');
    expect(spiel).toContain('this.T.hoch');
    expect(spiel).toContain('this.T.bewerfen');
    expect(spiel).toContain('this.T.weg');
  });

  it('die Texte duzen und behaupten nichts über den Betrieb', () => {
    for (const text of Object.values(TEXTE)) {
      expect(text).not.toMatch(/\b(Sie|Ihnen|Ihr|Ihre)\b/);
      expect(text).not.toMatch(/€|Uhr|Premium/);
    }
  });

  it('die Stilregeln nutzen nur die Werte der Seite: keine Hexfarben, eine Schattenrolle, die vier Radien', () => {
    for (const stil of [SCHATTEN_STIL, LICHT_STIL]) {
      expect(stil).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
      for (const schatten of stil.match(/box-shadow:[^;}]+/g) ?? []) expect(schatten).toBe('box-shadow:var(--shadow-lg)');
      for (const radius of stil.match(/border-radius:[^;}]+/g) ?? []) expect(radius).toMatch(/^border-radius:(var\(--radius-(1|2|3|voll)\)|0|inherit)$/);
    }
  });

  it('keine Dauerschleife und kein Skalieren in den Abläufen, jede Bewegung endet', () => {
    for (const stil of [SCHATTEN_STIL, LICHT_STIL]) {
      expect(stil).not.toMatch(/animation:[^;}]*\binfin/);
      const abläufe = stil.match(/@keyframes[^{]+\{(?:[^{}]*\{[^{}]*\})+\s*\}/g) ?? [];
      for (const ablauf of abläufe) expect(ablauf).not.toMatch(/scale\(/);
    }
    expect(SCHATTEN_STIL.match(/@keyframes/g)?.length).toBeGreaterThan(3);
  });
});
