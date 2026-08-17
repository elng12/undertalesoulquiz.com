import { describe, expect, it } from 'vitest';
import {
  QUIZ_PROGRESS_STORAGE_KEY,
  clearQuizState,
  loadQuizState,
  saveQuizState,
} from '../../src/quiz/persistence';
import type { StorageLike } from '../../src/quiz/persistence';
import {
  createInitialQuizState,
  reduceQuizState,
} from '../../src/quiz/state-machine';
import type { QuizState } from '../../src/quiz/state-machine';
import type { QuizDataset } from '../../src/quiz/types';
import { createSyntheticDataset } from '../fixtures/synthetic-dataset';

class MemoryStorage implements StorageLike {
  readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

function answerCurrent(dataset: QuizDataset, state: QuizState, value: number): QuizState {
  if (!state.currentQuestionId) throw new Error('The test state has no current question.');
  return reduceQuizState(dataset, state, {
    type: 'answer',
    questionId: state.currentQuestionId,
    value,
  });
}

function createProgress(dataset: QuizDataset, count = 2): QuizState {
  let state = reduceQuizState(dataset, createInitialQuizState(dataset), { type: 'start' });
  for (let index = 0; index < count; index += 1) {
    const question = dataset.questions.find((entry) => entry.id === state.currentQuestionId);
    if (!question) throw new Error('The test state points to an unknown question.');
    state = answerCurrent(dataset, state, question.kind === 'scored' ? 2 : 0);
  }
  return state;
}

describe('quiz persistence', () => {
  const fixedNow = () => new Date('2026-08-17T00:00:00.000Z');

  it('returns a fresh landing state when no progress exists', () => {
    const dataset = createSyntheticDataset();
    const result = loadQuizState(new MemoryStorage(), dataset);

    expect(result.status).toBe('empty');
    expect(result.state).toEqual(createInitialQuizState(dataset));
  });

  it('saves and restores in-progress answers, position, egg, and timestamp', () => {
    const dataset = createSyntheticDataset();
    const storage = new MemoryStorage();
    let state = createProgress(dataset);
    state = reduceQuizState(dataset, state, { type: 'grant-egg' });

    expect(saveQuizState(storage, state, fixedNow)).toEqual({
      status: 'saved',
      updatedAt: '2026-08-17T00:00:00.000Z',
    });
    expect(loadQuizState(storage, dataset)).toEqual({
      status: 'restored',
      state,
      updatedAt: '2026-08-17T00:00:00.000Z',
    });
  });

  it('restores a completed state and an editing state with complete answers', () => {
    const dataset = createSyntheticDataset();
    const storage = new MemoryStorage();
    let complete = createProgress(dataset, 68);
    expect(complete.phase).toBe('complete');

    saveQuizState(storage, complete, fixedNow);
    expect(loadQuizState(storage, dataset).state.phase).toBe('complete');

    complete = reduceQuizState(dataset, complete, { type: 'back' });
    saveQuizState(storage, complete, fixedNow);
    expect(loadQuizState(storage, dataset)).toMatchObject({
      status: 'restored',
      state: {
        phase: 'in-progress',
        currentQuestionId: dataset.questions.at(-1)?.id,
      },
    });
  });

  it.each([
    ['invalid-json', '{'],
    ['unsupported-schema', JSON.stringify({ schemaVersion: 2 })],
  ] as const)('discards %s data and removes only the quiz key', (reason, raw) => {
    const dataset = createSyntheticDataset();
    const storage = new MemoryStorage();
    storage.values.set(QUIZ_PROGRESS_STORAGE_KEY, raw);
    storage.values.set('unrelated', 'keep-me');

    expect(loadQuizState(storage, dataset)).toMatchObject({
      status: 'discarded',
      reason,
      cleared: true,
      state: createInitialQuizState(dataset),
    });
    expect(storage.values.has(QUIZ_PROGRESS_STORAGE_KEY)).toBe(false);
    expect(storage.values.get('unrelated')).toBe('keep-me');
  });

  it('discards progress from another dataset version', () => {
    const dataset = createSyntheticDataset();
    const storage = new MemoryStorage();
    saveQuizState(storage, createProgress(dataset), fixedNow);

    const nextDataset = { ...dataset, datasetVersion: 'synthetic-v2' };
    expect(loadQuizState(storage, nextDataset)).toMatchObject({
      status: 'discarded',
      reason: 'dataset-version-mismatch',
      cleared: true,
    });
  });

  it.each([
    ['unknown answer', (value: Record<string, unknown>) => {
      (value.answers as Record<string, unknown>).unknown = 2;
    }],
    ['invalid unscored answer', (value: Record<string, unknown>) => {
      const answers = value.answers as Record<string, unknown>;
      answers['synthetic-unscored-1'] = 4;
    }],
    ['answer gap', (value: Record<string, unknown>) => {
      delete (value.answers as Record<string, unknown>)['synthetic-scored-01'];
    }],
    ['unknown current question', (value: Record<string, unknown>) => {
      value.currentQuestionId = 'missing';
    }],
    ['invalid timestamp', (value: Record<string, unknown>) => {
      value.updatedAt = 'not-a-date';
    }],
  ] as const)('discards structurally invalid state: %s', (_label, mutate) => {
    const dataset = createSyntheticDataset();
    const storage = new MemoryStorage();
    saveQuizState(storage, createProgress(dataset, 67), fixedNow);
    const value = JSON.parse(storage.getItem(QUIZ_PROGRESS_STORAGE_KEY) ?? '{}') as Record<string, unknown>;
    mutate(value);
    storage.setItem(QUIZ_PROGRESS_STORAGE_KEY, JSON.stringify(value));

    expect(loadQuizState(storage, dataset)).toMatchObject({
      status: 'discarded',
      reason: 'invalid-state',
      cleared: true,
    });
  });

  it('clears persisted progress for landing, reset, and explicit clear', () => {
    const dataset = createSyntheticDataset();
    const storage = new MemoryStorage();
    storage.values.set('unrelated', 'keep-me');

    expect(saveQuizState(storage, createInitialQuizState(dataset), fixedNow)).toEqual({
      status: 'cleared',
    });
    storage.values.set(QUIZ_PROGRESS_STORAGE_KEY, 'progress');
    expect(clearQuizState(storage)).toEqual({ status: 'cleared' });
    expect(storage.values.get('unrelated')).toBe('keep-me');
  });

  it('keeps the quiz usable when storage reads, writes, or cleanup fail', () => {
    const dataset = createSyntheticDataset();
    const throwingStorage: StorageLike = {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('full'); },
      removeItem: () => { throw new Error('blocked'); },
    };

    expect(loadQuizState(throwingStorage, dataset)).toEqual({
      status: 'unavailable',
      state: createInitialQuizState(dataset),
      reason: 'storage-unavailable',
    });
    expect(saveQuizState(throwingStorage, createProgress(dataset), fixedNow)).toEqual({
      status: 'unavailable',
      reason: 'storage-unavailable',
    });
    expect(clearQuizState(throwingStorage)).toEqual({
      status: 'unavailable',
      reason: 'storage-unavailable',
    });
  });

  it('reports when invalid data cannot be removed', () => {
    const dataset = createSyntheticDataset();
    const storage: StorageLike = {
      getItem: () => '{',
      setItem: () => undefined,
      removeItem: () => { throw new Error('blocked'); },
    };

    expect(loadQuizState(storage, dataset)).toMatchObject({
      status: 'discarded',
      reason: 'invalid-json',
      cleared: false,
    });
  });
});
