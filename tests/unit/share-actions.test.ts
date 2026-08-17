import { describe, expect, it, vi } from 'vitest';
import { copyResultText, shareResultWithFallback } from '../../src/quiz/share-actions';
import { buildResultViewModel } from '../../src/quiz/result-view-model';
import { createCompleteAnswers, createSyntheticDataset } from '../fixtures/synthetic-dataset';

function standardViewModel() {
  const dataset = createSyntheticDataset();
  return buildResultViewModel(
    dataset,
    createCompleteAnswers(dataset, (index) => (index % 5) as 0 | 1 | 2 | 3 | 4),
  );
}

describe('copyResultText', () => {
  it('uses the async clipboard when available', async () => {
    const clipboard = { writeText: vi.fn(async () => undefined) };
    const fallback = vi.fn(() => true);

    await expect(copyResultText('result', clipboard, fallback)).resolves.toBe('clipboard');
    expect(clipboard.writeText).toHaveBeenCalledWith('result');
    expect(fallback).not.toHaveBeenCalled();
  });

  it('uses the fallback after clipboard failure and rejects when neither works', async () => {
    const clipboard = { writeText: vi.fn(async () => { throw new Error('denied'); }) };
    await expect(copyResultText('result', clipboard, () => true)).resolves.toBe('fallback');
    await expect(copyResultText('result', undefined, () => false)).rejects.toThrow('could not be copied');
  });
});

describe('shareResultWithFallback', () => {
  it('shares the PNG when the browser accepts files', async () => {
    const viewModel = standardViewModel();
    const share = vi.fn(async () => undefined);
    const canShare = vi.fn(() => true);
    const copy = vi.fn(async () => undefined);
    const file = { name: 'result.png', type: 'image/png' } as File;

    await expect(shareResultWithFallback(
      viewModel,
      file,
      { share, canShare },
      copy,
    )).resolves.toBe('shared-file');
    expect(share).toHaveBeenCalledWith(expect.objectContaining({ files: [file] }));
    expect(copy).not.toHaveBeenCalled();
  });

  it('uses native text sharing when file sharing is unavailable', async () => {
    const viewModel = standardViewModel();
    const share = vi.fn(async () => undefined);
    const copy = vi.fn(async () => undefined);

    await expect(shareResultWithFallback(
      viewModel,
      null,
      { share },
      copy,
    )).resolves.toBe('shared-text');
    expect(share).toHaveBeenCalledWith({
      title: 'Undertale Soul Quiz Result',
      text: viewModel.shareText,
      url: viewModel.siteUrl,
    });
  });

  it('copies the result when Web Share is missing or fails', async () => {
    const viewModel = standardViewModel();
    const copy = vi.fn(async () => undefined);
    await expect(shareResultWithFallback(viewModel, null, {}, copy)).resolves.toBe('copied-fallback');

    const share = vi.fn(async () => { throw new Error('share failed'); });
    await expect(shareResultWithFallback(viewModel, null, { share }, copy)).resolves.toBe('copied-fallback');
    expect(copy).toHaveBeenCalledTimes(2);
  });

  it('treats native share cancellation as harmless and preserves the result', async () => {
    const viewModel = standardViewModel();
    const copy = vi.fn(async () => undefined);
    const share = vi.fn(async () => { throw { name: 'AbortError' }; });

    await expect(shareResultWithFallback(viewModel, null, { share }, copy)).resolves.toBe('cancelled');
    expect(copy).not.toHaveBeenCalled();
  });
});
