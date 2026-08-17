import { computeNormalisationMax } from './dataset';
import { ANSWER_PAYOUT, CURVE_EXPONENT, VIRTUE_CODES } from './types';
import type {
  CompletionSpecialId,
  QuizDataset,
  ScoredQuestion,
  WeightVector,
} from './types';

export interface ValidationIssue {
  path: string;
  message: string;
}

export interface DatasetValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

export interface DatasetValidationOptions {
  mode?: 'production' | 'test';
}

const COMPLETION_SPECIAL_IDS: CompletionSpecialId[] = [
  'all-switch',
  'all-disagree',
  'all-neutral',
  'all-agree',
];

const SOURCE_KINDS = [
  'authorized-export',
  'original-authored',
  'manual-reference',
  'synthetic-test',
] as const;

const PERMISSION_STATUSES = [
  'confirmed',
  'unknown',
  'not-required-original',
  'not-for-production',
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function hasOnlyKeys(value: Record<string, unknown>, expected: readonly string[]): boolean {
  const expectedSet = new Set(expected);
  return Object.keys(value).every((key) => expectedSet.has(key));
}

export function validateQuizDataset(
  input: unknown,
  options: DatasetValidationOptions = {},
): DatasetValidationResult {
  const issues: ValidationIssue[] = [];
  const mode = options.mode ?? 'production';
  const issue = (path: string, message: string) => issues.push({ path, message });

  if (!isRecord(input)) {
    return { valid: false, issues: [{ path: '$', message: 'Dataset must be an object.' }] };
  }

  if (input.schemaVersion !== 1) issue('schemaVersion', 'Expected schema version 1.');
  if (!isNonEmptyString(input.datasetVersion)) {
    issue('datasetVersion', 'Dataset version must be a non-empty string.');
  }
  if (input.curveExponent !== CURVE_EXPONENT) {
    issue('curveExponent', `Expected curve exponent ${CURVE_EXPONENT}.`);
  }

  if (!Array.isArray(input.answerPayout) || input.answerPayout.length !== ANSWER_PAYOUT.length) {
    issue('answerPayout', 'Answer payout must contain exactly five values.');
  } else {
    const answerPayout = input.answerPayout as unknown[];
    ANSWER_PAYOUT.forEach((expected, index) => {
      if (answerPayout[index] !== expected) {
        issue(`answerPayout[${index}]`, `Expected ${expected}.`);
      }
    });
  }

  const scoredQuestions: ScoredQuestion[] = [];
  const ids = new Set<string>();
  const orders = new Set<number>();
  let unscoredCount = 0;

  if (!Array.isArray(input.questions)) {
    issue('questions', 'Questions must be an array.');
  } else {
    if (input.questions.length !== 68) {
      issue('questions', 'Expected exactly 68 flow questions.');
    }

    input.questions.forEach((questionValue, index) => {
      const path = `questions[${index}]`;
      if (!isRecord(questionValue)) {
        issue(path, 'Question must be an object.');
        return;
      }

      if (!isNonEmptyString(questionValue.id)) {
        issue(`${path}.id`, 'Question ID must be a non-empty string.');
      } else if (ids.has(questionValue.id)) {
        issue(`${path}.id`, 'Question ID must be unique.');
      } else {
        ids.add(questionValue.id);
      }

      if (!Number.isInteger(questionValue.order) || Number(questionValue.order) < 1) {
        issue(`${path}.order`, 'Question order must be a positive integer.');
      } else {
        const order = Number(questionValue.order);
        if (orders.has(order)) issue(`${path}.order`, 'Question order must be unique.');
        orders.add(order);
      }

      if (!isNonEmptyString(questionValue.prompt)) {
        issue(`${path}.prompt`, 'Question prompt must be a non-empty string.');
      }

      validateProvenance(questionValue.provenance, `${path}.provenance`, mode, issue);

      if (questionValue.kind === 'scored') {
        if (!Array.isArray(questionValue.labels) || questionValue.labels.length !== 5) {
          issue(`${path}.labels`, 'Scored questions must have five labels.');
        } else {
          questionValue.labels.forEach((label, labelIndex) => {
            if (!isNonEmptyString(label)) {
              issue(`${path}.labels[${labelIndex}]`, 'Answer label must be non-empty.');
            }
          });
        }

        const weights = validateWeights(questionValue.weights, `${path}.weights`, issue);
        if (weights) scoredQuestions.push(questionValue as unknown as ScoredQuestion);
      } else if (questionValue.kind === 'unscored') {
        unscoredCount += 1;
        if (!Array.isArray(questionValue.options) || questionValue.options.length !== 2) {
          issue(`${path}.options`, 'Unscored questions must have exactly two options.');
        } else {
          questionValue.options.forEach((option, optionIndex) => {
            if (!isRecord(option)) {
              issue(`${path}.options[${optionIndex}]`, 'Option must be an object.');
              return;
            }
            if (!isNonEmptyString(option.id)) {
              issue(`${path}.options[${optionIndex}].id`, 'Option ID must be non-empty.');
            }
            if (!isNonEmptyString(option.label)) {
              issue(`${path}.options[${optionIndex}].label`, 'Option label must be non-empty.');
            }
          });
        }
      } else {
        issue(`${path}.kind`, 'Question kind must be scored or unscored.');
      }
    });
  }

  if (scoredQuestions.length !== 66) {
    issue('questions', 'Expected exactly 66 valid scored questions.');
  }
  if (unscoredCount !== 2) {
    issue('questions', 'Expected exactly two unscored questions.');
  }
  for (let order = 1; order <= 68; order += 1) {
    if (!orders.has(order)) issue('questions', `Question order ${order} is missing.`);
  }

  validateCompletionSpecialRules(input.completionSpecialRules, issue);
  validateRoomRule(input.roomRule, issue);

  const suppliedMax = validateWeights(input.normalisationMax, 'normalisationMax', issue, true);
  if (suppliedMax && scoredQuestions.length === 66) {
    const computedMax = computeNormalisationMax(scoredQuestions);
    for (const code of VIRTUE_CODES) {
      if (Math.abs(suppliedMax[code] - computedMax[code]) > 1e-9) {
        issue(
          `normalisationMax.${code}`,
          `Expected computed value ${computedMax[code]}, received ${suppliedMax[code]}.`,
        );
      }
    }
  }

  return { valid: issues.length === 0, issues };
}

export function assertQuizDataset(
  input: unknown,
  options: DatasetValidationOptions = {},
): asserts input is QuizDataset {
  const result = validateQuizDataset(input, options);
  if (!result.valid) {
    const details = result.issues.map((entry) => `${entry.path}: ${entry.message}`).join('\n');
    throw new TypeError(`Invalid quiz dataset:\n${details}`);
  }
}

function validateProvenance(
  value: unknown,
  path: string,
  mode: 'production' | 'test',
  issue: (path: string, message: string) => void,
): void {
  if (!isRecord(value)) {
    issue(path, 'Provenance must be an object.');
    return;
  }

  if (!SOURCE_KINDS.includes(value.sourceKind as (typeof SOURCE_KINDS)[number])) {
    issue(`${path}.sourceKind`, 'Unknown source kind.');
  }
  if (!PERMISSION_STATUSES.includes(
    value.permissionStatus as (typeof PERMISSION_STATUSES)[number],
  )) {
    issue(`${path}.permissionStatus`, 'Unknown permission status.');
  }
  for (const field of ['sourceId', 'sourceVersion', 'obtainedAt'] as const) {
    if (!isNonEmptyString(value[field])) issue(`${path}.${field}`, `${field} must be non-empty.`);
  }

  if (mode === 'production') {
    if (value.sourceKind === 'synthetic-test') {
      issue(`${path}.sourceKind`, 'Synthetic test content is not allowed in production.');
    }
    if (!['confirmed', 'not-required-original'].includes(String(value.permissionStatus))) {
      issue(`${path}.permissionStatus`, 'Production content requires confirmed permission or original authorship.');
    }
  }
}

function validateWeights(
  value: unknown,
  path: string,
  issue: (path: string, message: string) => void,
  requirePositive = false,
): WeightVector | null {
  if (!isRecord(value)) {
    issue(path, 'Weight vector must be an object.');
    return null;
  }
  if (!hasOnlyKeys(value, VIRTUE_CODES)) {
    issue(path, 'Weight vector contains an unknown virtue code.');
  }

  let valid = true;
  const weights = {} as WeightVector;
  for (const code of VIRTUE_CODES) {
    const weight = value[code];
    if (!isFiniteNumber(weight) || (requirePositive && weight <= 0)) {
      issue(`${path}.${code}`, requirePositive ? 'Value must be positive.' : 'Weight must be finite.');
      valid = false;
    } else {
      weights[code] = weight;
    }
  }
  return valid ? weights : null;
}

function validateCompletionSpecialRules(
  value: unknown,
  issue: (path: string, message: string) => void,
): void {
  if (!Array.isArray(value) || value.length !== COMPLETION_SPECIAL_IDS.length) {
    issue('completionSpecialRules', 'Expected exactly four completion special rules.');
    return;
  }

  const rules = new Map<string, Record<string, unknown>>();
  value.forEach((rule, index) => {
    if (!isRecord(rule) || !isNonEmptyString(rule.id)) {
      issue(`completionSpecialRules[${index}]`, 'Rule must have a valid ID.');
      return;
    }
    if (rules.has(rule.id)) issue(`completionSpecialRules[${index}].id`, 'Rule ID must be unique.');
    rules.set(rule.id, rule);
  });

  for (const id of COMPLETION_SPECIAL_IDS) {
    const rule = rules.get(id);
    if (!rule) {
      issue('completionSpecialRules', `Missing ${id} rule.`);
      continue;
    }
    if (id === 'all-switch') {
      if (rule.pattern !== 'halves' || rule.first !== 0 || rule.second !== 4) {
        issue(`completionSpecialRules.${id}`, 'Expected halves pattern 0 then 4.');
      }
    } else {
      const expected = id === 'all-disagree' ? 0 : id === 'all-neutral' ? 2 : 4;
      if (rule.pattern !== 'all' || rule.answer !== expected) {
        issue(`completionSpecialRules.${id}`, `Expected all-answer pattern ${expected}.`);
      }
    }
  }
}

function validateRoomRule(
  value: unknown,
  issue: (path: string, message: string) => void,
): void {
  if (!isRecord(value)) {
    issue('roomRule', 'Room rule must be an object.');
    return;
  }
  if (value.id !== 'room-between') issue('roomRule.id', 'Expected room-between.');
  if (
    !Array.isArray(value.boundary)
    || value.boundary.length !== 2
    || value.boundary[0] !== 57
    || value.boundary[1] !== 58
  ) {
    issue('roomRule.boundary', 'Expected the 57/58 boundary.');
  }
  if (value.probabilityPerCrossing !== 0.02) {
    issue('roomRule.probabilityPerCrossing', 'Expected probability 0.02.');
  }
  if (value.reward !== 'egg') issue('roomRule.reward', 'Expected egg reward.');
}
