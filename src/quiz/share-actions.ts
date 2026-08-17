import type { ResultViewModel } from './result-view-model';

export type CopyResultMethod = 'clipboard' | 'fallback';
export type ShareResultOutcome = 'shared-file' | 'shared-text' | 'copied-fallback' | 'cancelled';

export interface ClipboardLike {
  writeText(text: string): Promise<void>;
}

export interface ShareNavigatorLike {
  share?: (data: ShareData) => Promise<void>;
  canShare?: (data: ShareData) => boolean;
}

export async function copyResultText(
  text: string,
  clipboard: ClipboardLike | undefined,
  fallback: ((value: string) => boolean) | undefined,
): Promise<CopyResultMethod> {
  if (clipboard) {
    try {
      await clipboard.writeText(text);
      return 'clipboard';
    } catch {
      // Continue to the synchronous browser fallback.
    }
  }

  if (fallback?.(text)) return 'fallback';
  throw new Error('The result text could not be copied.');
}

export async function shareResultWithFallback(
  viewModel: ResultViewModel,
  file: File | null,
  navigatorLike: ShareNavigatorLike,
  copy: () => Promise<unknown>,
): Promise<ShareResultOutcome> {
  if (!navigatorLike.share) {
    await copy();
    return 'copied-fallback';
  }

  const textPayload: ShareData = {
    title: 'Undertale Soul Quiz Result',
    text: viewModel.shareText,
    url: viewModel.siteUrl,
  };
  let payload = textPayload;
  let outcome: ShareResultOutcome = 'shared-text';

  if (file && navigatorLike.canShare) {
    const filePayload: ShareData = {
      title: textPayload.title,
      text: textPayload.text,
      files: [file],
    };
    try {
      if (navigatorLike.canShare(filePayload)) {
        payload = filePayload;
        outcome = 'shared-file';
      }
    } catch {
      payload = textPayload;
    }
  }

  try {
    await navigatorLike.share(payload);
    return outcome;
  } catch (error) {
    if (isAbortError(error)) return 'cancelled';
    await copy();
    return 'copied-fallback';
  }
}

function isAbortError(error: unknown): boolean {
  return typeof error === 'object'
    && error !== null
    && 'name' in error
    && error.name === 'AbortError';
}
