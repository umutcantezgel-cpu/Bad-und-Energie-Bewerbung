import { COMPANY } from '@/lib/content/company';
import { FACTS } from '@/lib/content/facts';
import { getDiscretionPromise } from '@/lib/content/process';
import { ApplyFlowClient } from './ApplyFlowClient';
import { getFlowJobOptions } from './options';
import type { ApplyFlowProps, FlowZusagen } from './types';

/** Diskretionszusage je Fragenset: Fachkraft und Quereinstieg ja, Ausbildung nein (E-BEW-004). */
const ZUSAGEN: FlowZusagen = Object.freeze({
  fachkraft: getDiscretionPromise('fachkraft'),
  quereinstieg: getDiscretionPromise('quereinstieg'),
  ausbildung: getDiscretionPromise('ausbildung'),
});

/**
 * Der eine Bewerbungsflow (ROADMAP §6, C1) für /bewerbung, Stellenseiten und später /lp.
 * Ohne 'use client': Auf dem Server liest er Registry und Stammdaten und reicht nur die
 * kleinen Auswahl- und Kontaktdaten an den Client-Teil weiter, damit Job-Texte und zod-Schemata
 * der Stellen nicht im Browser-Bundle landen. Dazu die Diskretionszusage je Fragenset und die
 * Zeitangabe für die Passungs-Rahmung (Fakt apply60s).
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
      zusagen={ZUSAGEN}
      sekunden={FACTS.apply60s.value}
    />
  );
}
