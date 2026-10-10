import { INITIATIVE_JOB_ID } from '@/lib/applications/constants';
import { INITIATIVE_QUESTION_SET } from '@/lib/apply/questions';
import { getFunnelOptions, getJobById } from '@/lib/jobs/registry';
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

/**
 * Auswahl im Flow: veröffentlichte und funnel_only-Stellen in Registry-Reihenfolge, dann
 * „Initiativ bewerben“. Mit `now` ohne abgelaufene Stellen (Flow); ohne `now` alle (Beschriftungen).
 */
export function getFlowJobOptions(now?: Date): FlowJobOption[] {
  return [
    ...getFunnelOptions(now).map((option) => ({
      id: option.id,
      slug: option.slug,
      label: option.shortTitle,
      labelShy: mitTrennstellen(option.shortTitle, getJobById(option.id)?.titleShy),
      summaryLabel: option.shortTitle,
      questionSet: option.questionSet,
      icon: STELLEN_ICON[option.category],
    })),
    INITIATIVE_OPTION,
  ];
}
