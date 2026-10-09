import { describe, expect, it } from 'vitest';
import {
  CONTACT_STEP,
  firstOpenStep,
  flowReducer,
  getSteps,
  initFlowState,
  JOB_STEP,
  nextStepOf,
  previousStepOf,
  resolveStep,
  stepFromSlug,
  stepSlug,
  type FlowAction,
  type FlowState,
} from '../flow';

const run = (state: FlowState, ...actions: FlowAction[]) => actions.reduce(flowReducer, state);

describe('initial state', () => {
  it('starts on the job step without a preselection', () => {
    const state = initFlowState();
    expect(state.step).toBe(JOB_STEP);
    expect(state.showJobStep).toBe(true);
    expect(getSteps(state)).toEqual([JOB_STEP, 'qualification', 'start', CONTACT_STEP]);
  });

  it('skips the job step when a job is preselected', () => {
    const state = initFlowState({ jobId: 'ausbildung-anlagenmechaniker-shk', questionSet: 'ausbildung' });
    expect(state.step).toBe('schoolStatus');
    expect(getSteps(state)).toEqual(['schoolStatus', CONTACT_STEP]);
    expect(state.dirty).toBe(false);
  });
});

describe('navigation', () => {
  const fachkraft = initFlowState({ jobId: 'anlagenmechaniker-shk', questionSet: 'fachkraft' });

  it('moves forward in order and back again', () => {
    expect(nextStepOf(initFlowState(), JOB_STEP)).toBe(JOB_STEP); // no job chosen yet
    const answered = run(fachkraft, { type: 'answer', key: 'qualification', value: 'geselle-2-5' });
    expect(nextStepOf(answered, 'qualification')).toBe('start');
    const done = run(answered, { type: 'answer', key: 'start', value: 'sofort' });
    expect(nextStepOf(done, 'start')).toBe(CONTACT_STEP);
    expect(previousStepOf(done, CONTACT_STEP)).toBe('start');
    expect(previousStepOf(done, 'qualification')).toBeNull();
  });

  it('redirects deep links past the first open step', () => {
    expect(resolveStep(fachkraft, CONTACT_STEP)).toBe('qualification');
    expect(resolveStep(fachkraft, 'start')).toBe('qualification');
    expect(resolveStep(fachkraft, 'schoolStatus')).toBe('qualification'); // not in this set
    expect(resolveStep(fachkraft, null)).toBe('qualification');
    const answered = run(fachkraft, { type: 'answer', key: 'qualification', value: 'meister-techniker' });
    expect(resolveStep(answered, CONTACT_STEP)).toBe('start');
    expect(resolveStep(answered, 'qualification')).toBe('qualification');
  });

  it('goTo resolves through the same rules', () => {
    expect(run(fachkraft, { type: 'goTo', step: CONTACT_STEP }).step).toBe('qualification');
    const done = run(
      fachkraft,
      { type: 'answer', key: 'qualification', value: 'geselle-ueber-5' },
      { type: 'answer', key: 'start', value: '1-3-monate' },
      { type: 'goTo', step: CONTACT_STEP },
    );
    expect(done.step).toBe(CONTACT_STEP);
  });

  it('editJob shows the job step again', () => {
    const state = run(fachkraft, { type: 'editJob' });
    expect(state.step).toBe(JOB_STEP);
    expect(getSteps(state)[0]).toBe(JOB_STEP);
    expect(run(fachkraft, { type: 'goTo', step: JOB_STEP }).showJobStep).toBe(true);
  });

  it('maps steps to German URL slugs and back', () => {
    for (const step of [JOB_STEP, 'qualification', 'start', 'schoolStatus', 'background', 'licenseB', CONTACT_STEP] as const) {
      expect(stepFromSlug(stepSlug(step))).toBe(step);
    }
    expect(stepSlug('qualification')).toBe('erfahrung');
    expect(stepFromSlug('unbekannt')).toBeNull();
    expect(stepFromSlug(null)).toBeNull();
  });
});

describe('answers and job changes', () => {
  it('ignores answers that do not belong to the set or are invalid', () => {
    const state = initFlowState({ jobId: 'anlagenmechaniker-shk', questionSet: 'fachkraft' });
    expect(run(state, { type: 'answer', key: 'schoolStatus', value: 'schule-fertig' })).toBe(state);
    expect(run(state, { type: 'answer', key: 'start', value: 'nie' })).toBe(state);
  });

  it('drops answers that do not fit the new question set', () => {
    const state = run(
      initFlowState(),
      { type: 'selectJob', jobId: 'anlagenmechaniker-shk', questionSet: 'fachkraft' },
      { type: 'answer', key: 'qualification', value: 'geselle-2-5' },
      { type: 'answer', key: 'start', value: 'sofort' },
      { type: 'selectJob', jobId: 'quereinsteiger-montagehelfer', questionSet: 'quereinstieg' },
    );
    expect(state.answers).toEqual({ start: 'sofort' });
    expect(firstOpenStep(state)).toBe('background');
    expect(state.dirty).toBe(true);
  });

  it('keeps answers when switching within the same set', () => {
    const state = run(
      initFlowState({ jobId: 'anlagenmechaniker-shk', questionSet: 'fachkraft' }),
      { type: 'answer', key: 'qualification', value: 'geselle-2-5' },
      { type: 'selectJob', jobId: 'initiativ', questionSet: 'fachkraft' },
    );
    expect(state.answers).toEqual({ qualification: 'geselle-2-5' });
  });
});

describe('restore', () => {
  it('restores a draft and the requested step if reachable', () => {
    const state = run(initFlowState(), {
      type: 'restore',
      jobId: 'kundendiensttechniker-shk',
      questionSet: 'fachkraft',
      answers: { qualification: 'geselle-2-5', start: 'sofort' },
      step: CONTACT_STEP,
    });
    expect(state.jobId).toBe('kundendiensttechniker-shk');
    expect(state.step).toBe(CONTACT_STEP);
    expect(state.showJobStep).toBe(true); // the job was chosen in the flow, not preselected
  });

  it('falls back to the first open step and keeps a preselection hidden', () => {
    const preselected = initFlowState({ jobId: 'ausbildung-anlagenmechaniker-shk', questionSet: 'ausbildung' });
    const state = run(preselected, { type: 'restore', answers: { qualification: 'geselle-2-5' }, step: CONTACT_STEP });
    expect(state.answers).toEqual({});
    expect(state.step).toBe('schoolStatus');
    expect(state.showJobStep).toBe(false);
  });

  it('opens the job step when it is requested explicitly', () => {
    const preselected = initFlowState({ jobId: 'anlagenmechaniker-shk', questionSet: 'fachkraft' });
    const state = run(preselected, { type: 'restore', step: JOB_STEP });
    expect(state.step).toBe(JOB_STEP);
    expect(state.showJobStep).toBe(true);
  });
});
