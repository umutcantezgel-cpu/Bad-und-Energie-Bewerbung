import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MOTION_IDS } from '@/lib/motion/register';
import { Button } from '../Button';
import { Checkbox } from '../Checkbox';
import { Chip } from '../Chip';
import { ChoiceCard } from '../ChoiceCard';
import { Field } from '../Field';
import { IconButton } from '../IconButton';
import { Input } from '../Input';
import { SegmentedControl } from '../SegmentedControl';
import { StepHeader } from '../StepHeader';
import { buttonVariants, iconButtonVariants } from '../variants';

/** Eingabe-Bausteine im Formsystem (R4-UI-01, KERN K-008/K-009/K-011, E-BEW-003). */

const DIR = path.resolve(__dirname, '..');
const DATEIEN = [
  'Button.tsx',
  'IconButton.tsx',
  'Checkbox.tsx',
  'Chip.tsx',
  'ChoiceCard.tsx',
  'Field.tsx',
  'Input.tsx',
  'Textarea.tsx',
  'SegmentedControl.tsx',
  'StepHeader.tsx',
  'variants.ts',
  'helpers.ts',
];
/** Server-Markup eines Bausteins; der Typ wird nur für den Aufruf verengt (Props prüft jeder Test selbst). */
const html = (type: unknown, props: object | null, ...children: ReactNode[]) =>
  renderToStaticMarkup(createElement(type as string, props, ...children));

describe('Button: Hauptaktion wie „Jetzt bewerben“ im Einstieg', () => {
  it('trägt die Druck-Kennung und lässt sie überschreiben', () => {
    expect(html(Button, null, 'Jetzt bewerben')).toMatch(/^<button data-motion="druck"/);
    expect(html(Button, { 'data-motion': 'unterstrich' }, 'x')).toContain('data-motion="unterstrich"');
    const link = html(Button, { asChild: true }, createElement('a', { href: '/bewerbung' }, 'Jetzt bewerben'));
    expect(link).toMatch(/^<a [^>]*href="\/bewerbung"/);
    expect(link).toMatch(/^<a [^>]*data-motion="druck"/);
  });

  it('Laden: aria-busy, Breite bleibt, ein laufender Strich statt Spinner', () => {
    const out = html(Button, { loading: true }, 'Senden');
    expect(out).toContain('aria-busy="true"');
    expect(out).toContain('aria-disabled="true"');
    expect(out).toContain('data-loading="true"');
    expect(out).toContain('data-motion="fortschritt"');
    expect(out).toMatch(/class="[^"]*invisible[^"]*">Senden</);
    expect(out).not.toContain('animate-spin');
  });

  it('ein aria-busy des Aufrufers bleibt erhalten (Absenden im Kontaktschritt)', () => {
    expect(html(Button, { 'aria-busy': true }, 'Wird gesendet…')).toContain('aria-busy="true"');
    expect(html(Button, null, 'x')).not.toContain(' aria-busy="');
  });

  it('Hover nur mit feinem Zeiger, Druck als Deckschicht in Rot-Druck, 56 px bei lg', () => {
    const primary = buttonVariants({ size: 'lg' }).split(' ');
    expect(primary).toEqual(
      expect.arrayContaining(['bg-accent', 'before:bg-accent-hover', 'active:before:bg-accent-press', 'h-14', 'px-6']),
    );
    const hover = primary.filter((c) => /(^|:)hover:/.test(c));
    expect(hover.length).toBeGreaterThan(0);
    for (const c of hover) expect(c.startsWith('pointer-fine:hover:')).toBe(true);
    for (const variant of ['secondary', 'outline', 'ghost', 'contrast', 'link'] as const) {
      for (const c of buttonVariants({ variant }).split(' ').filter((k) => /(^|:)hover:/.test(k))) {
        expect(c.startsWith('pointer-fine:hover:'), `${variant}: ${c}`).toBe(true);
      }
    }
  });

  it('Sekundär ist die Navy-Kontur (3 px), Tertiär der Unterstrich (3 px), deaktiviert ohne Rot', () => {
    expect(buttonVariants({ variant: 'secondary' }).split(' ')).toEqual(expect.arrayContaining(['border-3', 'border-brand']));
    expect(buttonVariants({ variant: 'link' }).split(' ')).toEqual(expect.arrayContaining(['underline', 'decoration-3']));
    expect(buttonVariants().split(' ')).toEqual(expect.arrayContaining(['disabled:bg-surface-3', 'disabled:text-ink-2']));
  });

  it('die Leitung mündet in den Knopf: Vorlauf links bzw. oben, Rücklauf daneben, im Abstand --paar', () => {
    const oben = buttonVariants({ leitung: 'oben', size: 'lg' }).split(' ');
    expect(oben).toEqual(expect.arrayContaining(['after:border-l-vorlauf', 'after:border-r-ruecklauf', 'after:bottom-full']));
    const rechts = buttonVariants({ leitung: 'rechts', size: 'lg' }).split(' ');
    expect(rechts).toEqual(expect.arrayContaining(['after:border-t-vorlauf', 'after:border-b-ruecklauf', 'after:left-full']));
    // Breite 15 px = --paar 12 + Strich 3: Mitte zu Mitte der beiden 3-px-Linien sind 12 px
    expect(oben).toContain('after:w-3.75');
  });

  it('IconButton: 44 bzw. 56 px, Radius 4, Druck-Kennung', () => {
    expect(iconButtonVariants({ size: 'lg' }).split(' ')).toEqual(expect.arrayContaining(['size-14', 'rounded-1']));
    expect(html(IconButton, { 'aria-label': 'Zurück' })).toContain('data-motion="druck"');
  });
});

describe('Felder: Fehler mit Icon und Text, nicht nur Farbe', () => {
  it('Field verbindet Fehler und Hinweis mit dem Feld und zeigt ein Icon', () => {
    const out = html(Field, { label: 'Name', hint: 'Vor- und Nachname', error: 'Bitte gib deinen Namen an.' }, createElement(Input));
    expect(out).toContain('aria-invalid="true"');
    expect(out).toMatch(/aria-describedby="[^"]*-hint [^"]*-error"/);
    expect(out).toMatch(/<p id="[^"]*-error"[^>]*text-danger[^>]*><svg[^>]*data-icon="circle-alert"[^>]*aria-hidden="true"/);
    expect(out).toContain('<span>Bitte gib deinen Namen an.</span>');
  });

  it('Eingabefeld: 56 px, 17 px Schrift, Kontur navy bei Hover und Fokus, Gefahr bei Fehler', () => {
    const out = html(Input, null);
    expect(out).toContain('font-size:1.0625rem');
    expect(out).toMatch(/class="[^"]*\bh-14\b/);
    expect(out).toContain('aria-invalid:border-danger');
    expect(out).toContain('pointer-fine:hover:not-aria-invalid:border-brand');
  });

  it('Checkbox: eigenes Kästchen mit Haken, Fehler mit Icon', () => {
    const out = html(Checkbox, { label: 'Einverstanden', error: 'Bitte bestätigen.' });
    expect(out).toContain('appearance-none');
    expect(out).toContain('data-icon="check"');
    expect(out).toContain('data-icon="circle-alert"');
    expect(out).toContain('aria-invalid="true"');
  });
});

describe('Auswahl (E-BEW-003): aktiver Zustand deutlich, ohne Glow, Wechsel ≤ 300 ms', () => {
  it('ChoiceCard gewählt: Navy-Fläche mit Haken, aria-pressed, Druck-Kennung', () => {
    const out = html(ChoiceCard, { title: 'Sofort', selected: true });
    expect(out).toContain('aria-pressed="true"');
    expect(out).toContain('data-motion="druck"');
    expect(out).toContain('aria-pressed:bg-brand');
    expect(out).toContain('data-icon="check"');
    expect(out).not.toMatch(/shadow|ring-|glow/);
  });

  it('ChoiceCard nimmt ein Icon der Familie beim Namen', () => {
    expect(html(ChoiceCard, { title: 'Wärmepumpe', icon: 'waermepumpe' })).toContain('data-icon="waermepumpe"');
  });

  it('SegmentedControl: echte Radios, gewählter Teil mit Haken', () => {
    const out = html(SegmentedControl, {
      legend: 'Wie sollen wir uns melden?',
      name: 'kanal',
      options: [
        { value: 'whatsapp', label: 'WhatsApp' },
        { value: 'anruf', label: 'Anruf' },
      ],
      value: 'whatsapp',
    });
    expect(out.match(/type="radio"/g)).toHaveLength(2);
    expect(out).toContain('checked=""');
    expect(out).toContain('has-checked:bg-brand');
    expect(out).toContain('has-focus-visible:outline-3');
  });

  it('Chip gedrückt: aria-pressed und Haken', () => {
    const out = html(Chip, { pressed: true }, 'Team');
    expect(out).toContain('aria-pressed="true"');
    expect(out).toContain('data-icon="check"');
  });

  it('alle Wechsel nutzen die Dauern d-1/d-2 (≤ 300 ms), keine freien Dauern', () => {
    for (const datei of DATEIEN) {
      const src = readFileSync(path.join(DIR, datei), 'utf8');
      expect(src, datei).not.toMatch(/duration-(?:\d|\[)/);
      for (const m of src.matchAll(/duration-(d\d)/g)) expect(['d1', 'd2'], datei).toContain(m[1]);
    }
  });
});

describe('StepHeader: Leitungspaar als Fortschrittsstrang', () => {
  const strang = (current: number, total: number) => html(StepHeader, { current, total, onBack: () => {}, onClose: () => {} });

  it('Vorlauf endet an der Marke des aktuellen Schritts (Kennung fortschritt)', () => {
    const out = strang(2, 4);
    expect(out).toMatch(/data-motion="fortschritt"[^>]*style="transform:scaleX\(0\.5\)"/);
    expect(out).toContain('aria-valuetext="Schritt 2 von 4"');
    // fünf Marken: drei erreicht (0, ¼, ½) in Navy, zwei offen
    expect(out.match(/left:\d+(?:\.\d+)?%/g)).toEqual(['left:0%', 'left:25%', 'left:50%', 'left:75%', 'left:100%']);
    expect(out.match(/bg-brand/g)).toHaveLength(3);
    // die geplante Leitung beginnt dort, wo der Vorlauf endet
    expect(out).toContain('clip-path:inset(0 0 0 50%)');
  });

  it('Zurück und Schließen sind Icon-Knöpfe ohne lucide', () => {
    const out = strang(1, 3);
    expect(out).toContain('data-icon="arrow-left"');
    expect(out).toContain('data-icon="x"');
    expect(out).toContain('aria-label="Bewerbung abbrechen"');
  });
});

describe('Quellen', () => {
  it('kein lucide-react mehr in den Eingabe-Bausteinen', () => {
    for (const datei of DATEIEN) expect(readFileSync(path.join(DIR, datei), 'utf8'), datei).not.toContain('lucide-react');
  });

  it('jede data-motion-Kennung steht im Register', () => {
    for (const datei of DATEIEN) {
      const src = readFileSync(path.join(DIR, datei), 'utf8');
      for (const m of src.matchAll(/data-motion=["']([^"']+)["']/g)) expect(MOTION_IDS, datei).toContain(m[1]);
    }
  });
});
