import { ORIGINAL_PRODUCTION_DATASET } from '../data/original-production-dataset';
import { getScoredQuestions } from './dataset';
import { loadQuizState, saveQuizState } from './persistence';
import type { LoadQuizStateResult, StorageLike } from './persistence';
import { buildResultViewModel } from './result-view-model';
import type { ResultViewModel, ResultVirtueView } from './result-view-model';
import {
  canvasToPngBlob,
  downloadBlob,
  renderShareCard,
} from './share-card';
import type { ShareCardArtifact } from './share-card';
import { copyResultText, shareResultWithFallback } from './share-actions';
import { createInitialQuizState, reduceQuizState } from './state-machine';
import type { QuizState, QuizStateAction } from './state-machine';
import type { QuizQuestion } from './types';
import { assertQuizDataset } from './validator';

const dataset = structuredClone(ORIGINAL_PRODUCTION_DATASET);
assertQuizDataset(dataset, { mode: 'production' });

export function mountQuizApp(): void {
  const root = element<HTMLElement>('quiz-app');
  const landingPanel = element<HTMLElement>('landing-panel');
  const quizPanel = element<HTMLElement>('quiz-panel');
  const completePanel = element<HTMLElement>('complete-panel');
  const startButton = element<HTMLButtonElement>('start-quiz');
  const startNewQuizButton = element<HTMLButtonElement>('start-new-quiz');
  const backButton = element<HTMLButtonElement>('back-question');
  const completeBackButton = element<HTMLButtonElement>('complete-back');
  const retakeButton = element<HTMLButtonElement>('retake-quiz');
  const resultHomeButton = element<HTMLButtonElement>('result-home');
  const resetButton = element<HTMLButtonElement>('open-reset');
  const resetDialog = element<HTMLDialogElement>('reset-dialog');
  const confirmResetButton = element<HTMLButtonElement>('confirm-reset');
  const retakeDialog = element<HTMLDialogElement>('retake-dialog');
  const confirmRetakeButton = element<HTMLButtonElement>('confirm-retake');
  const questionPosition = element<HTMLElement>('question-position');
  const questionHeading = element<HTMLElement>('question-heading');
  const answerOptions = element<HTMLElement>('answer-options');
  const progressBar = element<HTMLElement>('quiz-progress');
  const progressFill = element<HTMLElement>('quiz-progress-fill');
  const completeHeading = element<HTMLElement>('complete-heading');
  const completionCount = element<HTMLElement>('completion-count');
  const resultSoulMark = element<HTMLElement>('result-soul-mark');
  const resultEyebrow = element<HTMLElement>('result-eyebrow');
  const resultSummary = element<HTMLElement>('result-summary');
  const resultLeaders = element<HTMLElement>('result-leaders');
  const resultPrimaryName = element<HTMLElement>('result-primary-name');
  const resultPrimaryScore = element<HTMLElement>('result-primary-score');
  const resultSecondaryName = element<HTMLElement>('result-secondary-name');
  const resultSecondaryScore = element<HTMLElement>('result-secondary-score');
  const resultSpecialLabel = element<HTMLElement>('result-special-label');
  const resultSpreadPanel = element<HTMLElement>('result-spread-panel');
  const resultSpreadHeading = element<HTMLElement>('result-spread-heading');
  const resultSpreadList = element<HTMLOListElement>('result-spread-list');
  const resultDepth = element<HTMLElement>('result-depth');
  const resultShadowHeading = element<HTMLElement>('result-shadow-heading');
  const resultShadowCopy = element<HTMLElement>('result-shadow-copy');
  const resultPairingHeading = element<HTMLElement>('result-pairing-heading');
  const resultPairingCopy = element<HTMLElement>('result-pairing-copy');
  const resultShareCanvas = element<HTMLCanvasElement>('result-share-canvas');
  const saveResultButton = element<HTMLButtonElement>('save-result-image');
  const shareResultButton = element<HTMLButtonElement>('share-result');
  const copyResultButton = element<HTMLButtonElement>('copy-result');
  const statusMessage = element<HTMLElement>('status-message');
  const scoredQuestions = getScoredQuestions(dataset);
  const storage = browserStorage();

  const loaded: LoadQuizStateResult = storage
    ? loadQuizState(storage, dataset)
    : {
        status: 'unavailable',
        state: createInitialQuizState(dataset),
        reason: 'storage-unavailable',
      };
  let state: QuizState = loaded.state;
  let currentResultViewModel: ResultViewModel | null = null;
  let currentShareArtifact: ShareCardArtifact | null = null;
  let resultActionInFlight = false;
  let showLandingWithSavedResult = loaded.status === 'restored' && state.phase === 'complete';

  if (loaded.status === 'restored') {
    showStatus(
      state.phase === 'complete'
        ? 'Your saved result is ready to view.'
        : 'Your saved progress was restored.',
      'success',
    );
  } else if (loaded.status === 'discarded') {
    showStatus('Old or invalid saved progress was cleared. You can start again safely.', 'warning');
  } else if (loaded.status === 'unavailable') {
    showStatus('This browser cannot save progress. You can still complete this session.', 'warning');
  }

  startButton.addEventListener('click', () => {
    if (state.phase === 'complete' && showLandingWithSavedResult) {
      showLandingWithSavedResult = false;
      clearStatus();
      render(true);
      return;
    }
    dispatch({ type: 'start' }, true);
  });
  startNewQuizButton.addEventListener('click', () => retakeDialog.showModal());
  backButton.addEventListener('click', () => dispatch({ type: 'back' }, true));
  completeBackButton.addEventListener('click', () => dispatch({ type: 'back' }, true));
  retakeButton.addEventListener('click', () => retakeDialog.showModal());
  resultHomeButton.addEventListener('click', () => {
    showLandingWithSavedResult = true;
    render();
    showStatus('Your result is available. View it again or start a new quiz.', 'success');
    window.requestAnimationFrame(() => startButton.focus());
  });
  confirmRetakeButton.addEventListener('click', () => {
    retakeDialog.close();
    showLandingWithSavedResult = false;
    dispatch({ type: 'retake' });
    showStatus('Progress cleared.', 'success');
    startButton.focus();
  });
  resetButton.addEventListener('click', () => resetDialog.showModal());
  confirmResetButton.addEventListener('click', () => {
    resetDialog.close();
    dispatch({ type: 'reset' });
    showStatus('Progress cleared.', 'success');
    startButton.focus();
  });
  saveResultButton.addEventListener('click', () => {
    void runResultAction(async () => {
      const { artifact, blob } = await currentShareBlob();
      downloadBlob(blob, artifact.fileName);
      showStatus('Result image saved.', 'success');
    });
  });
  shareResultButton.addEventListener('click', () => {
    void runResultAction(async () => {
      const viewModel = requireCurrentResult();
      const { artifact, blob } = await currentShareBlob();
      const file = typeof File === 'function'
        ? new File([blob], artifact.fileName, { type: 'image/png' })
        : null;
      const outcome = await shareResultWithFallback(
        viewModel,
        file,
        navigator,
        () => copyCurrentResult(),
      );
      if (outcome === 'cancelled') {
        showStatus('Share cancelled. Your result is still here.', 'warning');
      } else if (outcome === 'copied-fallback') {
        showStatus('Native sharing is unavailable, so the result text was copied instead.', 'warning');
      } else {
        showStatus('Result shared.', 'success');
      }
    });
  });
  copyResultButton.addEventListener('click', () => {
    void runResultAction(async () => {
      await copyCurrentResult();
      showStatus('Result text copied.', 'success');
    });
  });

  document.addEventListener('keydown', (event) => {
    if (state.phase !== 'in-progress' || event.metaKey || event.ctrlKey || event.altKey) return;
    if (resetDialog.open || isTextEntry(event.target)) return;
    const answerIndex = Number(event.key) - 1;
    const question = currentQuestion(state);
    const optionCount = question?.kind === 'scored' ? 5 : question?.options.length ?? 0;
    if (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex >= optionCount) return;
    event.preventDefault();
    answer(question, answerIndex);
  });

  render(loaded.status === 'restored');

  function dispatch(action: QuizStateAction, focusQuestion = false): void {
    clearStatus();
    try {
      state = reduceQuizState(dataset, state, action);
      if (state.phase !== 'complete') showLandingWithSavedResult = false;
      const saved = storage
        ? saveQuizState(storage, state)
        : { status: 'unavailable' as const, reason: 'storage-unavailable' as const };
      if (saved.status === 'unavailable') {
        showStatus('Progress could not be saved. You can still complete this session.', 'warning');
      }
      render(focusQuestion);
    } catch {
      showStatus('That action could not be completed. Your previous progress is unchanged.', 'error');
    }
  }

  function answer(question: QuizQuestion | null, value: number): void {
    if (!question) return;
    dispatch({ type: 'answer', questionId: question.id, value }, true);
  }

  function render(focusQuestion = false): void {
    const showingLanding = state.phase === 'landing' || showLandingWithSavedResult;
    root.dataset.phase = showingLanding ? 'landing' : state.phase;
    landingPanel.hidden = !showingLanding;
    quizPanel.hidden = showingLanding || state.phase !== 'in-progress';
    completePanel.hidden = showingLanding || state.phase !== 'complete';
    startButton.textContent = state.phase === 'complete' ? 'VIEW SAVED RESULT' : 'START QUIZ';
    startNewQuizButton.hidden = state.phase !== 'complete';
    if (showingLanding || state.phase !== 'complete') {
      currentResultViewModel = null;
      currentShareArtifact = null;
    }

    if (!showingLanding && state.phase === 'in-progress') renderQuestion();
    if (!showingLanding && state.phase === 'complete') {
      renderResult(buildResultViewModel(dataset, state.answers));
      completionCount.textContent = `${Object.keys(state.answers).length} / ${dataset.questions.length} RESPONSES`;
    }

    if (focusQuestion && !showingLanding && state.phase === 'in-progress') {
      window.requestAnimationFrame(() => questionHeading.focus());
    } else if (focusQuestion && !showingLanding && state.phase === 'complete') {
      window.requestAnimationFrame(() => completeHeading.focus());
    }
  }

  function renderResult(viewModel: ResultViewModel): void {
    currentResultViewModel = viewModel;
    currentShareArtifact = renderShareCard(resultShareCanvas, viewModel);
    root.dataset.resultKind = viewModel.kind;
    resultSoulMark.style.setProperty('--result-color', viewModel.color);
    resultEyebrow.textContent = viewModel.eyebrow;
    completeHeading.textContent = viewModel.heading;
    resultSummary.textContent = viewModel.summary;
    resultSpreadHeading.textContent = viewModel.spreadHeading;
    renderSpread(viewModel.spread);
    resultSpreadPanel.hidden = viewModel.spread.length === 0;

    if (viewModel.kind === 'standard') {
      resultLeaders.hidden = false;
      resultDepth.hidden = false;
      resultSpecialLabel.hidden = true;
      resultPrimaryName.textContent = viewModel.primary.label;
      resultPrimaryScore.textContent = `${viewModel.primary.percentage}% / ${viewModel.primary.code}`;
      resultSecondaryName.textContent = viewModel.secondary.label;
      resultSecondaryScore.textContent = `${viewModel.secondary.percentage}% / ${viewModel.secondary.code}`;
      resultShadowHeading.textContent = viewModel.shadow.heading;
      resultShadowCopy.textContent = viewModel.shadow.body;
      resultPairingHeading.textContent = viewModel.pairing.heading;
      resultPairingCopy.textContent = viewModel.pairing.body;
      return;
    }

    resultLeaders.hidden = true;
    resultDepth.hidden = true;
    resultSpecialLabel.hidden = false;
    resultSpecialLabel.textContent = viewModel.specialLabel;
  }

  async function runResultAction(action: () => Promise<void>): Promise<void> {
    if (resultActionInFlight) return;
    resultActionInFlight = true;
    clearStatus();
    setResultActionsDisabled(true);
    try {
      await action();
    } catch {
      showStatus('That result action could not be completed. Your result is unchanged.', 'error');
    } finally {
      resultActionInFlight = false;
      setResultActionsDisabled(false);
    }
  }

  function setResultActionsDisabled(disabled: boolean): void {
    saveResultButton.disabled = disabled;
    shareResultButton.disabled = disabled;
    copyResultButton.disabled = disabled;
  }

  function requireCurrentResult(): ResultViewModel {
    if (!currentResultViewModel) throw new Error('A completed result is required.');
    return currentResultViewModel;
  }

  async function currentShareBlob(): Promise<{ artifact: ShareCardArtifact; blob: Blob }> {
    const viewModel = requireCurrentResult();
    const artifact = currentShareArtifact ?? renderShareCard(resultShareCanvas, viewModel);
    currentShareArtifact = artifact;
    return { artifact, blob: await canvasToPngBlob(resultShareCanvas) };
  }

  function copyCurrentResult(): Promise<unknown> {
    const viewModel = requireCurrentResult();
    return copyResultText(viewModel.shareText, navigator.clipboard, legacyCopyText);
  }

  function renderSpread(spread: ResultVirtueView[]): void {
    resultSpreadList.replaceChildren();
    for (const virtue of spread) {
      const item = document.createElement('li');
      const line = document.createElement('div');
      const identity = document.createElement('span');
      const swatch = document.createElement('i');
      const label = document.createElement('strong');
      const code = document.createElement('small');
      const percentage = document.createElement('b');
      const meter = document.createElement('div');
      const fill = document.createElement('span');

      item.className = 'result-spread-item';
      item.setAttribute('aria-label', `${virtue.label} ${virtue.percentage} percent`);
      line.className = 'result-spread-line';
      identity.className = 'result-spread-identity';
      swatch.className = 'result-spread-swatch';
      swatch.style.backgroundColor = virtue.color;
      swatch.setAttribute('aria-hidden', 'true');
      label.textContent = virtue.label;
      code.textContent = virtue.code;
      percentage.textContent = `${virtue.percentage}%`;
      meter.className = 'result-spread-meter';
      meter.setAttribute('aria-hidden', 'true');
      fill.style.width = `${virtue.percentage}%`;
      fill.style.backgroundColor = virtue.color;

      identity.append(swatch, label, code);
      line.append(identity, percentage);
      meter.append(fill);
      item.append(line, meter);
      resultSpreadList.append(item);
    }
  }

  function renderQuestion(): void {
    const question = currentQuestion(state);
    if (!question) {
      showStatus('The current question is unavailable. Reset the quiz.', 'error');
      return;
    }

    questionHeading.textContent = question.prompt;
    answerOptions.replaceChildren();
    const selectedAnswer = state.answers[question.id];
    const options = question.kind === 'scored'
      ? question.labels.map((label, value) => ({ label, value }))
      : question.options.map((option, value) => ({ label: option.label, value }));

    for (const option of options) {
      const button = document.createElement('button');
      const number = document.createElement('span');
      const label = document.createElement('span');
      button.type = 'button';
      button.className = 'answer-option';
      button.dataset.answer = String(option.value);
      button.ariaPressed = String(selectedAnswer === option.value);
      number.className = 'answer-number';
      number.textContent = String(option.value + 1);
      number.setAttribute('aria-hidden', 'true');
      label.textContent = option.label;
      button.append(number, label);
      button.addEventListener('click', () => answer(question, option.value));
      answerOptions.append(button);
    }

    const flowIndex = dataset.questions.findIndex((entry) => entry.id === question.id);
    const scoredIndex = scoredQuestions.findIndex((entry) => entry.id === question.id);
    if (scoredIndex >= 0) {
      const visibleIndex = scoredIndex + 1;
      questionPosition.textContent = `QUESTION ${String(visibleIndex).padStart(2, '0')} / 66`;
      progressBar.setAttribute('aria-label', 'Scored question progress');
      progressBar.setAttribute('aria-valuemin', '0');
      progressBar.setAttribute('aria-valuenow', String(visibleIndex));
      progressBar.setAttribute('aria-valuemax', '66');
      progressFill.style.width = `${(visibleIndex / 66) * 100}%`;
    } else {
      const finalIndex = flowIndex - scoredQuestions.length + 1;
      questionPosition.textContent = `FINAL CHECK ${finalIndex} / 2`;
      progressBar.setAttribute('aria-label', 'Final check progress');
      progressBar.setAttribute('aria-valuemin', '0');
      progressBar.setAttribute('aria-valuenow', String(finalIndex));
      progressBar.setAttribute('aria-valuemax', '2');
      progressFill.style.width = `${(finalIndex / 2) * 100}%`;
    }

    backButton.hidden = flowIndex === 0;
  }

  function currentQuestion(currentState: QuizState): QuizQuestion | null {
    if (currentState.currentQuestionId === null) return null;
    return dataset.questions.find((question) => question.id === currentState.currentQuestionId) ?? null;
  }

  function showStatus(message: string, tone: 'success' | 'warning' | 'error'): void {
    statusMessage.textContent = message;
    statusMessage.dataset.tone = tone;
    statusMessage.hidden = false;
  }

  function clearStatus(): void {
    statusMessage.hidden = true;
    statusMessage.textContent = '';
    delete statusMessage.dataset.tone;
  }
}

function legacyCopyText(text: string): boolean {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.readOnly = true;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  textarea.style.pointerEvents = 'none';
  document.body.append(textarea);
  textarea.select();
  try {
    const legacyDocument = document as unknown as {
      execCommand?: (commandId: string) => boolean;
    };
    return legacyDocument.execCommand?.('copy') ?? false;
  } finally {
    textarea.remove();
  }
}

function element<T extends HTMLElement>(id: string): T {
  const value = document.getElementById(id);
  if (!value) throw new Error(`Missing required element #${id}.`);
  return value as T;
}

function isTextEntry(target: EventTarget | null): boolean {
  return target instanceof HTMLInputElement
    || target instanceof HTMLTextAreaElement
    || target instanceof HTMLSelectElement;
}

function browserStorage(): StorageLike | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
