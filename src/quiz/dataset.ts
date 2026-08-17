import { VIRTUE_CODES } from './types';
import type {
  QuizDataset,
  QuizQuestion,
  ScoredQuestion,
  UnscoredQuestion,
  VirtueCode,
  WeightVector,
} from './types';

export function isScoredQuestion(question: QuizQuestion): question is ScoredQuestion {
  return question.kind === 'scored';
}

export function isUnscoredQuestion(question: QuizQuestion): question is UnscoredQuestion {
  return question.kind === 'unscored';
}

export function getScoredQuestions(dataset: Pick<QuizDataset, 'questions'>): ScoredQuestion[] {
  return dataset.questions.filter(isScoredQuestion);
}

export function getUnscoredQuestions(dataset: Pick<QuizDataset, 'questions'>): UnscoredQuestion[] {
  return dataset.questions.filter(isUnscoredQuestion);
}

export function emptyWeightVector(): WeightVector {
  return Object.fromEntries(VIRTUE_CODES.map((code) => [code, 0])) as WeightVector;
}

export function computeNormalisationMax(
  questions: ReadonlyArray<ScoredQuestion>,
): WeightVector {
  const totals = emptyWeightVector();

  for (const question of questions) {
    for (const code of VIRTUE_CODES) {
      totals[code] += Math.abs(question.weights[code]);
    }
  }

  return totals;
}

export function virtueCodeIndex(code: VirtueCode): number {
  return VIRTUE_CODES.indexOf(code);
}
