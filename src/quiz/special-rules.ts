import { getScoredQuestions } from './dataset';
import { readAnswer } from './answers';
import type {
  CompletionSpecialId,
  QuizAnswers,
  QuizDataset,
  RoomRule,
  TypedSecretRule,
  TypedSecretOutcome,
} from './types';

const COMPLETION_ORDER: CompletionSpecialId[] = [
  'all-switch',
  'all-disagree',
  'all-neutral',
  'all-agree',
];

export function matchCompletionSpecial(
  dataset: QuizDataset,
  answers: QuizAnswers,
): CompletionSpecialId | null {
  const scoredQuestions = getScoredQuestions(dataset);
  const values = scoredQuestions.map((question) => readAnswer(question, answers));
  const configured = new Set(dataset.completionSpecialRules.map((rule) => rule.id));
  const half = values.length / 2;

  for (const id of COMPLETION_ORDER) {
    if (!configured.has(id)) continue;
    if (
      id === 'all-switch'
      && values.length % 2 === 0
      && values.slice(0, half).every((value) => value === 0)
      && values.slice(half).every((value) => value === 4)
    ) {
      return id;
    }
    if (id === 'all-disagree' && values.every((value) => value === 0)) return id;
    if (id === 'all-neutral' && values.every((value) => value === 2)) return id;
    if (id === 'all-agree' && values.every((value) => value === 4)) return id;
  }

  return null;
}

export interface RoomCrossingInput {
  fromQuestionOrder: number;
  toQuestionOrder: number;
  hasEgg: boolean;
  random: () => number;
  rule: RoomRule;
}

export function shouldEnterRoom(input: RoomCrossingInput): boolean {
  if (input.hasEgg) return false;
  const [lower, upper] = input.rule.boundary;
  const crossesBoundary =
    (input.fromQuestionOrder === lower && input.toQuestionOrder === upper)
    || (input.fromQuestionOrder === upper && input.toQuestionOrder === lower);

  return crossesBoundary && input.random() < input.rule.probabilityPerCrossing;
}

export interface TypedSecretBufferResult {
  buffer: string;
  matchedRuleId: string | null;
  outcome: TypedSecretOutcome | null;
}

export function appendTypedSecretCharacter(
  buffer: string,
  character: string,
  rules: ReadonlyArray<TypedSecretRule>,
): TypedSecretBufferResult {
  const normalisedCharacter = character.toLowerCase();
  const maxLength = Math.max(0, ...rules.map((rule) => rule.trigger.length));
  if (maxLength === 0) {
    return { buffer: '', matchedRuleId: null, outcome: null };
  }
  const nextBuffer = /^[a-z]$/.test(normalisedCharacter)
    ? `${buffer}${normalisedCharacter}`.slice(-maxLength)
    : buffer.slice(-maxLength);
  const match = rules.find((rule) => nextBuffer.endsWith(rule.trigger.toLowerCase()));

  return {
    buffer: match ? '' : nextBuffer,
    matchedRuleId: match?.id ?? null,
    outcome: match?.outcome ?? null,
  };
}
