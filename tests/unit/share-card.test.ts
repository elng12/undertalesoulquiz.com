import { describe, expect, it } from 'vitest';
import {
  SHARE_CARD_HEIGHT,
  SHARE_CARD_WIDTH,
  canvasToPngBlob,
  renderShareCard,
} from '../../src/quiz/share-card';
import { buildResultViewModel } from '../../src/quiz/result-view-model';
import { ORIGINAL_PRODUCTION_DATASET } from '../../src/data/original-production-dataset';
import { createCompleteAnswers, createSyntheticDataset } from '../fixtures/synthetic-dataset';

interface RecordingCanvas {
  canvas: HTMLCanvasElement;
  text: string[];
  fillRectCount: () => number;
}

function createRecordingCanvas(blob: Blob | null = new Blob(['png'], { type: 'image/png' })): RecordingCanvas {
  const text: string[] = [];
  let fillRectCount = 0;
  const context = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    font: '',
    textAlign: 'left',
    scale: () => undefined,
    fillRect: () => { fillRectCount += 1; },
    strokeRect: () => undefined,
    fillText: (value: string) => { text.push(value); },
    beginPath: () => undefined,
    moveTo: () => undefined,
    lineTo: () => undefined,
    closePath: () => undefined,
    fill: () => undefined,
    stroke: () => undefined,
    measureText: (value: string) => ({ width: value.length * 7 }),
  };
  const canvas = {
    width: 0,
    height: 0,
    getContext: (kind: string) => kind === '2d' ? context : null,
    toBlob: (callback: BlobCallback) => callback(blob),
  } as unknown as HTMLCanvasElement;

  return { canvas, text, fillRectCount: () => fillRectCount };
}

describe('renderShareCard', () => {
  it('draws the standard leaders and every displayed spread value from ResultViewModel', () => {
    const dataset = createSyntheticDataset();
    const answers = createCompleteAnswers(
      dataset,
      (index) => (index % 5) as 0 | 1 | 2 | 3 | 4,
    );
    const viewModel = buildResultViewModel(dataset, answers);
    const recording = createRecordingCanvas();
    const artifact = renderShareCard(recording.canvas, viewModel);

    if (viewModel.kind !== 'standard') throw new Error('Expected a standard result.');
    expect(recording.canvas.width).toBe(SHARE_CARD_WIDTH);
    expect(recording.canvas.height).toBe(SHARE_CARD_HEIGHT);
    expect(artifact).toEqual({
      fileName: `undertale-soul-${viewModel.primary.code.toLowerCase()}-development.png`,
      width: 920,
      height: 1150,
    });
    expect(recording.text).toContain(viewModel.primary.label);
    expect(recording.text).toContain(`${viewModel.primary.percentage}% PRIMARY`);
    expect(recording.text).toContain(
      `${viewModel.secondary.label} ${viewModel.secondary.percentage}% SECONDARY`,
    );
    for (const virtue of viewModel.spread) {
      expect(recording.text).toContain(virtue.label.toUpperCase());
      expect(recording.text).toContain(`${virtue.percentage}%`);
    }
    expect(recording.fillRectCount()).toBeGreaterThan(10);
  });

  it('draws special results without inventing standard leaders', () => {
    const dataset = createSyntheticDataset();
    const viewModel = buildResultViewModel(dataset, createCompleteAnswers(dataset, 2));
    const recording = createRecordingCanvas();
    const artifact = renderShareCard(recording.canvas, viewModel);

    if (viewModel.kind !== 'special') throw new Error('Expected a special result.');
    expect(artifact.fileName).toBe('undertale-soul-all-neutral-development.png');
    expect(recording.text).toContain(viewModel.heading);
    expect(recording.text.some((value) => value.includes('PRIMARY'))).toBe(false);
  });

  it('draws a production card without development labels or file suffixes', () => {
    const viewModel = buildResultViewModel(
      ORIGINAL_PRODUCTION_DATASET,
      createOriginalAnswers((index) => (index % 5) as 0 | 1 | 2 | 3 | 4),
    );
    const recording = createRecordingCanvas();
    const artifact = renderShareCard(recording.canvas, viewModel);

    if (viewModel.kind !== 'standard') throw new Error('Expected a standard result.');
    expect(artifact.fileName).toBe(`undertale-soul-${viewModel.primary.code.toLowerCase()}.png`);
    expect(recording.text).toContain('ORIGINAL FAN QUIZ');
    expect(recording.text).not.toContain('DEVELOPMENT PREVIEW');
  });

  it.each([
    ['all-disagree', (_index: number): 0 => 0],
    ['all-neutral', (_index: number): 2 => 2],
    ['all-agree', (_index: number): 4 => 4],
    ['all-switch', (index: number): 0 | 4 => index < 33 ? 0 : 4],
  ] as const)('draws the production %s special card', (specialId, pattern) => {
    const viewModel = buildResultViewModel(
      ORIGINAL_PRODUCTION_DATASET,
      createOriginalAnswers((index) => pattern(index) as 0 | 1 | 2 | 3 | 4),
    );
    const recording = createRecordingCanvas();
    const artifact = renderShareCard(recording.canvas, viewModel);

    expect(viewModel).toMatchObject({ kind: 'special', specialId });
    expect(artifact.fileName).toBe(`undertale-soul-${specialId}.png`);
    expect(recording.text).toContain('ORIGINAL FAN QUIZ');
  });

  it('rejects missing canvas support and failed PNG encoding', async () => {
    const dataset = createSyntheticDataset();
    const viewModel = buildResultViewModel(dataset, createCompleteAnswers(dataset, 2));
    const unsupported = { getContext: () => null } as unknown as HTMLCanvasElement;
    expect(() => renderShareCard(unsupported, viewModel)).toThrow('Canvas 2D rendering is unavailable');

    const failed = createRecordingCanvas(null);
    await expect(canvasToPngBlob(failed.canvas)).rejects.toThrow('could not be encoded');
  });
});

function createOriginalAnswers(
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
