/**
 * Erklärteil der Bewerbungsseite /bewerbung unter dem Flow (V6-G1): Ablauf nach dem Absenden, Wegweiser zu den
 * Stellen, Bewerbung ohne Lebenslauf oder mit Unterlagen. Jeder Satz stammt aus einer belegten Quelle: FACTS,
 * lib/content/process, lib/content/faq, COMPANY, die Stellendaten und die Texte der Mappe und der Unterlagen.
 * Eigene Wörter sind nur Überschriften, Etiketten und Linktexte, ohne Zahl und ohne Zusage. Geprüft in
 * components/apply/seite/__tests__/erklaerung.test.ts.
 *
 * Faktenverteilung (E-023): Der Erklärteil steht in der Arbeitsfläche, im selben Abschnitt wie „Unterlagen
 * einreichen“ und „Lieber direkt sprechen?“. „Kein Lebenslauf“, „60 Sekunden“ und „diskret“ stehen so weiter in
 * zwei Abschnitten (Kopf und Arbeitsfläche). Die Diskretionszusage im Wortlaut (DISCRETION_PROMISE) steht außer im
 * Kontaktschritt des Flows nur einmal, bei „Lieber direkt sprechen?“; der Erklärteil nennt die Diskretion über
 * Schritt 2 des Ablaufs und den Satz zu Kündigungsfristen aus der FAQ.
 */
import { voraussetzungen } from '@/components/jobs/liste/inhalt-text';
import { bindSeparators, lowerFirst } from '@/components/jobs/text';
import { INITIATIVE_OPTION } from '@/components/apply/options';
import { UNTERLAGEN_ANKER } from '@/components/apply/unterlagen/unterlagen-text';
import { MAPPE_KOPF } from '@/components/mappe/text';
import { MAPPE_PATH } from '@/lib/apply/params';
import { COMPANY } from '@/lib/content/company';
import { getFaqItem } from '@/lib/content/faq';
import { FACTS } from '@/lib/content/facts';
import { getProcessIntro, getProcessSteps, type ProcessAudience, type ProcessStep } from '@/lib/content/process';
import { jobPath } from '@/lib/jobs/format';
import type { Job } from '@/lib/jobs/registry';

/** „Nein. A. B.“ → ['Nein.', 'A.', 'B.'] */
function saetze(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).filter(Boolean);
}

/** Satz ohne Schlusspunkt, für die Mitte eines neuen Satzes. */
const ohnePunkt = (text: string) => text.replace(/\.$/, '');

/** FAQ „Brauche ich ein Anschreiben oder einen Lebenslauf?“ ohne das einleitende „Nein.“ */
const LEBENSLAUF = saetze(getFaqItem('lebenslauf').answer).slice(1).join(' ');
/** Letzter Satz der FAQ zum diskreten Wechsel: „Auch bei Kündigungsfristen unterstützen wir dich transparent.“ */
const KUENDIGUNG = saetze(getFaqItem('diskreter-wechsel').answer).at(-1) ?? '';
/** Aus dem Kopf der Mappe: „Anschreiben und Lebenslauf auf A4“ und „zum Drucken oder als PDF“. */
const MAPPE_INHALT = ohnePunkt(MAPPE_KOPF.unterzeile);
const MAPPE_FORM = lowerFirst(ohnePunkt(saetze(MAPPE_KOPF.einleitung)[0] ?? ''));

export const ERKLAERUNG_TITEL_ID = 'bewerbung-ablauf';

export interface Wegweiser {
  id: string;
  /** Voller Titel der Stelle (titleShy), zugleich Linktext zur Stellenanzeige. */
  titel: string;
  href: string;
  /** Kurzbeschreibung der Stelle (summary). */
  text: string;
  voraussetzungen: readonly string[];
}

export interface Erklaerung {
  etikett: string;
  titel: string;
  einleitung: string;
  ablauf: { titel: string; schritte: readonly ProcessStep[]; hinweis: string | null };
  stellen: {
    titel: string;
    voraussetzung: string;
    liste: readonly Wegweiser[];
    /** Wege ohne eigene Stellenanzeige (funnel_only), nur im Flow wählbar. */
    ohneAnzeige: readonly { id: string; name: string; text: string }[];
    ohneAnzeigeHinweis: string;
    initiativ: string;
  };
  unterlagen: {
    titel: string;
    text: string;
    mappe: string;
    links: readonly { href: string; label: string }[];
  };
}

export interface ErklaerungEingaben {
  /** Fragenset der vorgewählten Stelle; ohne Vorauswahl `fachkraft`. */
  audience: ProcessAudience;
  /** Die veröffentlichten Stellen, die gerade live sind. */
  jobs: readonly Job[];
  /** Wege, die nur im Flow stehen (status funnel_only), z. B. Quereinstieg. */
  ohneAnzeige: readonly Job[];
  /** Stelle per ?stelle= vorgewählt: Der Flow zeigt sie als Tag mit „ändern“ statt des Schritts „Stelle“. */
  vorausgewaehlt?: boolean;
}

export function erklaerung({ audience, jobs, ohneAnzeige, vorausgewaehlt = false }: ErklaerungEingaben): Erklaerung {
  // Wo die Stelle im Flow oben zu wählen ist (components/apply/types.ts: Vorauswahl ersetzt den Schritt „Stelle“)
  const wahlOrt = vorausgewaehlt ? 'oben über „ändern“' : 'oben im ersten Schritt';
  const wahlKurz = vorausgewaehlt ? 'oben über „ändern“' : 'oben';
  const intro = getProcessIntro(audience);
  return {
    etikett: 'Ablauf und Wegweiser',
    titel: `So läuft deine Bewerbung in ${COMPANY.address.city}`,
    // Fakt quickResponse, dann die Einleitung des Ablaufs (lib/content/process)
    einleitung: `${FACTS.quickResponse.long} ${intro.text}`,
    ablauf: {
      titel: intro.title,
      schritte: getProcessSteps(audience),
      // Ausbildung: meist noch Schule, also kein Arbeitgeber und keine Kündigungsfrist (wie getDiscretionPromise)
      hinweis: audience === 'ausbildung' ? null : `Noch angestellt? ${KUENDIGUNG}`,
    },
    stellen: {
      titel: `Welche Stelle bei ${COMPANY.shortName} passt zu dir?`,
      voraussetzung: 'Voraussetzung',
      liste: jobs.map((job) => ({
        id: job.id,
        titel: bindSeparators(job.titleShy),
        href: jobPath(job),
        text: job.summary,
        voraussetzungen: voraussetzungen(job),
      })),
      ohneAnzeige: ohneAnzeige.map((job) => ({ id: job.id, name: bindSeparators(job.shortTitle), text: job.summary })),
      ohneAnzeigeHinweis: `Ohne eigene Stellenanzeige, ${wahlOrt} wählbar.`,
      initiativ: `Passt keine Stelle, wähle ${wahlKurz} „${INITIATIVE_OPTION.label}“.`,
    },
    unterlagen: {
      titel: 'Ohne Lebenslauf oder mit Unterlagen',
      // FAQ „lebenslauf“ (Fakt noCvNeeded), im selben Abschnitt wie „Unterlagen einreichen“
      text: LEBENSLAUF,
      mappe: `Willst du trotzdem Unterlagen zeigen, stellst du in der Bewerbungsmappe ${MAPPE_INHALT} zusammen, ${MAPPE_FORM}.`,
      links: [
        { href: MAPPE_PATH, label: ohnePunkt(MAPPE_KOPF.titel) },
        { href: `#${UNTERLAGEN_ANKER}`, label: 'Gesellenbrief und Zeugnisse per WhatsApp oder E-Mail schicken' },
      ],
    },
  };
}
