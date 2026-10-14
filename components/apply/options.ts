import { INITIATIVE_JOB_ID } from '@/lib/applications/constants';
import { INITIATIVE_QUESTION_SET } from '@/lib/apply/questions';
import { FACTS } from '@/lib/content/facts';
import { getFunnelOptions, getJobById, type Job } from '@/lib/jobs/registry';
import { STELLEN_ICON, mitTrennstellen } from './strang/strang-text';
import type { FlowJobOption } from './types';

export const INITIATIVE_OPTION: FlowJobOption = Object.freeze({
  id: INITIATIVE_JOB_ID,
  slug: null,
  label: 'Initiativ bewerben',
  summaryLabel: 'Initiativbewerbung',
  description: 'Keine passende Stelle dabei',
  questionSet: INITIATIVE_QUESTION_SET,
  icon: STELLEN_ICON.initiativ,
});

/** Paketzeile „Vergütung“, die über Tarif bezahlt („über Tarif“, „übertarifliche Bezahlung“). */
const UEBER_TARIF = /über Tarif|übertariflich/i;

/**
 * Zusatzleistungen statt Gehalt (E-030, Plan §D) unter dem Namen der Stelle: „Über Tarif · 30 Tage Urlaub“, nur aus den
 * Daten der Stelle (Fakten aboveTariff und vacation30, Paketzeile „Vergütung“). Ohne belegte Angabe keine Zeile; beim
 * Schülerpraktikum nie (kein Wort zu Geld).
 */
export function zusatzZeile(job: Pick<Job, 'pay' | 'benefitFactIds' | 'packageExtras'>): string | undefined {
  if (job.pay !== 'auf-anfrage') return undefined;
  const teile: string[] = [];
  const tarif =
    job.benefitFactIds.includes('aboveTariff') ||
    job.packageExtras.some((extra) => extra.label === 'Vergütung' && UEBER_TARIF.test(extra.text));
  if (tarif) teile.push('Über Tarif');
  if (job.benefitFactIds.includes('vacation30')) teile.push(FACTS.vacation30.short);
  return teile.length > 0 ? teile.join(' · ') : undefined;
}

/**
 * Auswahl im Flow: veröffentlichte und funnel_only-Stellen in Registry-Reihenfolge, dann
 * „Initiativ bewerben“. Mit `now` ohne abgelaufene Stellen (Flow); ohne `now` alle (Beschriftungen).
 */
export function getFlowJobOptions(now?: Date): FlowJobOption[] {
  return [
    ...getFunnelOptions(now).map((option) => {
      const job = getJobById(option.id);
      const description = job ? zusatzZeile(job) : undefined;
      return {
        id: option.id,
        slug: option.slug,
        label: option.shortTitle,
        labelShy: mitTrennstellen(option.shortTitle, job?.titleShy),
        summaryLabel: option.shortTitle,
        ...(description ? { description } : {}),
        questionSet: option.questionSet,
        icon: STELLEN_ICON[option.category],
      };
    }),
    INITIATIVE_OPTION,
  ];
}
