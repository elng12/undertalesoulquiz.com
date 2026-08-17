import type { AnswerValue, QuizDataset, QuizQuestion } from './types';

export const QUIZ_STATE_SCHEMA_VERSION = 1 as const;

export type QuizPhase = 'landing' | 'in-progress' | 'complete';

export interface QuizSpecialState {
  hasEgg: boolean;
}

export interface QuizState {
  schemaVersion: typeof QUIZ_STATE_SCHEMA_VERSION;
  datasetVersion: string;
  phase: QuizPhase;
  currentQuestionId: string | null;
  answers: Record<string, AnswerValue>;
  specialState: QuizSpecialState;
}

export type QuizStateAction =
  | { type: 'start' }
  | { type: 'answer'; questionId: string; value: number }
  | { type: 'back' }
  | { type: 'grant-egg' }
  | { type: 'reset' }
  | { type: 'retake' };

export class QuizStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuizStateError';
  }
}

export function createInitialQuizState(dataset: Pick<QuizDataset, 'datasetVersion'>): QuizState {
  return {
    schemaVersion: QUIZ_STATE_SCHEMA_VERSION,
    datasetVersion: dataset.datasetVersion,
    phase: 'landing',
    currentQuestionId: null,
    answers: {},
    specialState: { hasEgg: false },
  };
}

export function reduceQuizState(
  dataset: QuizDataset,
  state: QuizState,
  action: QuizStateAction,
): QuizState {
  assertStateMatchesDataset(dataset, state);

  if (action.type === 'reset' || action.type === 'retake') {
    return createInitialQuizState(dataset);
  }

  if (action.type === 'grant-egg') {
    if (state.specialState.hasEgg) return state;
    return {
      ...state,
      specialState: { ...state.specialState, hasEgg: true },
    };
  }

  if (action.type === 'start') {
    if (state.phase !== 'landing') return state;
    const firstQuestion = dataset.questions[0];
    if (!firstQuestion) throw new QuizStateError('The dataset does not contain a first question.');
    return {
      ...state,
      phase: 'in-progress',
      currentQuestionId: firstQuestion.id,
    };
  }

  if (action.type === 'back') return moveBack(dataset, state);
  return answerCurrentQuestion(dataset, state, action.questionId, action.value);
}

function answerCurrentQuestion(
  dataset: QuizDataset,
  state: QuizState,
  questionId: string,
  value: number,
): QuizState {
  if (state.phase !== 'in-progress' || state.currentQuestionId === null) {
    throw new QuizStateError('An answer can only be submitted while the quiz is in progress.');
  }
  if (questionId !== state.currentQuestionId) {
    throw new QuizStateError(`Question ${questionId} is not the current question.`);
  }

  const currentIndex = dataset.questions.findIndex((question) => question.id === questionId);
  const question = dataset.questions[currentIndex];
  if (!question) throw new QuizStateError(`Question ${questionId} does not exist in this dataset.`);
  if (!isValidAnswer(question, value)) {
    throw new QuizStateError(`Question ${questionId} does not accept answer ${String(value)}.`);
  }

  const answers = { ...state.answers, [questionId]: value as AnswerValue };
  const nextQuestion = dataset.questions[currentIndex + 1];
  if (!nextQuestion) {
    return {
      ...state,
      phase: 'complete',
      currentQuestionId: null,
      answers,
    };
  }

  return {
    ...state,
    currentQuestionId: nextQuestion.id,
    answers,
  };
}

function moveBack(dataset: QuizDataset, state: QuizState): QuizState {
  if (state.phase === 'landing') return state;

  if (state.phase === 'complete') {
    const lastQuestion = dataset.questions.at(-1);
    if (!lastQuestion) throw new QuizStateError('The dataset does not contain a last question.');
    return {
      ...state,
      phase: 'in-progress',
      currentQuestionId: lastQuestion.id,
    };
  }

  const currentIndex = dataset.questions.findIndex(
    (question) => question.id === state.currentQuestionId,
  );
  if (currentIndex < 0) {
    throw new QuizStateError('The current question does not exist in this dataset.');
  }
  if (currentIndex === 0) return state;

  const previousQuestion = dataset.questions[currentIndex - 1];
  if (!previousQuestion) throw new QuizStateError('The previous question is unavailable.');
  return { ...state, currentQuestionId: previousQuestion.id };
}

export function isValidAnswer(question: QuizQuestion, value: unknown): value is AnswerValue {
  if (typeof value !== 'number' || !Number.isInteger(value)) return false;
  return question.kind === 'scored'
    ? value >= 0 && value <= 4
    : value === 0 || value === 1;
}

function assertStateMatchesDataset(dataset: QuizDataset, state: QuizState): void {
  if (state.schemaVersion !== QUIZ_STATE_SCHEMA_VERSION) {
    throw new QuizStateError(`Unsupported state schema version ${String(state.schemaVersion)}.`);
  }
  if (state.datasetVersion !== dataset.datasetVersion) {
    throw new QuizStateError('The quiz state belongs to a different dataset version.');
  }
}
