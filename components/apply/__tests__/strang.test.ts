import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';

import { ICON_NAMES } from '@/components/icons';
import { EMPTY_CONTACT, type ContactFormInput, type ContactFormValues } from '@/lib/apply/contact-schema';
import { getSteps, initFlowState } from '@/lib/apply/flow';
import { MAPPE_PATH } from '@/lib/apply/params';
import { QUESTION_SETS, type QuestionSetId } from '@/lib/apply/questions';
import { FACTS } from '@/lib/content/facts';
import { JobCategorySchema } from '@/lib/jobs/schema';
import { FlowShortcuts } from '../FlowShortcuts';
import { getFlowJobOptions, INITIATIVE_OPTION } from '../options';
import { Fortschrittsstrang } from '../strang/Fortschrittsstrang';
import { Weg } from '../strang/Weg';
import { Zusagenblock, zusageTeile } from '../strang/Zusage';
import { SCHRITTNAMEN, STELLEN_ICON, WEG_TEXT, mitTrennstellen, passungsSatz, schrittNamen } from '../strang/strang-text';

const SHY = '­';

const plain = (html: string) =>
  html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();

describe('Schrittnamen (Leitungspaar, Screenreader)', () => {
  it('benennt jeden Schritt jedes Fragensets, eindeutig und nicht leer', () => {
    for (const set of Object.keys(QUESTION_SETS) as QuestionSetId[]) {
      const steps = getSteps({ ...initFlowState({ questionSet: set }), questionSet: set, showJobStep: true });
      const namen = schrittNamen(steps);
      expect(namen.every((name) => name.length > 0), set).toBe(true);
      expect(new Set(namen).size, set).toBe(namen.length);
      expect(namen[0]).toBe('Stelle');
      expect(namen.at(-1)).toBe('Kontakt');
    }
  });

  it('Fachkraft: Stelle, Erfahrung, Start, Kontakt', () => {
    const steps = getSteps({ ...initFlowState(), showJobStep: true });
    expect(schrittNamen(steps)).toEqual(['Stelle', 'Erfahrung', 'Start', 'Kontakt']);
    expect(Object.keys(SCHRITTNAMEN)).toHaveLength(7);
  });
});

describe('Fortschrittsstrang', () => {
  const render = (aktuell: number, onBack?: () => void) =>
    renderToStaticMarkup(createElement(Fortschrittsstrang, { schritte: ['Stelle', 'Erfahrung', 'Start', 'Kontakt'], aktuell, onBack }));

  it('ist das Leitungspaar mit Zähler und Schrittname für Screenreader (Register fortschritt)', () => {
    const html = render(2, () => {});
    expect(html).toContain('role="progressbar"');
    expect(html).toContain('aria-valuetext="Schritt 2 von 4: Erfahrung"');
    expect(html).toContain('aria-valuenow="2"');
    expect(html).toContain('data-motion="fortschritt"');
    expect(html).toContain('data-zeichnung="leitungspaar"');
    // Sichtbarer Zähler als Etikett, für Screenreader verborgen (kein doppeltes Vorlesen)
    expect(html).toMatch(/<p aria-hidden="true" class="[^"]*text-etikett[^"]*">Schritt/);
    // Drei Knoten erledigt bzw. aktuell, der Rest offen
    expect(html.match(/data-stand="erledigt"/g)).toHaveLength(1);
    expect(html.match(/data-stand="aktuell"/g)).toHaveLength(1);
    expect(html.match(/data-stand="offen"/g)).toHaveLength(2);
  });

  it('zeigt „Zurück“ nur, wenn es einen vorigen Schritt gibt', () => {
    expect(render(2, () => {})).toContain('aria-label="Zurück"');
    expect(render(1)).not.toContain('aria-label="Zurück"');
  });

  it('begrenzt den Schritt auf 1 … Anzahl', () => {
    expect(render(9)).toContain('aria-valuetext="Schritt 4 von 4: Kontakt"');
    expect(render(0)).toContain('aria-valuetext="Schritt 1 von 4: Stelle"');
  });
});

describe('Passungs-Rahmung (E-START-013)', () => {
  it('nennt die Zeit nur aus dem Fakt apply60s und spricht vom Herausfinden', () => {
    const sekunden = FACTS.apply60s.value ?? '';
    expect(sekunden).toBe('60');
    const satz = passungsSatz(sekunden);
    expect(satz).toBe(`Finde in ${sekunden}\u00a0Sekunden heraus, ob wir zu dir passen.`);
    expect(satz).not.toMatch(/120|30\u00a0Sekunden|zwei Minuten/);
  });
});

describe('Auswahl der Stelle', () => {
  it('hat für jede Stellenart und die Initiativbewerbung ein Familien-Icon der eigenen Icons', () => {
    for (const kategorie of [...JobCategorySchema.options, 'initiativ' as const]) {
      expect(ICON_NAMES).toContain(STELLEN_ICON[kategorie]);
    }
    for (const option of getFlowJobOptions()) expect(option.icon, option.id).toBeDefined();
    expect(INITIATIVE_OPTION.icon).toBe(STELLEN_ICON.initiativ);
  });

  it('setzt weiche Trennstellen aus titleShy, ohne den Text zu ändern', () => {
    for (const option of getFlowJobOptions()) {
      expect((option.labelShy ?? option.label).replaceAll(SHY, ''), option.id).toBe(option.label);
    }
    const kundendienst = getFlowJobOptions().find((option) => option.label === 'Kundendiensttechniker');
    expect(kundendienst?.labelShy).toBe(`Kunden${SHY}dienst${SHY}techniker`);
    expect(mitTrennstellen('Anlagenmechaniker SHK', `Anlagen${SHY}mechaniker SHK (m/w/d)`)).toBe(`Anlagen${SHY}mechaniker SHK`);
    expect(mitTrennstellen('Initiativ bewerben')).toBe('Initiativ bewerben');
  });
});

describe('Andere Wege (E-BEW-001)', () => {
  it('ein Weg ist ein Link mit Icon, Titel und erklärender Zeile; fremde Ziele im neuen Tab', () => {
    const html = renderToStaticMarkup(
      createElement(Weg, { href: 'https://wa.me/491608834290', icon: 'message-circle', titel: 'Direkt per WhatsApp', text: 'Erklärung', neuerTab: { hinweis: 'öffnet WhatsApp' } }),
    );
    expect(html).toMatch(/^<a href="https:\/\/wa\.me\/491608834290" target="_blank" rel="noopener noreferrer"/);
    expect(plain(html)).toBe('Direkt per WhatsApp (öffnet WhatsApp) Erklärung');
    expect(html).toContain('data-icon="message-circle"');
    expect(html).toContain('min-h-11');
  });

  function renderShortcuts(props: { showMappeLink: boolean; jobLabel?: string | null; headingAs?: 'h2' | 'h3' }) {
    function Harness() {
      const form = useForm<ContactFormInput, unknown, ContactFormValues>({ defaultValues: EMPTY_CONTACT });
      return createElement(FlowShortcuts, {
        control: form.control,
        jobLabel: props.jobLabel ?? null,
        questionSet: 'fachkraft',
        answers: {},
        showMappeLink: props.showMappeLink,
        headingAs: props.headingAs,
      });
    }
    return renderToStaticMarkup(createElement(Harness));
  }

  it('auf /bewerbung: WhatsApp und Mappe je mit einem Klick und einer Erklärzeile, als Liste unter einer Überschrift', () => {
    const html = renderShortcuts({ showMappeLink: true });
    expect(html).toMatch(/<nav aria-labelledby="[^"]+"/);
    expect(html).toMatch(/<h2 id="[^"]+-wege"[^>]*>Andere Wege<\/h2>/);
    expect(html.match(/<li>/g)).toHaveLength(2);
    expect(html).toMatch(/href="https:\/\/(wa\.me|api\.whatsapp\.com)\//);
    expect(html).toContain(`href="${MAPPE_PATH}"`);
    const text = plain(html);
    expect(text).toContain(WEG_TEXT.whatsapp.leer);
    expect(text).toContain(WEG_TEXT.mappe.text);
    // Zeitangaben nur aus apply60s: die Wege versprechen keine Dauer
    expect(text).not.toMatch(/Sekunden|Minuten/);
  });

  it('eingebettet: nur WhatsApp, Überschrift eine Ebene tiefer; mit Stelle sagt die Zeile, dass die Angaben drinstehen', () => {
    const html = renderShortcuts({ showMappeLink: false, jobLabel: 'Anlagenmechaniker SHK', headingAs: 'h3' });
    expect(html).toMatch(/<h3 id="[^"]+-wege"/);
    expect(html.match(/<li>/g)).toHaveLength(1);
    expect(html).not.toContain(`href="${MAPPE_PATH}"`);
    expect(plain(html)).toContain(WEG_TEXT.whatsapp.mitAngaben);
    expect(decodeURIComponent(html)).toContain('Anlagenmechaniker SHK');
  });
});

describe('Zusagenblock', () => {
  it('teilt die Zusage nur zur Gestaltung: der Text bleibt wortgleich', () => {
    const text = 'Dein Wechsel bleibt vertraulich: Wir kontaktieren niemanden.';
    expect(zusageTeile(text).join('')).toBe(text);
    expect(zusageTeile(text)[0]).toBe('Dein Wechsel bleibt vertraulich:');
    expect(zusageTeile('Ohne Doppelpunkt')).toEqual(['Ohne Doppelpunkt', '']);
  });

  it('ohne Zusage bleibt nur der Hinweis', () => {
    const html = renderToStaticMarkup(createElement(Zusagenblock, { zusage: null }, createElement('p', null, 'Hinweis')));
    expect(html).not.toContain('data-zusage');
    expect(html).not.toContain('shield-check');
    expect(plain(html)).toBe('Hinweis');
  });
});
