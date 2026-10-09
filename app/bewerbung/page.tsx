import { permanentRedirect } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { ApplyFlow } from '@/components/apply';
import { Container, Section } from '@/components/layout';
import { JsonLd } from '@/components/seo/JsonLd';
import { ContactOptions } from '@/components/site/ContactOptions';
import { WEBSITE_ID } from '@/components/site/site-jsonld';
import { jobIdFromParam, legacyRedirectTarget, type SearchParamsRecord } from '@/lib/apply/params';
import { getDiscretionPromise } from '@/lib/content/process';
import { FACTS } from '@/lib/content/facts';
import { getFunnelOptions, getJobById } from '@/lib/jobs/registry';
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

export default async function BewerbungPage({ searchParams }: { searchParams: Promise<SearchParamsRecord> }) {
  const params = await searchParams;

  // Altes Portal: ?tab=dossier war die A4-Mappe. quiz/form/vault/direct und ?direct=true landen im Flow.
  const legacyTarget = legacyRedirectTarget(params);
  if (legacyTarget) permanentRedirect(legacyTarget);

  const url = getCleanCanonicalUrl(PATH);
  const initialJobId = preselectedJob(params);
  // Vorausgewählte Ausbildung: meist noch Schule, also kein Arbeitgeber und keine Diskretionszusage.
  const preselected = initialJobId ? getJobById(initialJobId) : undefined;
  const discretion = getDiscretionPromise(preselected?.apply.questionSet);

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
      <h1 className="sr-only">Bewerbung bei Bad und Energie</h1>

      <Container size="prose" className="pb-section-sm pt-6 sm:pt-10">
        {/* key: Ein Link auf eine andere Vorauswahl startet den Flow neu; eigene ?schritt=-Einträge nicht. */}
        <ApplyFlow key={initialJobId ?? 'ohne-stelle'} variant="page" initialJobId={initialJobId} funnel="bewerbung" />
      </Container>

      <Section tone="subtle" spacing="compact" aria-labelledby="bewerbung-kontakt">
        <Container size="prose" className="flex flex-col gap-5">
          <h2 id="bewerbung-kontakt" className="text-title-3 text-ink">
            Lieber direkt sprechen?
          </h2>
          {discretion && (
            <p className="flex max-w-prose gap-3 text-body text-ink">
              <ShieldCheck aria-hidden="true" strokeWidth={1.75} className="mt-0.5 size-5 shrink-0 text-ink-muted" />
              {discretion}
            </p>
          )}
          <ContactOptions variant="inline" whatsappMessage={whatsAppMessageFor(PATH)} />
        </Container>
      </Section>
    </>
  );
}
