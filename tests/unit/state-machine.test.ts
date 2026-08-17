import { describe, expect, it } from 'vitest';
import {
  QuizStateError,
  createInitialQuizState,
  reduceQuizState,
} from '../../src/quiz/state-machine';
import type { QuizState } from '../../src/quiz/state-machine';
import type { QuizDataset } from '../../src/quiz/types';
import { createSyntheticDataset } from '../fixtures/synthetic-dataset';

function start(dataset: QuizDataset): QuizState {
  return reduceQuizState(dataset, createInitialQuizState(dataset), { type: 'start' });
}

function answerCurrent(dataset: QuizDataset, state: QuizState, value: number): QuizState {
  if (!state.currentQuestionId) throw new Error('The test state has no current question.');
  return reduceQuizState(dataset, state, {
    type: 'answer',
    questionId: state.currentQuestionId,
    value,
  });
}

describe('quiz state machine', () => {
  it('starts at the first question without mutating the landing state', () => {
    const dataset = createSyntheticDataset();
    const landing = createInitialQuizState(dataset);
    const started = reduceQuizState(dataset, landing, { type: 'start' });

    expect(landing).toEqual({
      schemaVersion: 1,
      datasetVersion: 'synthetic-v1',
      phase: 'landing',
      currentQuestionId: null,
      answers: {},
      specialState: { hasEgg: false },
    });
    expect(started.phase).toBe('in-progress');
    expect(started.currentQuestionId).toBe(dataset.questions[0]?.id);
    expect(started).not.toBe(landing);
  });

  it('records answers in order and completes after all 68 questions', () => {
    const dataset = createSyntheticDataset();
    let state = start(dataset);

    for (const question of dataset.questions) {
      expect(state.currentQuestionId).toBe(question.id);
      state = answerCurrent(dataset, state, question.kind === 'scored' ? 3 : 1);
    }

    expect(state.phase).toBe('complete');
    expect(state.currentQuestionId).toBeNull();
    expect(Object.keys(state.answers)).toHaveLength(68);
  });

  it('moves back, overwrites an earlier answer, and keeps later progress', () => {
    const dataset = createSyntheticDataset();
    let state = start(dataset);
    state = answerCurrent(dataset, state, 1);
    state = answerCurrent(dataset, state, 2);
    const thirdQuestionId = state.currentQuestionId;

    state = reduceQuizState(dataset, state, { type: 'back' });
    expect(state.currentQuestionId).toBe(dataset.questions[1]?.id);
    state = answerCurrent(dataset, state, 4);

    expect(state.currentQuestionId).toBe(thirdQuestionId);
    expect(state.answers[dataset.questions[1]?.id ?? '']).toBe(4);
    expect(Object.keys(state.answers)).toHaveLength(2);
  });

  it('returns from complete to the final question and can complete again', () => {
    const dataset = createSyntheticDataset();
    let state = start(dataset);
    for (const question of dataset.questions) {
      state = answerCurrent(dataset, state, question.kind === 'scored' ? 2 : 0);
    }

    state = reduceQuizState(dataset, state, { type: 'back' });
    expect(state.phase).toBe('in-progress');
    expect(state.currentQuestionId).toBe(dataset.questions.at(-1)?.id);
    state = answerCurrent(dataset, state, 1);
    expect(state.phase).toBe('complete');
    expect(state.answers[dataset.questions.at(-1)?.id ?? '']).toBe(1);
  });

  it('does not move before the first question', () => {
    const dataset = createSyntheticDataset();
    const state = start(dataset);
    expect(reduceQuizState(dataset, state, { type: 'back' })).toBe(state);
  });

  it('accepts five scored choices but only two unscored choices', () => {
    const dataset = createSyntheticDataset();
    const started = start(dataset);

    expect(() => answerCurrent(dataset, started, 5)).toThrow(QuizStateError);

    let state = started;
    for (let index = 0; index < 66; index += 1) state = answerCurrent(dataset, state, 2);
    expect(dataset.questions[66]?.kind).toBe('unscored');
    expect(() => answerCurrent(dataset, state, 2)).toThrow(QuizStateError);
    expect(answerCurrent(dataset, state, 1).answers[dataset.questions[66]?.id ?? '']).toBe(1);
  });

  it('rejects stale question submissions and mismatched dataset state', () => {
    const dataset = createSyntheticDataset();
    const state = start(dataset);
    const secondQuestion = dataset.questions[1];
    if (!secondQuestion) throw new Error('Fixture is incomplete.');

    expect(() => reduceQuizState(dataset, state, {
      type: 'answer',
      questionId: secondQuestion.id,
      value: 2,
    })).toThrow('is not the current question');
    expect(() => reduceQuizState(
      { ...dataset, datasetVersion: 'synthetic-v2' },
      state,
      { type: 'back' },
    )).toThrow('different dataset version');
  });

  it('tracks the egg separately and clears all progress on reset or retake', () => {
    const dataset = createSyntheticDataset();
    let state = answerCurrent(dataset, start(dataset), 3);
    state = reduceQuizState(dataset, state, { type: 'grant-egg' });
    expect(state.specialState.hasEgg).toBe(true);
    expect(reduceQuizState(dataset, state, { type: 'grant-egg' })).toBe(state);

    for (const action of [{ type: 'reset' }, { type: 'retake' }] as const) {
      expect(reduceQuizState(dataset, state, action)).toEqual(createInitialQuizState(dataset));
    }
  });
});
