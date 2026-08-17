import { describe, expect, it } from 'vitest';
import { QuizAnswerError } from '../../src/quiz/answers';
import {
  percentageForRawScore,
  resolveQuizResult,
  scoreStandardResult,
} from '../../src/quiz/scoring';
import type { VirtueCode } from '../../src/quiz/types';
import { createCompleteAnswers, createSyntheticDataset } from '../fixtures/synthetic-dataset';

function scoreByCode(
  result: ReturnType<typeof scoreStandardResult>,
  code: VirtueCode,
) {
  const score = result.spread.find((entry) => entry.code === code);
  if (!score) throw new Error(`Missing ${code} score.`);
  return score;
}

describe('scoreStandardResult', () => {
  it('maps neutral raw scores to 50% and uses the explicit virtue tie order', () => {
    const dataset = createSyntheticDataset();
    const result = scoreStandardResult(dataset, createCompleteAnswers(dataset, 2));

    expect(result.primary).toBe('DET');
    expect(result.secondary).toBe('BRV');
    expect(result.spread.map((entry) => entry.code)).toEqual([
      'DET', 'BRV', 'JUS', 'KND', 'PAT', 'INT', 'PER',
    ]);
    expect(result.spread.every((entry) => entry.percentageExact === 50)).toBe(true);
  });

  it('reverses negative weights and clamps strong agreement at both ends', () => {
    const dataset = createSyntheticDataset();
    const result = scoreStandardResult(dataset, createCompleteAnswers(dataset, 4));

    for (const code of ['DET', 'JUS', 'PAT', 'PER'] as VirtueCode[]) {
      expect(scoreByCode(result, code).percentageExact).toBe(100);
    }
    for (const code of ['BRV', 'KND', 'INT'] as VirtueCode[]) {
      expect(scoreByCode(result, code).percentageExact).toBe(0);
    }
    expect(scoreByCode(result, 'DET').raw).toBe(66);
    expect(scoreByCode(result, 'BRV').raw).toBeCloseTo(-79.2, 10);
  });

  it('applies the stronger negative payout for strong disagreement', () => {
    const dataset = createSyntheticDataset();
    const result = scoreStandardResult(dataset, createCompleteAnswers(dataset, 0));

    expect(scoreByCode(result, 'DET').raw).toBeCloseTo(-79.2, 10);
    expect(scoreByCode(result, 'DET').normalised).toBe(-1);
    expect(scoreByCode(result, 'DET').percentageExact).toBe(0);
    expect(scoreByCode(result, 'BRV').raw).toBe(66);
    expect(scoreByCode(result, 'BRV').percentageExact).toBe(100);
  });

  it('does not let the two unscored answers alter standard scores', () => {
    const dataset = createSyntheticDataset();
    const pattern = (index: number) => (index % 5) as 0 | 1 | 2 | 3 | 4;
    const first = scoreStandardResult(dataset, createCompleteAnswers(dataset, pattern, 0));
    const second = scoreStandardResult(dataset, createCompleteAnswers(dataset, pattern, 1));

    expect(second).toEqual(first);
  });

  it('rejects missing or invalid scored answers', () => {
    const dataset = createSyntheticDataset();
    const answers = createCompleteAnswers(dataset, 2);
    const first = dataset.questions[0];
    if (!first) throw new Error('Fixture is incomplete.');
    delete answers[first.id];

    expect(() => scoreStandardResult(dataset, answers)).toThrow(QuizAnswerError);
    answers[first.id] = 9;
    expect(() => scoreStandardResult(dataset, answers)).toThrow(QuizAnswerError);
  });
});

describe('resolveQuizResult', () => {
  it.each([
    ['all-disagree', 0],
    ['all-neutral', 2],
    ['all-agree', 4],
  ] as const)('returns %s for its all-same pattern', (specialId, answer) => {
    const dataset = createSyntheticDataset();
    expect(resolveQuizResult(dataset, createCompleteAnswers(dataset, answer))).toEqual({
      kind: 'special',
      specialId,
    });
  });

  it('returns all-switch for the 33/33 extreme split', () => {
    const dataset = createSyntheticDataset();
    const answers = createCompleteAnswers(dataset, (index) => index < 33 ? 0 : 4);

    expect(resolveQuizResult(dataset, answers)).toEqual({
      kind: 'special',
      specialId: 'all-switch',
    });
  });

  it('returns a standard result for a mixed pattern', () => {
    const dataset = createSyntheticDataset();
    const answers = createCompleteAnswers(
      dataset,
      (index) => (index % 5) as 0 | 1 | 2 | 3 | 4,
    );

    expect(resolveQuizResult(dataset, answers).kind).toBe('standard');
  });

  it('requires both unscored answers before resolving the final result', () => {
    const dataset = createSyntheticDataset();
    const answers = createCompleteAnswers(dataset, 3);
    const finalQuestion = dataset.questions.at(-1);
    if (!finalQuestion) throw new Error('Fixture is incomplete.');
    delete answers[finalQuestion.id];

    expect(() => resolveQuizResult(dataset, answers)).toThrow(QuizAnswerError);
  });
});

describe('percentageForRawScore', () => {
  it('maps zero to 50 and clamps out-of-range raw scores', () => {
    expect(percentageForRawScore(0, 10, 0.6).percentageExact).toBe(50);
    expect(percentageForRawScore(12, 10, 0.6).percentageExact).toBe(100);
    expect(percentageForRawScore(-12, 10, 0.6).percentageExact).toBe(0);
  });

  it('rejects invalid normalisation values', () => {
    expect(() => percentageForRawScore(1, 0, 0.6)).toThrow(TypeError);
    expect(() => percentageForRawScore(Number.NaN, 10, 0.6)).toThrow(TypeError);
  });
});
