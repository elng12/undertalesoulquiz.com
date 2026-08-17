import { computeNormalisationMax } from '../quiz/dataset';
import { ANSWER_PAYOUT, CURVE_EXPONENT } from '../quiz/types';
import type {
  CompletionSpecialRule,
  Provenance,
  QuizDataset,
  ScoredQuestion,
  UnscoredQuestion,
  WeightVector,
} from '../quiz/types';

const DEVELOPMENT_PROVENANCE: Provenance = {
  sourceKind: 'synthetic-test',
  sourceId: 'phase-2a-development-ui',
  sourceVersion: '1',
  obtainedAt: '2026-08-17',
  permissionStatus: 'not-for-production',
};

const DEVELOPMENT_WEIGHTS: WeightVector = {
  DET: 1,
  BRV: -1,
  JUS: 2,
  KND: -2,
  PAT: 0.5,
  INT: -0.5,
  PER: 3,
};

const COMPLETION_SPECIAL_RULES: CompletionSpecialRule[] = [
  { id: 'all-switch', pattern: 'halves', first: 0, second: 4 },
  { id: 'all-disagree', pattern: 'all', answer: 0 },
  { id: 'all-neutral', pattern: 'all', answer: 2 },
  { id: 'all-agree', pattern: 'all', answer: 4 },
];

export function createDevelopmentDataset(): QuizDataset {
  const scoredQuestions: ScoredQuestion[] = Array.from({ length: 66 }, (_, index) => ({
    kind: 'scored',
    id: `synthetic-scored-${String(index + 1).padStart(2, '0')}`,
    order: index + 1,
    prompt: `Synthetic development question ${String(index + 1).padStart(2, '0')}`,
    labels: ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'],
    weights: { ...DEVELOPMENT_WEIGHTS },
    provenance: { ...DEVELOPMENT_PROVENANCE },
  }));
  const unscoredQuestions: UnscoredQuestion[] = [1, 2].map((number, index) => ({
    kind: 'unscored',
    id: `synthetic-unscored-${number}`,
    order: 67 + index,
    prompt: `Synthetic final check ${number}`,
    options: [
      { id: 'no', label: 'No' },
      { id: 'yes', label: 'Yes' },
    ],
    provenance: { ...DEVELOPMENT_PROVENANCE },
  }));

  return {
    schemaVersion: 1,
    datasetVersion: 'synthetic-v1',
    questions: [...scoredQuestions, ...unscoredQuestions],
    completionSpecialRules: structuredClone(COMPLETION_SPECIAL_RULES),
    roomRule: {
      id: 'room-between',
      boundary: [57, 58],
      probabilityPerCrossing: 0.02,
      reward: 'egg',
    },
    answerPayout: [...ANSWER_PAYOUT],
    curveExponent: CURVE_EXPONENT,
    normalisationMax: computeNormalisationMax(scoredQuestions),
  };
}
