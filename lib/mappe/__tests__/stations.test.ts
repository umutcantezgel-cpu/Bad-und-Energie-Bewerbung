import { describe, expect, it } from 'vitest';

import { createEmptyEditorState, mappeEditorReducer } from '../editor';
import { MAPPE_LIMITS, SKILL_OPTIONS } from '../options';
import {
  createStationId,
  emptyCareerStation,
  emptyEducationStation,
  isCareerStationEmpty,
  listReducer,
  splitTasks,
  type CareerStationDraft,
} from '../stations';

const station = (id: string, role = id): CareerStationDraft => ({ ...emptyCareerStation(id), role });

describe('listReducer', () => {
  const list = [station('a'), station('b'), station('c')];

  it('adds to the end and respects the maximum', () => {
    expect(listReducer(list, { type: 'add', item: station('d'), max: 12 }).map((s) => s.id)).toEqual(['a', 'b', 'c', 'd']);
    expect(listReducer(list, { type: 'add', item: station('d'), max: 3 }).map((s) => s.id)).toEqual(['a', 'b', 'c']);
  });

  it('re-inserts at an index (undo after removal) and ignores duplicate ids', () => {
    expect(listReducer(list, { type: 'add', item: station('x'), max: 12, index: 1 }).map((s) => s.id)).toEqual(['a', 'x', 'b', 'c']);
    expect(listReducer(list, { type: 'add', item: station('x'), max: 12, index: 99 }).map((s) => s.id)).toEqual(['a', 'b', 'c', 'x']);
    expect(listReducer(list, { type: 'add', item: station('x'), max: 12, index: -3 }).map((s) => s.id)).toEqual(['x', 'a', 'b', 'c']);
    expect(listReducer(list, { type: 'add', item: station('b'), max: 12 }).map((s) => s.id)).toEqual(['a', 'b', 'c']);
  });

  it('removes by id and ignores unknown ids', () => {
    expect(listReducer(list, { type: 'remove', id: 'b' }).map((s) => s.id)).toEqual(['a', 'c']);
    expect(listReducer(list, { type: 'remove', id: 'x' }).map((s) => s.id)).toEqual(['a', 'b', 'c']);
  });

  it('moves up and down and stops at the edges', () => {
    expect(listReducer(list, { type: 'move', id: 'b', direction: -1 }).map((s) => s.id)).toEqual(['b', 'a', 'c']);
    expect(listReducer(list, { type: 'move', id: 'b', direction: 1 }).map((s) => s.id)).toEqual(['a', 'c', 'b']);
    expect(listReducer(list, { type: 'move', id: 'a', direction: -1 }).map((s) => s.id)).toEqual(['a', 'b', 'c']);
    expect(listReducer(list, { type: 'move', id: 'c', direction: 1 }).map((s) => s.id)).toEqual(['a', 'b', 'c']);
    expect(listReducer(list, { type: 'move', id: 'x', direction: 1 }).map((s) => s.id)).toEqual(['a', 'b', 'c']);
  });

  it('updates one entry immutably', () => {
    const next = listReducer(list, { type: 'update', id: 'b', patch: { company: 'Betrieb' } });
    expect(next[1]).toEqual({ ...list[1], company: 'Betrieb' });
    expect(list[1].company).toBe('');
    expect(next[0]).toBe(list[0]);
  });

  it('never mutates the input list', () => {
    const frozen = Object.freeze([...list]);
    expect(() => listReducer(frozen, { type: 'move', id: 'a', direction: 1 })).not.toThrow();
    expect(() => listReducer(frozen, { type: 'add', item: station('d'), max: 12 })).not.toThrow();
  });
});

describe('station helpers', () => {
  it('starts empty: no invented default entries', () => {
    const state = createEmptyEditorState();
    expect(state.careerStations).toEqual([]);
    expect(state.educationStations).toEqual([]);
    expect(isCareerStationEmpty(emptyCareerStation())).toBe(true);
    expect(Object.values(emptyEducationStation('x')).filter((v) => v !== 'x').every((v) => v === '')).toBe(true);
  });

  it('creates unique ids', () => {
    const ids = new Set(Array.from({ length: 200 }, () => createStationId()));
    expect(ids.size).toBe(200);
  });

  it('splits tasks per line, strips bullets and caps the count', () => {
    expect(splitTasks('- Montage\n\n• Wartung \r\n* Kundendienst\n  ')).toEqual(['Montage', 'Wartung', 'Kundendienst']);
    expect(splitTasks(Array.from({ length: 10 }, (_, i) => `Aufgabe ${i}`).join('\n'), 8)).toHaveLength(8);
  });
});

describe('mappeEditorReducer', () => {
  it('routes station actions to the right list', () => {
    let state = createEmptyEditorState();
    state = mappeEditorReducer(state, { type: 'career', action: { type: 'add', item: station('a'), max: 12 } });
    state = mappeEditorReducer(state, {
      type: 'education',
      action: { type: 'add', item: emptyEducationStation('e'), max: 8 },
    });
    expect(state.careerStations.map((s) => s.id)).toEqual(['a']);
    expect(state.educationStations.map((s) => s.id)).toEqual(['e']);
  });

  it('toggles skills, ignores duplicates and stops at the maximum', () => {
    let state = createEmptyEditorState();
    state = mappeEditorReducer(state, { type: 'toggleSkill', skill: SKILL_OPTIONS[0] });
    state = mappeEditorReducer(state, { type: 'addSkill', skill: ` ${SKILL_OPTIONS[0].toUpperCase()} ` });
    expect(state.skills).toEqual([SKILL_OPTIONS[0]]);
    state = mappeEditorReducer(state, { type: 'toggleSkill', skill: SKILL_OPTIONS[0] });
    expect(state.skills).toEqual([]);

    for (let i = 0; i < MAPPE_LIMITS.skills + 3; i += 1) {
      state = mappeEditorReducer(state, { type: 'addSkill', skill: `Schwerpunkt ${i}` });
    }
    expect(state.skills).toHaveLength(MAPPE_LIMITS.skills);
    expect(mappeEditorReducer(state, { type: 'addSkill', skill: '   ' }).skills).toHaveLength(MAPPE_LIMITS.skills);
  });

  it('switches between template and custom letter', () => {
    let state = createEmptyEditorState();
    state = mappeEditorReducer(state, { type: 'letter', text: 'Eigener Text' });
    expect(state.customLetter).toBe('Eigener Text');
    state = mappeEditorReducer(state, { type: 'resetLetter' });
    expect(state.customLetter).toBeNull();
  });
});
