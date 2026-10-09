import { COMPANY } from '@/lib/content/company';
import { FACTS } from '@/lib/content/facts';
import { ApplyFlowClient } from './ApplyFlowClient';
import { getFlowJobOptions } from './options';
import type { ApplyFlowProps } from './types';

/**
 * Der eine Bewerbungsflow (ROADMAP §6, C1) für /bewerbung, Stellenseiten und später /lp.
 * Ohne 'use client': Auf dem Server liest er Registry und Stammdaten und reicht nur die
 * kleinen Auswahl- und Kontaktdaten an den Client-Teil weiter, damit Job-Texte und zod-Schemata
 * der Stellen nicht im Browser-Bundle landen.
 */
export function ApplyFlow({ initialJobId, ...props }: ApplyFlowProps) {
  // Nur Stellen, die jetzt live sind (validThrough), wie Stellenseite und Sitemap.
  const options = getFlowJobOptions(new Date());
  const preselected = initialJobId && options.some((option) => option.id === initialJobId) ? initialJobId : undefined;
  return (
    <ApplyFlowClient
      {...props}
      initialJobId={preselected}
      options={options}
      contact={{ phoneDisplay: COMPANY.phone.display, phoneHref: COMPANY.phone.href }}
      quickResponse={FACTS.quickResponse.long}
    />
  );
}
