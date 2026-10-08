import { INITIATIVE_JOB_ID } from '@/lib/applications/schema';
import { INITIATIVE_QUESTION_SET } from '@/lib/apply/questions';
import { getFunnelOptions } from '@/lib/jobs/registry';
import type { FlowJobOption } from './types';

export const INITIATIVE_OPTION: FlowJobOption = Object.freeze({
  id: INITIATIVE_JOB_ID,
  slug: null,
  label: 'Initiativ bewerben',
  summaryLabel: 'Initiativbewerbung',
  description: 'Keine passende Stelle dabei',
  questionSet: INITIATIVE_QUESTION_SET,
});

/** Auswahl im Flow: veröffentlichte und funnel_only-Stellen in Registry-Reihenfolge, dann „Initiativ bewerben“. */
export function getFlowJobOptions(): FlowJobOption[] {
  return [
    ...getFunnelOptions().map((option) => ({
      id: option.id,
      slug: option.slug,
      label: option.shortTitle,
      summaryLabel: option.shortTitle,
      questionSet: option.questionSet,
    })),
    INITIATIVE_OPTION,
  ];
}
