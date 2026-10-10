import { permanentRedirect } from 'next/navigation';
import { ApplyFlow } from '@/components/apply';
import { BewerbungFlaeche, bewerbungKopf, DirektSprechen, Erklaerung, KopfHaus, Regionalband } from '@/components/apply/seite';
import { UNTERLAGEN_ANKER, Unterlagen } from '@/components/apply/unterlagen';
import { Seitenkopf } from '@/components/seitenkopf';
import { JsonLd } from '@/components/seo/JsonLd';
import { WEBSITE_ID } from '@/components/site/site-jsonld';
import { jobIdFromParam, legacyRedirectTarget, type SearchParamsRecord, wantsDocuments } from '@/lib/apply/params';
import { getDiscretionPromise } from '@/lib/content/process';
import { FACTS } from '@/lib/content/facts';
import { getActiveJobs, getFunnelOptions, getJobById, isJobLive, type Job } from '@/lib/jobs/registry';
import { getCleanCanonicalUrl } from '@/lib/seo/canonical-links';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { whatsAppMessageFor } from '@/lib/utils/whatsapp-utils';

const PATH = '/bewerbung';
// Roadmap §10; gedeckt durch die Fakten apply60s und noCvNeeded.
const TITLE = `Bewerben in ${FACTS.apply60s.value} Sekunden – ohne Lebenslauf | Bad & Energie`;
const DESCRIPTION = `Bewirb dich in ca. ${FACTS.apply60s.value} Sekunden bei Bad und Energie in Wetzlar: ein paar kurze Fragen, Name und Telefon. Kein Lebenslauf nötig, 100 % diskret.`;

export const metadata = generatePageMetadata({
  title: TITLE,
  absoluteTitle: true,
  description: DESCRIPTION,
  path: PATH,
  keywords: ['Bewerbung SHK Wetzlar', 'Bewerben ohne Lebenslauf', 'Anlagenmechaniker Bewerbung', 'Handwerk Jobs Wetzlar'],
});

/**
 * `?stelle=` → Stellen-ID (aktueller Slug, alter Slug aus redirectFrom, Job-ID oder „initiativ“).
 * Abgelaufene Stellen (validThrough) werden nicht mehr vorausgewählt.
 */
function preselectedJob(params: SearchParamsRecord) {
  const options = getFunnelOptions(new Date()).map((option) => ({
    id: option.id,
    slug: option.slug,
    legacySlugs: getJobById(option.id)?.redirectFrom ?? [],
  }));
  return jobIdFromParam(params.stelle, options);
}

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

export default async function BewerbungPage({ searchParams }: { searchParams: Promise<SearchParamsRecord> }) {
  const params = await searchParams;

  // Altes Portal (E-BEW-027): ?tab=dossier war die A4-Mappe (308). quiz/form/vault/direct und ?direct=true landen
  // im Flow (200); vault/direct weisen im Kopf auf den Abschnitt „Unterlagen einreichen“ (wantsDocuments).
  const legacyTarget = legacyRedirectTarget(params);
  if (legacyTarget) permanentRedirect(legacyTarget);

  const url = getCleanCanonicalUrl(PATH);
  const initialJobId = preselectedJob(params);
  // Vorausgewählte Ausbildung: meist noch Schule, also kein Arbeitgeber und keine Diskretionszusage.
  const preselected = initialJobId ? getJobById(initialJobId) : undefined;
  const audience = preselected?.apply.questionSet ?? 'fachkraft';
  const discretion = getDiscretionPromise(audience);

  const kopf = bewerbungKopf({ diskret: discretion !== null, unterlagenWunsch: wantsDocuments(params), unterlagenAnker: UNTERLAGEN_ANKER });

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${url}#webpage`,
          url,
          name: TITLE,
          description: DESCRIPTION,
          isPartOf: { '@id': WEBSITE_ID },
          inLanguage: 'de-DE',
        }}
      />

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
            {/* E-BEW-012/E-START-007: ehrlich abgeschaltet bis zur Anbindung in Phase 2 (R5-UPLOAD-01). */}
            <Unterlagen />
            <DirektSprechen diskretion={discretion} whatsappMessage={whatsAppMessageFor(PATH)} />
          </>
        }
        /* V6-G1: ruhiger Erklärteil im selben Abschnitt (E-023: „Kein Lebenslauf“ und „diskret“ bleiben in zwei
           Abschnitten); der Ablauf folgt der vorgewählten Stelle wie die Diskretionszusage. */
        erklaerung={<Erklaerung audience={audience} vorausgewaehlt={initialJobId !== undefined} {...wegweiserStellen(new Date())} />}
      />

      <Regionalband />
    </>
  );
}
