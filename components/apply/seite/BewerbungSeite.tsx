import { ApplyFlow } from '@/components/apply';
import { UNTERLAGEN_ANKER, UnterlagenZeile } from '@/components/apply/unterlagen';
import { Seitenkopf } from '@/components/seitenkopf';
import { JsonLd } from '@/components/seo/JsonLd';
import type { ApplicationJobId } from '@/lib/applications/constants';
import { BEWERBUNG_PFAD } from '@/lib/apply/params';
import { getDiscretionPromise, getJobProcessSteps, processAudienceFor } from '@/lib/content/process';
import { FACTS } from '@/lib/content/facts';
import { getActiveJobs, getFunnelOptions, getJobById, isJobLive, type Job } from '@/lib/jobs/registry';
import { buildPageGraph } from '@/lib/seo/graph';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { whatsAppMessageFor } from '@/lib/utils/whatsapp-utils';
import { BewerbungFlaeche } from './BewerbungFlaeche';
import { DirektSprechen } from './DirektSprechen';
import { Erklaerung } from './Erklaerung';
import { KopfHaus } from './KopfHaus';
import { Regionalband } from './Regionalband';
import { bewerbungKopf } from './seite-text';

/**
 * Die Bewerbungsseite für /bewerbung und ihre vorgerenderten Varianten (app/bewerbung/variante/[stelle]/[hinweis]):
 * proxy.ts schreibt ?stelle= und den Unterlagen-Hinweis vor dem Cache dorthin um (lib/apply/vorauswahl.ts), die Seite
 * selbst liest keine searchParams. Nicht über den Barrel exportiert (er wird von hier importiert).
 */

// Roadmap §10; gedeckt durch die Fakten apply60s und noCvNeeded.
const TITLE = `Bewerben in ${FACTS.apply60s.value} Sekunden – ohne Lebenslauf | Bad & Energie`;
const DESCRIPTION = `Bewirb dich in ca. ${FACTS.apply60s.value} Sekunden bei Bad und Energie in Wetzlar: ein paar kurze Fragen, Name und Telefon. Kein Lebenslauf nötig, 100 % diskret.`;

/** Für /bewerbung und jede Variante gleich: Canonical /bewerbung, indexierbar (der Browser zeigt /bewerbung?stelle=…). */
export const BEWERBUNG_METADATA = generatePageMetadata({
  title: TITLE,
  absoluteTitle: true,
  description: DESCRIPTION,
  path: BEWERBUNG_PFAD,
  keywords: ['Bewerbung SHK Wetzlar', 'Bewerben ohne Lebenslauf', 'Anlagenmechaniker Bewerbung', 'Handwerk Jobs Wetzlar'],
});

/** Wegweiser im Erklärteil: die Stellen mit eigener Anzeige, die gerade live sind, und die Wege nur im Flow. */
function wegweiserStellen(now: Date): { jobs: Job[]; ohneAnzeige: Job[] } {
  return {
    jobs: getActiveJobs().filter((job) => isJobLive(job, now)),
    ohneAnzeige: getFunnelOptions(now)
      .filter((option) => option.status === 'funnel_only')
      .map((option) => getJobById(option.id))
      .filter((job) => job !== undefined),
  };
}

/** Ohne Vorauswahl spricht das Regionalband für alle Stellen, die im Flow wählbar sind (live und funnel_only). */
function regionalStellen(now: Date): Job[] {
  return getFunnelOptions(now)
    .map((option) => getJobById(option.id))
    .filter((job) => job !== undefined);
}

export interface BewerbungSeiteProps {
  /** Vorgewählte Stelle (Variante; zum Renderzeitpunkt live oder funnel_only). */
  initialJobId?: ApplicationJobId;
  /** Altlinks ?tab=vault|direct und ?direct=true: Hinweis im Kopf auf die Zeile zu Unterlagen (E-BEW-027). */
  unterlagenWunsch?: boolean;
}

export function BewerbungSeite({ initialJobId, unterlagenWunsch = false }: BewerbungSeiteProps) {
  // Vorausgewählte Ausbildung oder Praktikum: meist noch Schule, also kein Arbeitgeber und keine Diskretionszusage.
  // Der Ablauf folgt der Kategorie: Das Schülerpraktikum fragt wie die Ausbildung, verspricht aber kein Werkzeugset.
  const preselected = initialJobId ? getJobById(initialJobId) : undefined;
  const audience = preselected ? processAudienceFor({ category: preselected.category, questionSet: preselected.apply.questionSet }) : 'fachkraft';
  const discretion = getDiscretionPromise(audience);

  const kopf = bewerbungKopf({ diskret: discretion !== null, unterlagenWunsch, unterlagenAnker: UNTERLAGEN_ANKER });

  return (
    <>
      {/* Der eine Graph der Seite (V6-B): globale Knoten und WebPage aus denselben Metadaten wie Title und Canonical. */}
      <JsonLd data={buildPageGraph({ metadata: BEWERBUNG_METADATA })} />

      {/* Kopf im Design des Einstiegs (E-023), Variante arbeit: Papier mit h1, schmale Navy-Fläche mit dem Haus;
          am Handy ein knappes Navy-Band. Keine rote Fläche: die Hauptaktion ist der Flow selbst. */}
      <Seitenkopf
        variante="arbeit"
        titelId="bewerbung-titel"
        etikett={kopf.etikett}
        titel={kopf.titel}
        unterzeile={kopf.unterzeile}
        mikrotext={kopf.mikrotext}
        zweitweg={kopf.zweitweg}
        masse={kopf.masse}
        panel={<KopfHaus />}
      />

      <BewerbungFlaeche
        flow={
          /* key: Ein Link auf eine andere Vorauswahl startet den Flow neu; eigene ?schritt=-Einträge nicht. */
          <ApplyFlow key={initialJobId ?? 'ohne-stelle'} variant="page" initialJobId={initialJobId} funnel="bewerbung" />
        }
        wege={
          <>
            {/* E-BEW-012/E-START-007: bis zur Anbindung in Phase 2 kein abgeschalteter Upload-Kasten, sondern eine Zeile
                mit WhatsApp und E-Mail (Plan §D „Upload-Sackgasse entfernen“); ab Phase 2 <Unterlagen auswahl={…} />. */}
            <UnterlagenZeile />
            <DirektSprechen diskretion={discretion} whatsappMessage={whatsAppMessageFor(BEWERBUNG_PFAD)} />
          </>
        }
        /* V6-G1: ruhiger Erklärteil im selben Abschnitt (E-023: „Kein Lebenslauf“ und „diskret“ bleiben in zwei
           Abschnitten); der Ablauf folgt der vorgewählten Stelle wie die Diskretionszusage. */
        erklaerung={
          <Erklaerung
            audience={audience}
            vorausgewaehlt={initialJobId !== undefined}
            schritte={preselected ? getJobProcessSteps(preselected) : undefined}
            {...wegweiserStellen(new Date())}
          />
        }
      />

      {/* Arbeitsort und Arbeitszeit der vorgewählten Stelle, ohne Vorauswahl aller offenen (Fakt offenFuer: Büro S5) */}
      <Regionalband stellen={preselected ? [preselected] : regionalStellen(new Date())} />
    </>
  );
}
