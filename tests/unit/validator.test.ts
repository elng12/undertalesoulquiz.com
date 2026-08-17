import { describe, expect, it } from 'vitest';
import { getScoredQuestions, getUnscoredQuestions } from '../../src/quiz/dataset';
import { validateQuizDataset } from '../../src/quiz/validator';
import { createSyntheticDataset, expectedNormalisationMax } from '../fixtures/synthetic-dataset';

describe('validateQuizDataset', () => {
  it('accepts the 66+2 synthetic fixture in test mode', () => {
    const dataset = createSyntheticDataset();
    const result = validateQuizDataset(dataset, { mode: 'test' });

    expect(result).toEqual({ valid: true, issues: [] });
    expect(getScoredQuestions(dataset)).toHaveLength(66);
    expect(getUnscoredQuestions(dataset)).toHaveLength(2);
    expect(dataset.normalisationMax).toEqual(expectedNormalisationMax());
  });

  it('rejects synthetic provenance in production mode', () => {
    const result = validateQuizDataset(createSyntheticDataset());

    expect(result.valid).toBe(false);
    expect(result.issues.some((entry) => entry.message.includes('not allowed in production'))).toBe(true);
  });

  it('rejects a missing question and missing order', () => {
    const dataset = createSyntheticDataset();
    dataset.questions.pop();
    const result = validateQuizDataset(dataset, { mode: 'test' });

    expect(result.valid).toBe(false);
    expect(result.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ path: 'questions', message: 'Expected exactly 68 flow questions.' }),
      expect.objectContaining({ path: 'questions', message: 'Expected exactly two unscored questions.' }),
      expect.objectContaining({ path: 'questions', message: 'Question order 68 is missing.' }),
    ]));
  });

  it('rejects duplicate IDs and orders', () => {
    const dataset = createSyntheticDataset();
    const first = dataset.questions[0];
    const second = dataset.questions[1];
    if (!first || !second) throw new Error('Fixture is incomplete.');
    second.id = first.id;
    second.order = first.order;
    const result = validateQuizDataset(dataset, { mode: 'test' });

    expect(result.valid).toBe(false);
    expect(result.issues.some((entry) => entry.message === 'Question ID must be unique.')).toBe(true);
    expect(result.issues.some((entry) => entry.message === 'Question order must be unique.')).toBe(true);
  });

  it('rejects non-finite weights', () => {
    const dataset = createSyntheticDataset();
    const first = dataset.questions[0];
    if (!first || first.kind !== 'scored') throw new Error('Fixture is incomplete.');
    first.weights.DET = Number.NaN;
    const result = validateQuizDataset(dataset, { mode: 'test' });

    expect(result.valid).toBe(false);
    expect(result.issues.some((entry) => entry.path.endsWith('.weights.DET'))).toBe(true);
  });

  it('rejects mismatched normalisation values', () => {
    const dataset = createSyntheticDataset();
    dataset.normalisationMax.BRV += 1;
    const result = validateQuizDataset(dataset, { mode: 'test' });

    expect(result.valid).toBe(false);
    expect(result.issues.some((entry) => entry.path === 'normalisationMax.BRV')).toBe(true);
  });

  it('rejects changed payout and special rule contracts', () => {
    const dataset = createSyntheticDataset();
    (dataset.answerPayout as unknown as number[])[0] = -1;
    const allAgree = dataset.completionSpecialRules.find((rule) => rule.id === 'all-agree');
    if (!allAgree || allAgree.pattern !== 'all') throw new Error('Fixture is incomplete.');
    allAgree.answer = 2 as 4;
    const result = validateQuizDataset(dataset, { mode: 'test' });

    expect(result.valid).toBe(false);
    expect(result.issues.some((entry) => entry.path === 'answerPayout[0]')).toBe(true);
    expect(result.issues.some((entry) => entry.path === 'completionSpecialRules.all-agree')).toBe(true);
  });
});
