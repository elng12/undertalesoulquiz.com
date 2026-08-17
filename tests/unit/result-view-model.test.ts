import { describe, expect, it } from 'vitest';
import { ORIGINAL_PRODUCTION_DATASET } from '../../src/data/original-production-dataset';
import { findPairingCopy, findSpecialCopy, findVirtueCopy } from '../../src/data/original-result-content';
import { buildResultViewModel } from '../../src/quiz/result-view-model';
import { resolveQuizResult } from '../../src/quiz/scoring';
import { createCompleteAnswers, createSyntheticDataset } from '../fixtures/synthetic-dataset';

describe('buildResultViewModel', () => {
  it('renders approved original result, Shadow, Pairing, and share copy for production data', () => {
    const answers = createProductionAnswers((index) => (index % 5) as 0 | 1 | 2 | 3 | 4);
    const viewModel = buildResultViewModel(ORIGINAL_PRODUCTION_DATASET, answers);

    if (viewModel.kind !== 'standard') throw new Error('Expected a standard result.');
    const virtue = findVirtueCopy(viewModel.primary.code);
    const pairing = findPairingCopy(viewModel.primary.code, viewModel.secondary.code);
    expect(viewModel.isDevelopmentPreview).toBe(false);
    expect(viewModel.summary).toBe(virtue.summary);
    expect(viewModel.shadow).toEqual({ ...virtue.shadow, status: 'production-original' });
    expect(viewModel.pairing).toEqual({
      heading: pairing.heading,
      body: pairing.body,
      status: 'production-original',
    });
    expect(viewModel.shareText).toContain('My Undertale Soul Quiz result');
    expect(viewModel.shareText).not.toContain('Development result');
  });

  it('renders original special-result copy without development labels', () => {
    const viewModel = buildResultViewModel(
      ORIGINAL_PRODUCTION_DATASET,
      createProductionAnswers(() => 2),
    );
    const copy = findSpecialCopy('all-neutral');

    expect(viewModel).toMatchObject({
      kind: 'special',
      specialId: 'all-neutral',
      heading: copy.heading,
      eyebrow: 'SPECIAL SOUL RESULT',
      isDevelopmentPreview: false,
    });
    expect(viewModel.summary).toContain(copy.interpretationNote);
    expect(viewModel.shareText).not.toContain('development');
  });

  it.each([
    ['all-disagree', (_index: number): 0 => 0],
    ['all-neutral', (_index: number): 2 => 2],
    ['all-agree', (_index: number): 4 => 4],
    ['all-switch', (index: number): 0 | 4 => index < 33 ? 0 : 4],
  ] as const)('uses approved original copy for the production %s result', (specialId, pattern) => {
    const viewModel = buildResultViewModel(
      ORIGINAL_PRODUCTION_DATASET,
      createProductionAnswers((index) => pattern(index) as 0 | 1 | 2 | 3 | 4),
    );
    const copy = findSpecialCopy(specialId);

    expect(viewModel).toMatchObject({
      kind: 'special',
      specialId,
      heading: copy.heading,
      eyebrow: 'SPECIAL SOUL RESULT',
      isDevelopmentPreview: false,
    });
    expect(viewModel.summary).toContain(copy.interpretationNote);
  });

  it('uses the resolved standard result as the single source for leaders and spread', () => {
    const dataset = createSyntheticDataset();
    const answers = createCompleteAnswers(
      dataset,
      (index) => (index % 5) as 0 | 1 | 2 | 3 | 4,
    );
    const result = resolveQuizResult(dataset, answers);
    const viewModel = buildResultViewModel(dataset, answers);

    if (result.kind !== 'standard' || viewModel.kind !== 'standard') {
      throw new Error('Expected a standard result.');
    }

    expect(viewModel.primary.code).toBe(result.primary);
    expect(viewModel.secondary.code).toBe(result.secondary);
    expect(viewModel.spread.map(({ code, percentage }) => ({ code, percentage }))).toEqual(
      result.spread.map(({ code, percentageDisplay: percentage }) => ({ code, percentage })),
    );
    expect(viewModel.color).toBe(viewModel.primary.color);
    expect(viewModel.shadow).toMatchObject({
      heading: `The Shadow of ${viewModel.primary.label}`,
      status: 'content-pending',
    });
    expect(viewModel.pairing).toMatchObject({
      heading: `${viewModel.primary.label} + ${viewModel.secondary.label}`,
      status: 'content-pending',
    });
    expect(viewModel.shareText).toContain(`${viewModel.primary.percentage}% primary`);
    expect(viewModel.siteUrl).toBe('https://undertalesoulquiz.com/');
    expect(viewModel.isDevelopmentPreview).toBe(true);
  });

  it.each([
    ['all-disagree', 0],
    ['all-neutral', 2],
    ['all-agree', 4],
  ] as const)('builds an isolated %s view without standard result fields', (specialId, answer) => {
    const dataset = createSyntheticDataset();
    const viewModel = buildResultViewModel(dataset, createCompleteAnswers(dataset, answer));

    expect(viewModel).toMatchObject({ kind: 'special', specialId, spread: [] });
    expect('primary' in viewModel).toBe(false);
    expect('secondary' in viewModel).toBe(false);
    expect(viewModel.shareText).toContain('development Undertale Soul Quiz result');
  });

  it('represents the switch special as the confirmed Patience and Determination split', () => {
    const dataset = createSyntheticDataset();
    const answers = createCompleteAnswers(dataset, (index) => index < 33 ? 0 : 4);
    const viewModel = buildResultViewModel(dataset, answers);

    expect(viewModel).toMatchObject({
      kind: 'special',
      specialId: 'all-switch',
      heading: 'Split Response Pattern',
      spread: [
        { code: 'PAT', percentage: 50 },
        { code: 'DET', percentage: 50 },
      ],
    });
  });

  it('does not let the two unscored answers alter the display model', () => {
    const dataset = createSyntheticDataset();
    const pattern = (index: number) => (index % 5) as 0 | 1 | 2 | 3 | 4;

    expect(buildResultViewModel(dataset, createCompleteAnswers(dataset, pattern, 0))).toEqual(
      buildResultViewModel(dataset, createCompleteAnswers(dataset, pattern, 1)),
    );
  });

  it('rejects incomplete answer sets instead of rendering a partial result', () => {
    const dataset = createSyntheticDataset();
    const answers = createCompleteAnswers(dataset, 3);
    delete answers[dataset.questions[0]?.id ?? ''];

    expect(() => buildResultViewModel(dataset, answers)).toThrow('does not have a valid answer');
  });
});

function createProductionAnswers(
  pattern: (index: number) => 0 | 1 | 2 | 3 | 4,
): Record<string, 0 | 1 | 2 | 3 | 4> {
  const answers: Record<string, 0 | 1 | 2 | 3 | 4> = {};
  let scoredIndex = 0;
  for (const question of ORIGINAL_PRODUCTION_DATASET.questions) {
    if (question.kind === 'scored') {
      answers[question.id] = pattern(scoredIndex);
      scoredIndex += 1;
    } else {
      answers[question.id] = 0;
    }
  }
  return answers;
}
