import { createDevelopmentDataset } from '../../src/data/development-dataset';
import { VIRTUE_CODES } from '../../src/quiz/types';
import type {
  AnswerValue,
  QuizAnswers,
  QuizDataset,
  WeightVector,
} from '../../src/quiz/types';

const SYNTHETIC_WEIGHTS: WeightVector = {
  DET: 1,
  BRV: -1,
  JUS: 2,
  KND: -2,
  PAT: 0.5,
  INT: -0.5,
  PER: 3,
};

export function createSyntheticDataset(): QuizDataset {
  return createDevelopmentDataset();
}

export function createCompleteAnswers(
  dataset: QuizDataset,
  scoredAnswer: AnswerValue | ((index: number) => AnswerValue),
  unscoredAnswer: 0 | 1 = 0,
): Record<string, number> {
  const answers: Record<string, number> = {};
  let scoredIndex = 0;

  for (const question of dataset.questions) {
    if (question.kind === 'scored') {
      answers[question.id] = typeof scoredAnswer === 'function'
        ? scoredAnswer(scoredIndex)
        : scoredAnswer;
      scoredIndex += 1;
    } else {
      answers[question.id] = unscoredAnswer;
    }
  }

  return answers satisfies QuizAnswers;
}

export function expectedNormalisationMax(): WeightVector {
  return Object.fromEntries(
    VIRTUE_CODES.map((code) => [code, Math.abs(SYNTHETIC_WEIGHTS[code]) * 66]),
  ) as WeightVector;
}
