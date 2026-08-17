import { describe, expect, it } from 'vitest';
import { ORIGINAL_PRODUCTION_DATASET } from '../../src/data/original-production-dataset';
import { getScoredQuestions } from '../../src/quiz/dataset';
import { resolveQuizResult } from '../../src/quiz/scoring';
import { VIRTUE_CODES } from '../../src/quiz/types';
import type { AnswerValue, QuizDataset, VirtueCode } from '../../src/quiz/types';

type Pattern = (index: number, primaryDirection: 1 | -1) => AnswerValue;

interface ExpectedStandardVector {
  primary: VirtueCode;
  secondary: VirtueCode;
  display: Record<VirtueCode, number>;
  exact: Record<VirtueCode, number>;
}

const STANDARD_GOLDENS: Array<{
  id: string;
  pattern: Pattern;
  expected: ExpectedStandardVector;
}> = [
  {
    id: 'five-step-cycle',
    pattern: (index) => (index % 5) as AnswerValue,
    expected: vector('JUS', 'INT',
      [31, 29, 73, 43, 35, 68, 47],
      [31.45725357, 28.91488213, 73.39006623, 42.65153666, 34.59720358, 67.95739979, 47.1983026]),
  },
  {
    id: 'reverse-five-step-cycle',
    pattern: (index) => (4 - (index % 5)) as AnswerValue,
    expected: vector('BRV', 'DET',
      [58, 64, 21, 37, 52, 26, 38],
      [58.23869511, 63.9444835, 20.73574326, 37.26612633, 52.35753411, 25.64933799, 37.55686036]),
  },
  {
    id: 'alternating-soft-lean',
    pattern: (index) => index % 2 === 0 ? 1 : 3,
    expected: vector('INT', 'KND',
      [41, 32, 32, 54, 42, 78, 39],
      [40.75598259, 31.79137333, 31.79137333, 54.2982179, 42.4226594, 77.74178616, 39.26989448]),
  },
  {
    id: 'uniform-soft-agreement',
    pattern: () => 3,
    expected: vector('DET', 'PER',
      [60, 41, 41, 58, 47, 55, 59],
      [59.76260863, 40.75598259, 40.75598259, 58.02910304, 46.99314323, 54.85140199, 59.10106358]),
  },
  {
    id: 'uniform-soft-disagreement',
    pattern: () => 1,
    expected: vector('BRV', 'JUS',
      [32, 41, 41, 33, 37, 35, 32],
      [31.79137333, 40.75598259, 40.75598259, 32.88848632, 36.64568893, 34.59884895, 32.22143173]),
  },
  {
    id: 'fully-aligned-by-direction',
    pattern: (_index, direction) => direction > 0 ? 4 : 0,
    expected: vector('DET', 'BRV',
      [100, 100, 100, 100, 100, 100, 100],
      [100, 100, 100, 100, 100, 100, 100]),
  },
  {
    id: 'fully-opposed-by-direction',
    pattern: (_index, direction) => direction > 0 ? 0 : 4,
    expected: vector('DET', 'BRV',
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0]),
  },
];

describe('original production golden vectors', () => {
  it.each(STANDARD_GOLDENS)('$id matches the independently recorded vector', ({ pattern, expected }) => {
    const result = resolveQuizResult(ORIGINAL_PRODUCTION_DATASET, answersFor(pattern));
    if (result.kind !== 'standard') throw new Error('Expected a standard result.');

    expect(result.primary).toBe(expected.primary);
    expect(result.secondary).toBe(expected.secondary);
    for (const score of result.spread) {
      expect(score.percentageDisplay, `${score.code} display`).toBe(expected.display[score.code]);
      expect(score.percentageExact, `${score.code} exact`).toBeCloseTo(expected.exact[score.code], 7);
    }
  });

  it.each([
    ['all-disagree', () => 0],
    ['all-neutral', () => 2],
    ['all-agree', () => 4],
    ['all-switch', (index: number) => index < 33 ? 0 : 4],
  ] as const)('matches the %s special and rejects its one-answer near miss', (specialId, pattern) => {
    const answers = answersFor((index) => pattern(index) as AnswerValue);
    expect(resolveQuizResult(ORIGINAL_PRODUCTION_DATASET, answers)).toEqual({
      kind: 'special',
      specialId,
    });

    const first = getScoredQuestions(ORIGINAL_PRODUCTION_DATASET)[0];
    if (!first) throw new Error('Production fixture is missing its first question.');
    answers[first.id] = answers[first.id] === 2 ? 3 : 2;
    expect(resolveQuizResult(ORIGINAL_PRODUCTION_DATASET, answers).kind).toBe('standard');
  });

  it('keeps every golden result unchanged when the two unscored answers change', () => {
    for (const { pattern } of STANDARD_GOLDENS) {
      expect(resolveQuizResult(ORIGINAL_PRODUCTION_DATASET, answersFor(pattern, 0))).toEqual(
        resolveQuizResult(ORIGINAL_PRODUCTION_DATASET, answersFor(pattern, 1)),
      );
    }
  });

  it('detects a production weight mutation instead of blessing a generated expectation', () => {
    const mutated = structuredClone(ORIGINAL_PRODUCTION_DATASET) as QuizDataset;
    const first = getScoredQuestions(mutated)[0];
    if (!first) throw new Error('Production fixture is missing its first question.');
    first.weights.DET += 2;
    mutated.normalisationMax.DET += 2;

    const expected = STANDARD_GOLDENS[0]?.expected;
    const result = resolveQuizResult(mutated, answersFor(STANDARD_GOLDENS[0]!.pattern));
    if (!expected || result.kind !== 'standard') throw new Error('Expected a standard mutation result.');
    const actualDet = result.spread.find((entry) => entry.code === 'DET')?.percentageExact;
    expect(actualDet).not.toBeCloseTo(expected.exact.DET, 7);
  });
});

function answersFor(pattern: Pattern, unscored: 0 | 1 = 0): Record<string, AnswerValue> {
  const answers: Record<string, AnswerValue> = {};
  let index = 0;
  for (const question of ORIGINAL_PRODUCTION_DATASET.questions) {
    if (question.kind === 'unscored') {
      answers[question.id] = unscored;
      continue;
    }
    const primary = VIRTUE_CODES.find((code) => Math.abs(question.weights[code]) === 3);
    if (!primary) throw new Error(`Missing primary weight for ${question.id}.`);
    answers[question.id] = pattern(index, question.weights[primary] > 0 ? 1 : -1);
    index += 1;
  }
  return answers;
}

function vector(
  primary: VirtueCode,
  secondary: VirtueCode,
  displayValues: number[],
  exactValues: number[],
): ExpectedStandardVector {
  return {
    primary,
    secondary,
    display: Object.fromEntries(VIRTUE_CODES.map((code, index) => [code, displayValues[index]])) as Record<VirtueCode, number>,
    exact: Object.fromEntries(VIRTUE_CODES.map((code, index) => [code, exactValues[index]])) as Record<VirtueCode, number>,
  };
}
