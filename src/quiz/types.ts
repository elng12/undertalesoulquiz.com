export const VIRTUE_CODES = ['DET', 'BRV', 'JUS', 'KND', 'PAT', 'INT', 'PER'] as const;
export const ANSWER_PAYOUT = [-1.2, -0.72, 0, 0.6, 1] as const;
export const CURVE_EXPONENT = 0.6 as const;

export type VirtueCode = (typeof VIRTUE_CODES)[number];
export type AnswerValue = 0 | 1 | 2 | 3 | 4;
export type WeightVector = Record<VirtueCode, number>;
export type AnswerPayout = readonly [-1.2, -0.72, 0, 0.6, 1];
export type AnswerLabels = readonly [string, string, string, string, string];

export interface Provenance {
  sourceKind: 'authorized-export' | 'original-authored' | 'manual-reference' | 'synthetic-test';
  sourceId: string;
  sourceVersion: string;
  obtainedAt: string;
  permissionStatus: 'confirmed' | 'unknown' | 'not-required-original' | 'not-for-production';
}

interface QuestionBase {
  id: string;
  order: number;
  prompt: string;
  provenance: Provenance;
}

export interface ScoredQuestion extends QuestionBase {
  kind: 'scored';
  labels: AnswerLabels;
  weights: WeightVector;
}

export interface UnscoredQuestion extends QuestionBase {
  kind: 'unscored';
  options: readonly [
    { id: string; label: string },
    { id: string; label: string },
  ];
  followUps?: ReadonlyArray<{ when: 'yes' | 'no' | 'always'; text: string }>;
}

export type QuizQuestion = ScoredQuestion | UnscoredQuestion;

export type CompletionSpecialId = 'all-switch' | 'all-disagree' | 'all-neutral' | 'all-agree';

export type CompletionSpecialRule =
  | { id: 'all-disagree'; pattern: 'all'; answer: 0 }
  | { id: 'all-neutral'; pattern: 'all'; answer: 2 }
  | { id: 'all-agree'; pattern: 'all'; answer: 4 }
  | { id: 'all-switch'; pattern: 'halves'; first: 0; second: 4 };

export interface RoomRule {
  id: 'room-between';
  boundary: readonly [57, 58];
  probabilityPerCrossing: 0.02;
  reward: 'egg';
}

export interface QuizDataset {
  schemaVersion: 1;
  datasetVersion: string;
  questions: QuizQuestion[];
  completionSpecialRules: CompletionSpecialRule[];
  roomRule: RoomRule;
  answerPayout: AnswerPayout;
  curveExponent: 0.6;
  normalisationMax: WeightVector;
}

export type QuizAnswers = Readonly<Record<string, number | undefined>>;

export interface VirtueScore {
  code: VirtueCode;
  raw: number;
  normalised: number;
  curved: number;
  percentageExact: number;
  percentageDisplay: number;
}

export interface StandardResult {
  kind: 'standard';
  primary: VirtueCode;
  secondary: VirtueCode;
  spread: VirtueScore[];
}

export interface CompletionSpecialResult {
  kind: 'special';
  specialId: CompletionSpecialId;
}

export type QuizResult = StandardResult | CompletionSpecialResult;

export type TypedSecretOutcome = 'flowery' | 'blackout' | 'rename';

export interface TypedSecretRule {
  id: string;
  trigger: string;
  outcome: TypedSecretOutcome;
}
