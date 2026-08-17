import { assertCompleteAnswers, readAnswer } from './answers';
import { getScoredQuestions, virtueCodeIndex } from './dataset';
import { matchCompletionSpecial } from './special-rules';
import { VIRTUE_CODES } from './types';
import type {
  AnswerValue,
  QuizAnswers,
  QuizDataset,
  QuizResult,
  StandardResult,
  VirtueCode,
  VirtueScore,
  WeightVector,
} from './types';

type PayoutIndex = 0 | 1 | 2 | 3 | 4;

export function scoreStandardResult(
  dataset: QuizDataset,
  answers: QuizAnswers,
): StandardResult {
  const raw = Object.fromEntries(VIRTUE_CODES.map((code) => [code, 0])) as WeightVector;

  for (const question of getScoredQuestions(dataset)) {
    const answer = readAnswer(question, answers);
    const lean = answer - 2;

    for (const code of VIRTUE_CODES) {
      const weight = question.weights[code];
      if (weight === 0) continue;
      const payoutIndex = (lean * (weight < 0 ? -1 : 1) + 2) as PayoutIndex;
      const payout = dataset.answerPayout[payoutIndex];
      raw[code] += Math.abs(weight) * payout;
    }
  }

  const spread = VIRTUE_CODES.map((code) => buildVirtueScore(dataset, code, raw[code]));
  spread.sort((left, right) => {
    const difference = right.percentageExact - left.percentageExact;
    return difference || virtueCodeIndex(left.code) - virtueCodeIndex(right.code);
  });

  const primary = spread[0];
  const secondary = spread[1];
  if (!primary || !secondary) throw new Error('A standard result requires at least two virtues.');

  return {
    kind: 'standard',
    primary: primary.code,
    secondary: secondary.code,
    spread,
  };
}

export function resolveQuizResult(dataset: QuizDataset, answers: QuizAnswers): QuizResult {
  assertCompleteAnswers(dataset.questions, answers);
  const specialId = matchCompletionSpecial(dataset, answers);
  if (specialId) return { kind: 'special', specialId };
  return scoreStandardResult(dataset, answers);
}

export function percentageForRawScore(
  raw: number,
  normalisationMax: number,
  curveExponent: number,
): Omit<VirtueScore, 'code' | 'raw'> {
  if (!Number.isFinite(raw)) throw new TypeError('Raw score must be finite.');
  if (!Number.isFinite(normalisationMax) || normalisationMax <= 0) {
    throw new TypeError('Normalisation maximum must be a positive finite number.');
  }

  const normalised = clamp(raw / normalisationMax, -1, 1);
  const curved = normalised < 0
    ? -Math.pow(-normalised, curveExponent)
    : Math.pow(normalised, curveExponent);
  const percentageExact = clamp(((curved + 1) / 2) * 100, 0, 100);

  return {
    normalised,
    curved,
    percentageExact,
    percentageDisplay: Number(percentageExact.toFixed(0)),
  };
}

function buildVirtueScore(
  dataset: QuizDataset,
  code: VirtueCode,
  raw: number,
): VirtueScore {
  return {
    code,
    raw,
    ...percentageForRawScore(raw, dataset.normalisationMax[code], dataset.curveExponent),
  };
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

export function isAnswerValue(value: number): value is AnswerValue {
  return Number.isInteger(value) && value >= 0 && value <= 4;
}
