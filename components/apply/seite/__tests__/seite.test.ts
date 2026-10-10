import { createElement, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { COMPANY } from '@/lib/content/company';
import { FACTS } from '@/lib/content/facts';
import { getDiscretionPromise } from '@/lib/content/process';
import { REGION } from '@/lib/content/region';
import { bewerbungKopf, DirektSprechen, Regionalband, REGIONALBAND } from '..';

// Der Flow ist Sache von R5-APPLY-01 und braucht den App-Router; hier genügt sein Platzhalter.
vi.mock('@/components/apply', () => ({
  ApplyFlow: ({ variant, initialJobId }: { variant: string; initialJobId?: string }) =>
    createElement('div', { 'data-apply-flow': variant, 'data-stelle': initialJobId ?? '' }),
}));

/** Text ohne Tags; geschützte Leerzeichen und Wortverbinder bleiben erhalten. */
const plain = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/[ \t\n\r]+/g, ' ').trim();
/** Für den Vergleich mit FACTS: geschützte Leerzeichen und Wortverbinder wie normale Zeichen. */
const normal = (text: string) => text.replace(/ /g, ' ').replace(/⁠/g, '');

async function seite(searchParams: Record<string, string | string[]> = {}) {
  const { default: BewerbungPage } = await import('@/app/bewerbung/page');
  const element = (await BewerbungPage({ searchParams: Promise.resolve(searchParams) })) as ReactElement;
  return renderToStaticMarkup(element);
}

describe('Regionalband (E-BEW-008): Fakten aus facts.ts, Link auf das Einsatzgebiet', () => {
  const html = renderToStaticMarkup(createElement(Regionalband));
  const text = normal(plain(html));

  it('zeigt keine Fernmontage, Einsatzgebiet, Arbeitszeiten und Ort wortgleich aus FACTS, REGION und COMPANY', () => {
    expect(html).toMatch(/<h2 id="bewerbung-region"[^>]*>Keine Fernmontage\.<\/h2>/);
    expect(REGIONALBAND.titel).toBe(`${FACTS.noFarAssembly.short}.`);
    expect(text).toContain(REGION.summary);
    expect(text).toContain(`${FACTS.radius35.value} Einsatzradius`);
    expect(text).toContain(`${FACTS.friday1330.value} Freitags Feierabend`);
    for (const mass of REGIONALBAND.masse) {
      if ('detail' in mass && mass.detail) expect(FACTS.workingHours.short).toContain(normal(mass.detail));
    }
    expect(text).toContain('Mo–Do 07:00–16:45 Uhr');
    expect(text).toContain(`${COMPANY.address.street} ${COMPANY.address.postalCode} ${COMPANY.address.city}`);
  });

  it('verlinkt /#einsatzgebiet und hält die Zeitspanne zusammen', () => {
    expect(html).toContain('href="/#einsatzgebiet"');
    expect(html).toContain('07:00⁠–⁠16:45 Uhr');
    expect(html).toContain('35 km');
  });

  it('steht auf Wand mit Leitungstrenner und benannt über die h2', () => {
    expect(html).toContain('bg-surface-2');
    expect(html).toContain('data-zeichnung="leitungstrenner"');
    expect(html).toContain('aria-labelledby="bewerbung-region"');
  });
});

describe('Kopf der Bewerbungsseite (Seitenkopf arbeit, E-023)', () => {
  it('Unterzeile nach Diskretion, Dauer aus apply60s, Zweitweg zu den Unterlagen', () => {
    const kopf = bewerbungKopf({ diskret: true, unterlagenWunsch: false, unterlagenAnker: 'unterlagen' });
    expect(kopf.titel).toBe('Jetzt bewerben.');
    expect(kopf.unterzeile).toBe('Ohne Lebenslauf. Diskret.');
    expect(kopf.masse).toEqual([{ wert: `${FACTS.apply60s.value} s`, name: 'Ungefähre Dauer' }]);
    expect(kopf.zweitweg).toEqual({ href: '#unterlagen', label: 'Lieber mit Unterlagen bewerben' });
    expect(kopf.mikrotext).toBeUndefined();
    expect(bewerbungKopf({ diskret: false, unterlagenWunsch: false, unterlagenAnker: 'unterlagen' }).unterzeile).toBe(
      'Ohne Lebenslauf. Unverbindlich.',
    );
  });

  it('alte Tresor-Links bekommen oben den Hinweis auf die Unterlagen (E-BEW-027)', () => {
    const kopf = bewerbungKopf({ diskret: true, unterlagenWunsch: true, unterlagenAnker: 'unterlagen' });
    expect(kopf.mikrotext).toBe('Du möchtest Unterlagen schicken? So geht es:');
    expect(kopf.zweitweg.label).toBe('Unterlagen einreichen');
  });
});

describe('Lieber direkt sprechen?', () => {
  it('zeigt die Diskretionszusage nur, wenn es eine gibt, und die Kanäle in fester Reihenfolge', () => {
    const zusage = getDiscretionPromise('fachkraft') ?? '';
    const mit = renderToStaticMarkup(createElement(DirektSprechen, { diskretion: zusage, whatsappMessage: 'Hallo' }));
    expect(plain(mit)).toContain(zusage);
    expect(mit).toMatch(/<h2 id="bewerbung-kontakt"[^>]*>Lieber direkt sprechen\?<\/h2>/);
    const kanaele = [COMPANY.phone.href, 'api.whatsapp.com', COMPANY.emailHref].map((teil) => mit.indexOf(teil));
    expect(kanaele.every((stelle) => stelle > 0)).toBe(true);
    expect([...kanaele].sort((a, b) => a - b)).toEqual(kanaele);
    const ohne = renderToStaticMarkup(createElement(DirektSprechen, { diskretion: null, whatsappMessage: 'Hallo' }));
    expect(plain(ohne)).not.toContain(zusage);
  });
});

describe('Seite /bewerbung (R5-BEW-01)', () => {
  it('genau eine h1 im Seitenkopf arbeit, Flow vor den anderen Wegen, Regionalband unter dem Flow', async () => {
    const html = await seite();
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toMatch(/<h1 id="bewerbung-titel"[^>]*>Jetzt bewerben\.<\/h1>/);
    expect(html).toContain('data-seitenkopf="arbeit"');
    const flow = html.indexOf('data-apply-flow="page"');
    const unterlagen = html.indexOf('id="unterlagen"');
    const direkt = html.indexOf('id="bewerbung-kontakt"');
    const region = html.indexOf('data-regionalband');
    expect(flow).toBeGreaterThan(html.indexOf('data-seitenkopf'));
    expect(unterlagen).toBeGreaterThan(flow);
    expect(direkt).toBeGreaterThan(unterlagen);
    expect(region).toBeGreaterThan(direkt);
    // Zweitweg im Kopf: von / aus „Unterlagen einreichen“ in zwei Klicks (E-START-007)
    expect(html).toContain('href="#unterlagen"');
    // Rot nur für die Hauptaktion: Der Kopf trägt keinen eigenen Knopf, die Hauptaktion ist der Flow.
    expect(html).not.toContain('data-primary-cta=""');
  });

  it('JSON-LD bleibt ein WebPage-Knoten ohne BreadcrumbList (E-BEW-029)', async () => {
    const html = await seite();
    const blocks = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toMatchObject({
      '@type': 'WebPage',
      inLanguage: 'de-DE',
      name: `Bewerben in ${FACTS.apply60s.value} Sekunden – ohne Lebenslauf | Bad & Energie`,
    });
    expect(blocks[0]['@id']).toMatch(/\/bewerbung#webpage$/);
    expect(blocks[0].isPartOf['@id']).toMatch(/#website$/);
    expect(JSON.stringify(blocks[0])).not.toMatch(/breadcrumb/i);
  });

  it('Metadaten bleiben im Wortlaut (E-BEW-029)', async () => {
    const { metadata } = await import('@/app/bewerbung/page');
    expect(metadata.title).toMatchObject({ absolute: `Bewerben in ${FACTS.apply60s.value} Sekunden – ohne Lebenslauf | Bad & Energie` });
    expect(metadata.description).toBe(
      `Bewirb dich in ca. ${FACTS.apply60s.value} Sekunden bei Bad und Energie in Wetzlar: ein paar kurze Fragen, Name und Telefon. Kein Lebenslauf nötig, 100 % diskret.`,
    );
    expect(String(metadata.alternates?.canonical)).toMatch(/\/bewerbung$/);
  });

  it('?tab=dossier leitet mit 308 und Query auf die Mappe (E-BEW-027)', async () => {
    await expect(seite({ tab: 'dossier', utm_source: 'indeed', stelle: 'initiativ' })).rejects.toMatchObject({
      digest: expect.stringMatching(/^NEXT_REDIRECT;[a-z]+;\/bewerbung\/mappe\?utm_source=indeed&stelle=initiativ;308;/),
    });
  });

  it('?tab=vault, ?direct= und unbekannte Werte rendern den Flow ohne Fehler (E-BEW-027)', async () => {
    const vault = await seite({ tab: 'vault' });
    expect(vault).toContain('data-apply-flow="page"');
    expect(plain(vault)).toContain('Du möchtest Unterlagen schicken? So geht es:');
    expect(plain(await seite({ direct: 'true' }))).toContain('Unterlagen einreichen');
    const faelle: Record<string, string | string[]>[] = [{ tab: 'bogus' }, { tab: '' }, { tab: ['quiz', 'dossier'] }, { stelle: '%%%' }, { schritt: 'gibt-es-nicht' }];
    for (const params of faelle) {
      const html = await seite(params);
      expect(html).toContain('data-apply-flow="page"');
      expect(plain(html)).not.toContain('Du möchtest Unterlagen schicken?');
    }
  });

  it('Ausbildung vorgewählt: keine Diskretionszusage, Unterzeile unverbindlich', async () => {
    const html = await seite({ stelle: 'ausbildung-anlagenmechaniker-shk-wetzlar' });
    expect(html).toContain('data-stelle="ausbildung-anlagenmechaniker-shk"');
    expect(plain(html)).toContain('Ohne Lebenslauf. Unverbindlich.');
    expect(plain(html)).not.toContain(getDiscretionPromise('fachkraft') ?? '—');
  });
});
