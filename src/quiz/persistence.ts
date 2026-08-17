import {
  QUIZ_STATE_SCHEMA_VERSION,
  createInitialQuizState,
  isValidAnswer,
} from './state-machine';
import type { QuizSpecialState, QuizState } from './state-machine';
import type { AnswerValue, QuizDataset } from './types';

export const QUIZ_PROGRESS_STORAGE_KEY = 'undertale-soul-quiz:progress:v1';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface PersistedQuizStateV1 {
  schemaVersion: typeof QUIZ_STATE_SCHEMA_VERSION;
  datasetVersion: string;
  phase: 'in-progress' | 'complete';
  currentQuestionId: string | null;
  answers: Record<string, AnswerValue>;
  specialState: QuizSpecialState;
  updatedAt: string;
}

export type QuizPersistenceReason =
  | 'storage-unavailable'
  | 'invalid-json'
  | 'unsupported-schema'
  | 'dataset-version-mismatch'
  | 'invalid-state';

export type LoadQuizStateResult =
  | { status: 'empty'; state: QuizState }
  | { status: 'restored'; state: QuizState; updatedAt: string }
  | { status: 'discarded'; state: QuizState; reason: Exclude<QuizPersistenceReason, 'storage-unavailable'>; cleared: boolean }
  | { status: 'unavailable'; state: QuizState; reason: 'storage-unavailable' };

export type SaveQuizStateResult =
  | { status: 'saved'; updatedAt: string }
  | { status: 'cleared' }
  | { status: 'unavailable'; reason: 'storage-unavailable' };

export function saveQuizState(
  storage: StorageLike,
  state: QuizState,
  now: () => Date = () => new Date(),
): SaveQuizStateResult {
  try {
    if (state.phase === 'landing') {
      storage.removeItem(QUIZ_PROGRESS_STORAGE_KEY);
      return { status: 'cleared' };
    }

    const updatedAt = now().toISOString();
    const persisted: PersistedQuizStateV1 = {
      schemaVersion: QUIZ_STATE_SCHEMA_VERSION,
      datasetVersion: state.datasetVersion,
      phase: state.phase,
      currentQuestionId: state.currentQuestionId,
      answers: { ...state.answers },
      specialState: { ...state.specialState },
      updatedAt,
    };
    storage.setItem(QUIZ_PROGRESS_STORAGE_KEY, JSON.stringify(persisted));
    return { status: 'saved', updatedAt };
  } catch {
    return { status: 'unavailable', reason: 'storage-unavailable' };
  }
}

export function loadQuizState(
  storage: StorageLike,
  dataset: QuizDataset,
): LoadQuizStateResult {
  const initialState = createInitialQuizState(dataset);
  let raw: string | null;

  try {
    raw = storage.getItem(QUIZ_PROGRESS_STORAGE_KEY);
  } catch {
    return { status: 'unavailable', state: initialState, reason: 'storage-unavailable' };
  }
  if (raw === null) return { status: 'empty', state: initialState };

  let candidate: unknown;
  try {
    candidate = JSON.parse(raw);
  } catch {
    return discard(storage, initialState, 'invalid-json');
  }

  if (!isRecord(candidate)) return discard(storage, initialState, 'invalid-state');
  const basicReason = validateBasicShape(candidate, dataset.datasetVersion);
  if (basicReason) return discard(storage, initialState, basicReason);
  if (!isReachablePersistedState(candidate, dataset)) {
    return discard(storage, initialState, 'invalid-state');
  }
  const restored = candidate as unknown as PersistedQuizStateV1;

  return {
    status: 'restored',
    state: {
      schemaVersion: QUIZ_STATE_SCHEMA_VERSION,
      datasetVersion: restored.datasetVersion,
      phase: restored.phase,
      currentQuestionId: restored.currentQuestionId,
      answers: { ...restored.answers },
      specialState: { ...restored.specialState },
    },
    updatedAt: restored.updatedAt,
  };
}

export function clearQuizState(storage: StorageLike): SaveQuizStateResult {
  try {
    storage.removeItem(QUIZ_PROGRESS_STORAGE_KEY);
    return { status: 'cleared' };
  } catch {
    return { status: 'unavailable', reason: 'storage-unavailable' };
  }
}

function validateBasicShape(
  candidate: Record<string, unknown>,
  datasetVersion: string,
): Exclude<QuizPersistenceReason, 'storage-unavailable' | 'invalid-json'> | null {
  if (candidate.schemaVersion !== QUIZ_STATE_SCHEMA_VERSION) return 'unsupported-schema';
  if (candidate.datasetVersion !== datasetVersion) return 'dataset-version-mismatch';
  return null;
}

function isReachablePersistedState(
  candidate: Record<string, unknown>,
  dataset: QuizDataset,
): boolean {
  if (candidate.phase !== 'in-progress' && candidate.phase !== 'complete') return false;
  if (!isRecord(candidate.answers) || !isRecord(candidate.specialState)) return false;
  const answers = candidate.answers;
  const specialState = candidate.specialState;
  if (specialState.hasEgg !== true && specialState.hasEgg !== false) return false;
  if (typeof candidate.updatedAt !== 'string' || !Number.isFinite(Date.parse(candidate.updatedAt))) {
    return false;
  }

  const questionById = new Map(dataset.questions.map((question) => [question.id, question]));
  const answerIds = Object.keys(answers);
  for (const id of answerIds) {
    const question = questionById.get(id);
    if (!question || !isValidAnswer(question, answers[id])) return false;
  }

  const answeredPrefixLength = dataset.questions.findIndex(
    (question) => !Object.hasOwn(answers, question.id),
  );
  const prefixLength = answeredPrefixLength === -1
    ? dataset.questions.length
    : answeredPrefixLength;
  if (answerIds.length !== prefixLength) return false;

  if (candidate.phase === 'complete') {
    return prefixLength === dataset.questions.length && candidate.currentQuestionId === null;
  }

  if (typeof candidate.currentQuestionId !== 'string') return false;
  const currentIndex = dataset.questions.findIndex(
    (question) => question.id === candidate.currentQuestionId,
  );
  if (currentIndex < 0) return false;
  return currentIndex <= prefixLength;
}

function discard(
  storage: StorageLike,
  state: QuizState,
  reason: Exclude<QuizPersistenceReason, 'storage-unavailable'>,
): LoadQuizStateResult {
  let cleared = true;
  try {
    storage.removeItem(QUIZ_PROGRESS_STORAGE_KEY);
  } catch {
    cleared = false;
  }
  return { status: 'discarded', state, reason, cleared };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
