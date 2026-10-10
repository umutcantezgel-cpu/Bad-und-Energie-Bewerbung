import { COMPANY } from '@/lib/content/company';
import { FACTS } from '@/lib/content/facts';
import { REGION } from '@/lib/content/region';
import { companyData } from '@/lib/data/company';

/**
 * Texte der Abschnitte „Über uns“ und Schlussband (R3-HOME-04). Nur Belegtes: COMPANY, FACTS, REGION,
 * companyData (Owner-Wortlaut) und Wortlaute, die die Pässe (atlas/paesse-start.md) als Wesenskern führen.
 * Bestehende Texte bleiben wörtlich; hier wird nur zusammengesetzt und geteilt, nie umformuliert.
 */

const NBSP = ' ';

/** Vor- und Nachname bleiben in einer Zeile (geschütztes Leerzeichen); der Wortlaut bleibt. */
export function schuetzeNamen(text: string, name: string = COMPANY.managingDirector.name): string {
  return text.split(name).join(name.replace(/ /g, NBSP));
}

/** Einleitung „Über uns“: Fakt directLine, wörtlich, mit geschütztem Namen. */
export const UEBER_UNS_EINLEITUNG = schuetzeNamen(FACTS.directLine.long);

/** Etikett über der Überschrift (Planbeschriftung); Name des Abschnitts nach ROADMAP §5.6 „Über uns und Stimmen“. */
export const UEBER_UNS_ETIKETT = 'Über uns';

/**
 * Überschrift nach ROADMAP §5.6 („15 Leute. Ein Meisterbetrieb. Seit 1926.“), aus employees15 und dem
 * Gründungsjahr. Geschützte Leerzeichen halten Zahl und Wort zusammen; „Ein“ endet nie eine Zeile.
 */
export function ueberUnsTitel(): string {
  return `${FACTS.employees15.value}${NBSP}Leute. Ein${NBSP}Meisterbetrieb. Seit${NBSP}${COMPANY.foundingYear}.`;
}

/**
 * Wachstumsgrund aus dem Owner-Text `companyData.milestone2026` (erster Satz nach „Meilenstein 2026:“),
 * wörtlich. Der Pass E-START-031 verlangt ihn („Wachstumsgrund fehlt“); „führend“ bleibt draußen (B14).
 */
export function wachstumsgrund(text: string = companyData.milestone2026): string {
  const ohneKopf = text.replace(/^Meilenstein\s+\d{4}:\s*/, '');
  const ende = ohneKopf.indexOf('. ');
  return ende < 0 ? ohneKopf : ohneKopf.slice(0, ende + 1);
}

/**
 * E-START-031: Meilenstein 2026. Überschrift „Meilenstein 2026“, Text = Wachstumsgrund + REGION.milestone.text
 * (enthält „Siegmund-Hiepe-Str. 20“, „größeres Lager“ und „15 Leuten“). Der Slogan ‚Schöner Wohnen …‘ nur nach
 * Freigabe (Pass), darum nicht hier.
 */
export const MEILENSTEIN = Object.freeze({
  wort: 'Meilenstein',
  jahr: String(REGION.milestone.year),
  text: `${wachstumsgrund()} ${REGION.milestone.text}`,
  /** Die Adresse bricht nie am Bindestrich um („Siegmund-/Hiepe-Str.“). */
  strasse: COMPANY.address.street,
});

export interface PartnerSaeule {
  /** Name der Säule, z. B. „Buderus & Bosch Partnerbetrieb“. */
  name: string;
  /** Klammerzusatz aus den Fakten (Urkunde, Werksnähe, Garantie), falls vorhanden. */
  zusatz?: string;
}

/**
 * Die fünf Partner-Säulen aus FACTS.partners5.list, geteilt in Name und Klammerzusatz. Die Vertrauenszeile im
 * Einstieg nennt die Namen ohne Zusatz; die Zusätze stehen nur hier (R3-HOME-01, einstieg-text.ts).
 */
export function partnerSaeulen(list: readonly string[] = FACTS.partners5.list ?? []): PartnerSaeule[] {
  return list.map((eintrag) => {
    const m = eintrag.match(/^(.*?)\s*\((.*)\)\s*$/);
    return m ? { name: m[1], zusatz: m[2] } : { name: eintrag };
  });
}

/** „5 Partner-Säulen“ aus Kennzahl und Beschriftung des Fakts. */
export const PARTNER_TITEL = `${FACTS.partners5.value}${NBSP}${FACTS.partners5.label}`;

/** Unterüberschrift der Stimmen (Wortlaut wie bisher). */
export const STIMMEN_TITEL = 'Stimmen von Kunden und Team';

/**
 * E-START-051, Wesenskern des Altstands (Pille „100% Unverbindlich · Kein Risiko · Keine Verpflichtung“) ohne die
 * unbelegte Prozentzahl. Steht als Etikett unter „Jetzt bewerben“ und senkt die Schwelle ohne Druck; umbrochen wird nur an den Punkten. „Kein
 * Lebenslauf“ fehlt mit Absicht: steht schon im Einstieg und in den FAQ (höchstens zweimal je Seite).
 */
export const UNVERBINDLICH = ['Unverbindlich', 'Kein Risiko', 'Keine Verpflichtung']
  .map((teil) => teil.replace(/ /g, NBSP))
  .join(' · ');

/**
 * E-START-048: Kontakt „Sprich direkt mit …“ (Wesenskern; der Titel „Meister“ vor dem Namen ist offen, A5, und
 * fehlt darum). Name und Rolle aus COMPANY.managingDirector; Etikett „Persönlicher Austausch“ wie im Altstand.
 */
export const KONTAKT = Object.freeze({
  etikett: 'Persönlicher Austausch',
  titel: `Sprich direkt mit ${COMPANY.managingDirector.name}`,
  rolle: COMPANY.managingDirector.title,
});
